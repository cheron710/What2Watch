import React from "react";
import "./editorial.css";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Editorial page header — the magazine-style eyebrow + serif title + lede
 * used at the top of every discovery page. Reused everywhere to keep the
 * typographic rhythm identical across the platform.
 */
export default function PageHeader({ eyebrow, title, lede, children }: PageHeaderProps) {
  return (
    <header className="ed-header">
      <div className="ed-container">
        <span className="ed-eyebrow">{eyebrow}</span>
        <h1 className="ed-title">{title}</h1>
        {lede && <p className="ed-lede">{lede}</p>}
        {children}
      </div>
    </header>
  );
}
