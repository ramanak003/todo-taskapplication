import { NextResponse } from "next/server"
import { resend } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      to,
      subject,
      html,
      text,
      from = "Ramana Tasks <notifications@ramana-tasks.vercel.app>",
    } = body as {
      to?: string | string[]
      subject?: string
      html?: string
      text?: string
      from?: string
    }

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Required: to, subject, and html or text.",
        },
        { status: 400 }
      )
    }

    // Build email payload with proper typing
    const response = await resend.emails.send({
      from,
      to,
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    } as any)

    return NextResponse.json(
      {
        id: response.data?.id,
        message: "Notification email sent",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to send email notification via Resend:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send notification",
      },
      { status: 500 }
    )
  }
}

