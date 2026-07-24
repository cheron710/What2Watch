import Link from "next/link";
import type { Collection, CollectionGroup } from "@/lib/discovery/collections";
import "./hub.css";

/** Grid of collection cards linking into /{group}/{slug} detail views. */
export default function CollectionHub({
  group,
  collections,
}: {
  group: CollectionGroup;
  collections: Collection[];
}) {
  return (
    <div className="hub-grid">
      {collections.map((c, i) => (
        <Link
          key={c.slug}
          href={`/${group}/${c.slug}`}
          className="hub-card"
          style={{ ["--accent" as string]: c.color }}
        >
          <span className="hub-card-num">{String(i + 1).padStart(2, "0")}</span>
          <span className="hub-card-bar" />
          <h3 className="hub-card-title">{c.title}</h3>
          <p className="hub-card-teaser">{c.teaser}</p>
          <p className="hub-card-lede">{c.lede}</p>
          <span className="hub-card-cta">Explore →</span>
        </Link>
      ))}
    </div>
  );
}
