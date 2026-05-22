import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with FitBook AI for bookings, coach onboarding, or product questions.",
};

const SARAJEVO_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=18.365%2C43.828%2C18.462%2C43.885&layer=mapnik&marker=43.8563%2C18.4131";

export default function ContactPage() {
  return (
    <>
      <SitePageShell
        title="Contact"
        maxWidth="wide"
        heroImage={{
          src: fitnessImages.cityAerial,
          alt: "City skyline at dusk, Sarajevo region",
        }}
      >
        <p>
          Whether you train with a coach on FitBook or run sessions for clients, we are happy to
          hear from you. Use the details below for studio visits, account help, or questions about
          how the platform works.
        </p>
        <p>
          <strong className="text-foreground">Clients:</strong> trouble signing in, booking a
          session, or reviewing your schedule? Email us and include the address you use on your
          account.{" "}
          <strong className="text-foreground">Coaches:</strong> ask about listing services,
          availability, or moving from the demo to your own deployment. We usually reply within one
          business day.
        </p>

        <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">FitBook Studio Sarajevo</h2>
            <p className="text-sm text-muted-foreground">
              Our demo studio address. Drop in for a tour or book a first session with a coach
              listed on Find coaches.
            </p>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="font-medium text-foreground">Address</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    FitBook Studio Sarajevo
                    <br />
                    Maršala Tita 28
                    <br />
                    71000 Sarajevo, Bosnia and Herzegovina
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="font-medium text-foreground">Phone</dt>
                  <dd className="mt-0.5">
                    <a
                      href="tel:+38733000111"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      +387 33 000 111
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="font-medium text-foreground">Email</dt>
                  <dd className="mt-0.5">
                    <a
                      href="mailto:studio@fitbook.ai"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      studio@fitbook.ai
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="font-medium text-foreground">Reception hours</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    Monday to Friday, 9:00–18:00 (CET)
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="min-w-0 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Find us</h2>
            <p className="text-sm text-muted-foreground">
              The studio is in central Sarajevo. The map shows the area around our demo location;
              call or email before you visit so we can confirm someone is at reception.
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
              <iframe
                title="Map of Sarajevo, FitBook studio"
                src={SARAJEVO_MAP_EMBED}
                className="aspect-[4/3] w-full min-h-[240px] border-0 lg:min-h-[320px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              <a
                href="https://www.openstreetmap.org/?mlat=43.8563&mlon=18.4131#map=14/43.8563/18.4131"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Open full map
              </a>
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          New to FitBook? Try the{" "}
          <Link href="/login?demo=1" className="font-medium text-primary underline-offset-4 hover:underline">
            client demo
          </Link>{" "}
          or{" "}
          <Link
            href="/trainer/login?demo=1"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            coach demo
          </Link>
          . For privacy and terms, see{" "}
          <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
            Policy
          </Link>
          . Product overview:{" "}
          <Link href="/product" className="font-medium text-primary underline-offset-4 hover:underline">
            Services
          </Link>
          .
        </p>
      </SitePageShell>
      <SiteFooter />
    </>
  );
}
