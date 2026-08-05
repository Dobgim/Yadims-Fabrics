import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a YADIMS account to follow your orders and save your wishlist.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
