import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { trainerAvatarUrls } from "@/lib/media-urls";
type Testimonial = {
    id: string;
    name: string;
    role: string;
    rating: number;
    quote: string;
    tag?: string;
    avatarIndex: number;
};
const testimonials: Testimonial[] = [
    {
        id: "c1",
        name: "Lejla H.",
        role: "Client",
        rating: 5,
        quote: "I compared three coaches in one evening and booked the one that matched my schedule. Way faster than DMing people on Instagram.",
        tag: "Booking",
        avatarIndex: 2,
    },
    {
        id: "c2",
        name: "Damir K.",
        role: "Client",
        rating: 5,
        quote: "Reminders and suggested slots mean I actually show up. Rescheduling doesn’t turn into a 20-message thread anymore.",
        tag: "Booking",
        avatarIndex: 3,
    },
    {
        id: "c3",
        name: "Ana M.",
        role: "Client",
        rating: 5,
        quote: "Seeing sessions and small wins in one place keeps me honest. It’s the first time I’ve stuck with training for more than a month.",
        tag: "Progress tracking",
        avatarIndex: 4,
    },
    {
        id: "t1",
        name: "Marcus T.",
        role: "Coach",
        rating: 5,
        quote: "Clients, bookings, and notes finally live in one dashboard. I’m not losing requests in WhatsApp at 10pm.",
        tag: "Client management",
        avatarIndex: 0,
    },
    {
        id: "t2",
        name: "Nina K.",
        role: "Coach",
        rating: 5,
        quote: "AI draft reminders for no-shows and follow-ups save me maybe an hour a week. I tweak and send — good enough for real life.",
        tag: "AI reminders",
        avatarIndex: 1,
    },
    {
        id: "t3",
        name: "Amara S.",
        role: "Coach",
        rating: 4,
        quote: "The layout is calmer than juggling spreadsheets and DMs. New clients get a clear path from inquiry to first session.",
        tag: "Client management",
        avatarIndex: 5,
    },
];
function StarRow({ rating }: {
    rating: number;
}) {
    const rounded = Math.round(Math.min(5, Math.max(1, rating)));
    return (<div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className={cn("size-3.5 shrink-0 sm:size-4", i <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted/40 text-muted-foreground/35")} aria-hidden/>))}
    </div>);
}
export function LandingTestimonials() {
    return (<section id="testimonials" className="border-b border-border/80 bg-muted/25 py-12 sm:py-20" aria-labelledby="testimonials-heading">
      <div className="mx-auto min-w-0 max-w-6xl px-3 min-[400px]:px-4 sm:px-6">
        <div className="mb-8 max-w-2xl space-y-3 sm:mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Reviews</p>
          <h2 id="testimonials-heading" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Trusted by clients and coaches
          </h2>
          <p className="text-muted-foreground">
            Real feedback on finding the right coach, staying consistent, and running a calmer coaching business.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {testimonials.map((t) => {
            const src = trainerAvatarUrls[t.avatarIndex % trainerAvatarUrls.length] ?? trainerAvatarUrls[0];
            return (<article key={t.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-md sm:p-6">
                <div className="flex items-start gap-3">
                  <Image src={src} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full border border-border/80 object-cover shadow-sm" sizes="44px"/>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate font-medium text-foreground">{t.name}</p>
                      <span className="text-border">·</span>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                    <StarRow rating={t.rating}/>
                  </div>
                </div>
                {t.tag ? (<p className="mt-3">
                    <span className="inline-flex rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {t.tag}
                    </span>
                  </p>) : null}
                <blockquote className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  <p>&ldquo;{t.quote}&rdquo;</p>
                </blockquote>
              </article>);
        })}
        </div>
      </div>
    </section>);
}
