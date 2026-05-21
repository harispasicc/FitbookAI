export async function getStubClientAiReply(userMessage: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 550 + Math.random() * 400));
    const t = userMessage.trim().toLowerCase();
    if (!t) {
        return "Write a short question and I’ll help. Try one of the suggested prompts above.";
    }
    if (t.includes("next") && (t.includes("session") || t.includes("train"))) {
        return "Your next session is listed under **Upcoming** on this dashboard when you have a confirmed booking.";
    }
    if (t.includes("goal") || t.includes("progress")) {
        return "Open **Progress** to see your active goal and completion. Your coach can add structured check-ins as you go.";
    }
    if (t.includes("book") || t.includes("slot") || t.includes("when")) {
        return "Pick a coach from **Find coaches**, open their profile, then use **Book a session** to choose a service and time. Bookings appear under **Sessions**.";
    }
    if (t.includes("hi") || t.includes("hello") || t.includes("hey")) {
        return "Hi! I’m your **FitBook AI** assistant. Ask about sessions, goals, or how booking works.";
    }
    return "Thanks for your message. For answers tied to your schedule and history, check **Sessions** and **Progress**, or message your coach.";
}
