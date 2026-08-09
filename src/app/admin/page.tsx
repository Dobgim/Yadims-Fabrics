import { redirect } from "next/navigation";

/**
 * The dashboard opens on the fabrics list.
 *
 * There was an overview screen here with revenue charts, order counts and
 * stock warnings. For a shop run by one person it was a wall of zeroes in
 * front of the only screen that actually gets used, so `/admin` now goes
 * straight to the fabrics.
 */
export default function AdminIndexPage() {
  redirect("/admin/products");
}
