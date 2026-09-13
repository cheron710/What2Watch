/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";

export interface MovieCardProps {
  id?: number;
  index: number;
  title: string;
  director: string;
  quote: string;
  tags: string[];
  rating: string;
  img: string;
}

export default function MovieCard({ id, index, title, director, quote, tags, rating, img }: MovieCardProps) {
  const cardNode = (
    <div className="pick-card cursor-pointer">
      <div className="pick-inner">
        <img className="pick-img" src={img} alt={title} />
        <div className="pick-grad"></div>
        <div className="pick-content">
          <div className="pick-num">{String(index + 1).padStart(2, '0')}</div>
          <div className="pick-title">
            {title} <span className="film-rating">{rating}</span>
          </div>
          <div className="pick-dir">{director}</div>
          <p className="pick-quote">&quot;{quote}&quot;</p>
          <div className="pick-tags">
            {tags.map((t, idx) => (
              <span key={idx} className="tag hi">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (id) {
    return (
      <Link href={`/movie/${id}`} aria-label={title}>
        {cardNode}
      </Link>
    );
  }

  return cardNode;
}
