import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Replicate from "replicate"
import { getPlan, isUnlimited } from "@/lib/plans"

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const REPLICATE_MODEL = process.env.REPLICATE_MODEL ?? "black-forest-labs/flux-kontext-pro"

const stylePrompts: Record<string, string> = {
  professional:
    "Transform this person into a highly polished professional corporate headshot. Wear a sharp business suit or blazer, neutral grey or dark background, soft studio lighting, confident and approachable expression, ultra-sharp focus, photorealistic, LinkedIn-ready.",
  creative:
    "Transform this person into a modern creative professional headshot. Contemporary smart-casual attire, subtle gradient background, artistic side lighting, confident expression with a hint of personality, vibrant yet professional, photorealistic.",
  warm:
    "Transform this person into a warm, friendly professional headshot. Smart casual attire, soft natural lighting, blurred outdoor or light background, genuine approachable smile, warm tones, photorealistic, perfect for personal branding.",
  minimal:
    "Transform this person into a minimalist professional headshot. Clean white or off-white background, perfectly balanced studio lighting, neutral or business-casual attire, calm confident expression, ultra-clean crisp look, photorealistic.",
}

export async function POST(request: NextRequest) {
  try {
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN is not configured in .env" }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch profile including plan to enforce limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }

    const plan = getPlan(profile.plan)
    const unlimited = isUnlimited(profile.credits)

    // Enforce credit limit (skip check for unlimited plans)
    if (!unlimited && profile.credits < 1) {
      return NextResponse.json(
        { error: "No credits remaining. Please upgrade your plan." },
        { status: 402 }
      )
    }

    const { headshotId, imageUrl, style, customPrompt } = await request.json()

    if (!headshotId || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Enforce style access — free plan only gets "professional"
    const premiumStyles = ["creative", "warm", "minimal"]
    if (!plan.premiumStyles && premiumStyles.includes(style)) {
      return NextResponse.json(
        { error: "Premium styles require a Pro or Business plan. Please upgrade." },
        { status: 402 }
      )
    }

    // Build the generation prompt — include resolution and watermark hints
    const baseStylePrompt = stylePrompts[style] ?? stylePrompts.professional
    const resolutionHint = plan.resolution === "4K"
      ? "Ultra high resolution, 4K quality, razor sharp details."
      : "Standard resolution, clean and crisp."
    const watermarkHint = plan.watermark
      ? 'Add a small subtle watermark text "PortraifyAI" in the bottom-right corner.'
      : ""
    const fullPrompt = [
      baseStylePrompt,
      resolutionHint,
      watermarkHint,
      customPrompt ? `Additional details: ${customPrompt}.` : "",
      "Preserve the person's facial features, skin tone, and identity exactly. Generate a single portrait-orientation photorealistic image.",
    ]
      .filter(Boolean)
      .join(" ")

    // Call Replicate
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })

    console.log("[generate] Calling Replicate model:", REPLICATE_MODEL)
    console.log("[generate] Input image URL:", imageUrl)

    const output = await replicate.run(REPLICATE_MODEL as `${string}/${string}`, {
      input: {
        prompt: fullPrompt,
        input_image: imageUrl,
      },
    })

    // Log everything so we can debug the exact shape
    console.log("[generate] Replicate raw output:", JSON.stringify(output, null, 2))
    console.log("[generate] Output type:", typeof output)
    console.log("[generate] Is array:", Array.isArray(output))

    // Resolve the output URL — handles string, array, object with .url()
    let outputUrl: string | null = null

    if (typeof output === "string") {
      outputUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      const first = output[0]
      if (typeof first === "string") {
        outputUrl = first
      } else if (first && typeof (first as any).url === "function") {
        outputUrl = await (first as any).url()
      } else if (first && typeof (first as any).url === "string") {
        outputUrl = (first as any).url
      }
    } else if (output && typeof (output as any).url === "function") {
      outputUrl = await (output as any).url()
    } else if (output && typeof (output as any).url === "string") {
      outputUrl = (output as any).url
    }

    console.log("[generate] Resolved outputUrl:", outputUrl)

    if (!outputUrl) {
      throw new Error(
        `Replicate returned an unexpected output format. Raw output: ${JSON.stringify(output)}`
      )
    }

    // Fetch the generated image and upload it to Supabase Storage
    const generatedRes = await fetch(outputUrl)
    if (!generatedRes.ok) throw new Error("Failed to fetch generated image from Replicate")

    const generatedBuffer = Buffer.from(await generatedRes.arrayBuffer())
    const imgMime = generatedRes.headers.get("content-type") ?? "image/webp"
    const ext = imgMime.split("/")[1] ?? "webp"
    const fileName = `${user.id}/generated_${headshotId}.${ext}`

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("headshots")
      .upload(fileName, generatedBuffer, {
        contentType: imgMime,
        upsert: true,
      })

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

    const { data: publicUrlData } = supabase.storage
      .from("headshots")
      .getPublicUrl(uploadData.path)

    const resultUrl = publicUrlData.publicUrl

    // Update headshot record with result
    await supabase
      .from("headshots")
      .update({ result_image_url: resultUrl, status: "completed" })
      .eq("id", headshotId)
      .eq("user_id", user.id)

    // Deduct one credit — skip for unlimited (business) plans
    if (!unlimited) {
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", user.id)
    }

    return NextResponse.json({ resultUrl })
  } catch (err) {
    console.error("[generate] Error:", err)
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}