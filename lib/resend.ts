import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey && process.env.NODE_ENV === "production") {
  console.warn(
    "Warning: Missing RESEND_API_KEY environment variable. Email notifications will not work."
  )
}

export const resend = new Resend(resendApiKey || "re_dummy_key")

