import type { Metadata } from "next";
import Link from "next/link";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";

export const metadata: Metadata = {
  title: "Privacy & policy",
  description: "Privacy, cookies, and terms of service for FitBook AI.",
};

export default function PrivacyPage() {
  return (
    <>
      <SitePageShell
        title="Privacy & policy"
        heroImage={{
          src: fitnessImages.deskDocument,
          alt: "Notebook and pen on a desk",
        }}
        maxWidth="wide"
      >
        <p className="text-foreground">
          Last updated: May 2026. This page describes how FitBook AI handles information in the
          demo application. It is not legal advice. For a production deployment you should review
          these points with counsel and align them with your jurisdiction.
        </p>

        <p>
          <strong className="text-foreground">What we collect.</strong> When you create an account we
          store your email, password hash, name, and role (client or coach). Coaches may add profile
          text, services, availability, and CRM notes about clients. Clients may store goals, profile
          details, and booking notes. Session and booking records include times, status, service, and
          price. If you use AI features, prompts and responses may be processed by OpenAI when an API
          key is configured.
        </p>

        <p>
          <strong className="text-foreground">How we use it.</strong> Data is used to run the
          product: authentication, showing your dashboard, matching bookings to the right coach and
          client, notifications, and optional AI assistance. We do not sell personal data. We do not
          run advertising networks in this application.
        </p>

        <p>
          <strong className="text-foreground">Cookies and sessions.</strong> FitBook uses HTTP-only
          session cookies so you stay signed in securely. These cookies are required for the app to
          work. We do not use third-party tracking cookies on the marketing pages in this build.
        </p>

        <p>
          <strong className="text-foreground">Health and sensitive information.</strong> Do not enter
          medical diagnoses or other sensitive health data in free-text fields unless you and your
          coach have agreed on a secure process. Coaches are responsible for how they handle client
          information offline.
        </p>

        <p>
          <strong className="text-foreground">Retention and deletion.</strong> In a hosted demo,
          data lives in the database you connect (for example Neon or Supabase). Deleting your
          account or resetting the demo database removes associated rows according to the schema
          cascade rules. Production operators should document backup, export, and erasure
          procedures for their users.
        </p>

        <p>
          <strong className="text-foreground">Third parties.</strong> Optional integrations may
          include OpenAI (AI assistant), Resend (transactional email), and your database host.
          Their policies apply when those services are enabled. Map embeds on the Contact page load
          content from OpenStreetMap.
        </p>

        <p id="terms">
          <strong className="text-foreground">Terms of service.</strong> FitBook is provided for
          coaching businesses and their clients. You agree to provide accurate account information,
          respect booking and cancellation rules you publish, and comply with applicable law. Coaches
          are responsible for the services they offer and for client relationships. The software is
          offered as-is in demo form; availability and features may change. We may update these terms;
          continued use after changes means you accept the revised terms.
        </p>

        <p>
          Questions about privacy or terms? Use{" "}
          <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact
          </Link>{" "}
          and we will respond on the channels listed there.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>
  );
}
