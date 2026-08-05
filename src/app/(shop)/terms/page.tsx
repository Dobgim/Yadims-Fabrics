import type { Metadata } from "next";

import { legalDocuments } from "@/data/legal";
import { LegalPage } from "@/components/legal/legal-page";

const document = legalDocuments["terms"];

export const metadata: Metadata = {
  title: document.title,
  description: document.summary,
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage document={document} />;
}
