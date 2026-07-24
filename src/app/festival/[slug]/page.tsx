import type { Metadata } from "next";
import CollectionView from "@/components/discovery/CollectionView";
import { FESTIVALS, findCollection } from "@/lib/discovery/collections";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return FESTIVALS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = findCollection("festival", slug);
  return { title: c ? `${c.title} — What2Watch` : "Festival — What2Watch" };
}

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionView group="festival" slug={slug} />;
}
