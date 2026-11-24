import { Menu } from "lucide-react";
import type { Studio } from "../lib/portfolio";

export function Brand() {
  return <a className="brand" href="/" aria-label="GreySlate home">
    <img src="/images/greyslate-logo.png" alt="" width={1600} height={357}/>
    <small>ARCHITECTURE STUDIO</small>
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
      <div className="footer-meta">
        <a className="plain-link" href="/studio-editor">Studio sign-in</a>
        <span className="developer-credit">Developed with &lt;3 by Amogh</span>
      </div>
    </div>
  </footer>;
}
