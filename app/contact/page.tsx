import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "Contact",
    description: "Visit or write to FitBook AI. Sarajevo studio contact details.",
};
const SARAJEVO_MAP_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=18.365%2C43.828%2C18.462%2C43.885&layer=mapnik&marker=43.8563%2C18.4131";
export default function ContactPage() {
    return (<>
      <SitePageShell title="Contact" maxWidth="wide" heroImage={{
            src: fitnessImages.cityAerial,
            alt: "City skyline at dusk, Sarajevo region",
        }}>
        <p>
          Reach the studio team for partnerships, product questions, or studio onboarding. Update these contact
          details in your deployment when you go live.
        </p>

        <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Studio</h2>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
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
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                <div>
                  <dt className="font-medium text-foreground">Phone</dt>
                  <dd className="mt-0.5">
                    <a href="tel:+38733000111" className="text-primary underline-offset-4 hover:underline">
                      +387 33 000 111
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                <div>
                  <dt className="font-medium text-foreground">Email</dt>
                  <dd className="mt-0.5">
                    <a href="mailto:studio@fitbook.ai" className="text-primary underline-offset-4 hover:underline">
                      studio@fitbook.ai
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                <div>
                  <dt className="font-medium text-foreground">Hours</dt>
                  <dd className="mt-0.5 text-muted-foreground">Mon–Fri · 09:00–18:00 (CET)</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="min-w-0 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Location</h2>
            <p className="text-sm text-muted-foreground">Map centred on Sarajevo. Illustrative pin only.</p>
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
              <iframe title="Map of Sarajevo, FitBook studio" src={SARAJEVO_MAP_EMBED} className="aspect-[4/3] w-full min-h-[240px] border-0 lg:min-h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              <a href="https://www.openstreetmap.org/?mlat=43.8563&mlon=18.4131#map=14/43.8563/18.4131" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                View larger map
              </a>
            </p>
          </div>
        </div>

        <p className="text-sm">
          Product feedback: note what you would change in the{" "}
          <Link href="/#features" className="font-medium text-primary underline-offset-4 hover:underline">
            features
          </Link>{" "}
          section on the home page.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>);
}
