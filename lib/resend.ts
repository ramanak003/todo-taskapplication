import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey && process.env.NODE_ENV === "production") {
  console.error(
    "CRITICAL: Missing RESEND_API_KEY environment variable in PRODUCTION. " +
    "Email notifications will not work. Please add RESEND_API_KEY to your Vercel settings."
  )
}

export const resend = new Resend(resendApiKey || "re_dummy_key")

