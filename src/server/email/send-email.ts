export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  delivered: boolean;
  provider: "resend" | "console";
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() ?? "FitBook <onboarding@resend.dev>";
  const text = input.text ?? stripHtml(input.html);

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[fitbook] Email (no RESEND_API_KEY)\n  To: ${input.to}\n  Subject: ${input.subject}\n  ${text}`,
      );
    }
    return { delivered: false, provider: "console" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[fitbook] Resend failed (${res.status}): ${body}`);
    return { delivered: false, provider: "resend" };
  }

  return { delivered: true, provider: "resend" };
}
