import type { Metadata } from "next";

import { getMyAddresses } from "@/lib/queries/account";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage() {
  const addresses = await getMyAddresses();
  return <AddressManager addresses={addresses} />;
}
