import type { Metadata } from "next";
import CollectionView from "@/components/discovery/CollectionView";
import { EXPERIENCES, findCollection } from "@/lib/discovery/collections";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return EXPERIENCES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = findCollection("experience", slug);
  return { title: c ? `${c.title} — What2Watch` : "Experience — What2Watch" };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionView group="experience" slug={slug} />;
}
