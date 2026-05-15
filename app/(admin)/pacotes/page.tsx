import { getPacks } from "@/lib/data/packs";
import { PacksListClient } from "./packs-list-client";

export default async function PacksPage() {
  const packs = await getPacks();
  return <PacksListClient packs={packs} />;
}
