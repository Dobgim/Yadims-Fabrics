import type { Metadata } from "next";

import { legalDocuments } from "@/data/legal";
import { LegalPage } from "@/components/legal/legal-page";

const document = legalDocuments["shipping-policy"];

export const metadata: Metadata = {
  title: document.title,
  description: document.summary,
  alternates: { canonical: "/shipping-policy" },
};

export default function Page() {
  return <LegalPage document={document} />;
}
