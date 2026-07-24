import type { Metadata } from "next";
import CollectionView from "@/components/discovery/CollectionView";
import { EMOTIONS, findCollection } from "@/lib/discovery/collections";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return EMOTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = findCollection("emotion", slug);
  return { title: c ? `${c.title} — What2Watch` : "Mood — What2Watch" };
}

export default async function EmotionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionView group="emotion" slug={slug} />;
}
