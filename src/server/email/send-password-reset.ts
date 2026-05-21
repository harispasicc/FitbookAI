import { buildPasswordResetUrl } from "@/server/auth/password-reset";
import { sendEmail } from "@/server/email/send-email";

export async function sendPasswordResetEmail(input: {
  email: string;
  token: string;
}): Promise<{ delivered: boolean; resetUrl: string }> {
  const resetUrl = buildPasswordResetUrl(input.token);

  const result = await sendEmail({
    to: input.email,
    subject: "Reset your FitBook password",
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });

  if (!result.delivered && process.env.NODE_ENV === "development") {
    console.info(
      `[fitbook] Password reset for ${input.email}\n  ${resetUrl}`,
    );
  }

  return { delivered: result.delivered, resetUrl };
}
