import { Menu } from "lucide-react";
import type { Studio } from "../lib/portfolio";

export function Brand() {
  return <a className="brand" href="/" aria-label="GreySlate home">
    <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
      <rect width="36" height="36" fill="currentColor"/>
      <path d="M8 26V10h20L13 26H8Zm20 0H17l11-12v12Z" fill="var(--brand-paper, #fff)"/>
    </svg>
    <span><strong>GreySlate</strong><small>ARCHITECTURE STUDIO</small></span>
  </a>;
}

const links = <><a href="/#projects">Projects</a><a href="/#studio">Studio</a><a href="/#contact">Contact</a></>;

export function Header() {
  return <header className="site-header">
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="shell header-inner">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">{links}</nav>
      <a className="button button-outline header-cta" href="/#contact">Start a project</a>
      <details className="mobile-nav">
        <summary aria-label="Main navigation"><Menu size={24}/></summary>
        <nav aria-label="Main navigation">{links}</nav>
      </details>
    </div>
  </header>;
}

export function Footer({studio}: {studio: Studio}) {
  return <footer className="site-footer">
    <div className="shell footer-inner">
      <Brand />
      <span>{studio.location || "Architecture · Interiors · Adaptive reuse"}</span>
      <a className="plain-link" href="/studio-editor">Studio sign-in</a>
    </div>
  </footer>;
}
