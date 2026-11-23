import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header, Footer } from "../../../components/brand";
import Compare from "../../../components/compare";
import ProjectGallery from "../../../components/project-gallery";
import { loadPortfolio } from "../../../lib/project-store";
import { projectDate } from "../../../lib/portfolio";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{slug: string}> };

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {slug} = await params;
  const {projects} = await loadPortfolio();
  const project = projects.find((item) => item.slug === slug);
  return project ? {title: project.title, description: project.summary} : {title: "Project not found"};
}

export default async function ProjectPage({params}: Params) {
  const {slug} = await params;
  const {projects, studio} = await loadPortfolio();
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const updates = [...project.updates].sort((a, b) => b.date.localeCompare(a.date));
  const details = {Category: project.category, Location: project.location, Stage: project.stage, Year: project.year, Scope: project.scope};

  return <>
    <Header/>
    <main id="main" className="case-page">
      <div className="shell case-intro">
        <a className="plain-link" href="/#projects">All projects</a>
        <p className="eyebrow"><span/> {project.demo ? "ILLUSTRATIVE PROJECT" : project.category}</p>
        <h1>{project.title}</h1><p className="section-lede">{project.summary}</p>
      </div>
      <figure className="shell case-cover">
        <img src={project.cover.src} alt={project.cover.alt} fetchPriority="high"/>
        <figcaption>{[project.cover.kind, project.cover.credit].filter(Boolean).join(" / ")}</figcaption>
      </figure>
      <section className="shell section case-story">
        <div><p className="eyebrow"><span/> THE PROJECT</p><h2>Design approach</h2>
          {project.story.split(/\n\s*\n/).map((part, i) => <p key={i}>{part}</p>)}
        </div>
        <dl>{Object.entries(details).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>
      {project.gallery.length > 0 && <section className="shell section case-gallery">
        <p className="eyebrow"><span/> IN IMAGES</p><h2>Project gallery</h2>
        <ProjectGallery photos={[project.cover, ...project.gallery]}/>
      </section>}
      {project.comparison && <section className="section renovation-section">
        <div className="shell renovation-grid">
          <div><p className="eyebrow"><span/> RENOVATION</p><h2>Before &amp; after</h2></div>
          <Compare {...project.comparison}/>
        </div>
      </section>}
      {updates.length > 0 && <section id="progress" className="shell section journal-section">
        <p className="eyebrow"><span/> PROJECT JOURNAL</p><h2>Progress updates</h2>
        <div className="journal-list">
          {updates.map((update, index) => <article key={`${update.date}-${index}`} className="journal-row">
            <time dateTime={update.date}>{projectDate(update.date)}</time>
            <div><h3>{update.title}</h3><p>{update.note}</p></div>
            {update.image && <figure className="journal-image"><img src={update.image.src} alt={update.image.alt} loading="lazy"/>
              <figcaption>{[update.image.kind, update.image.credit].filter(Boolean).join(" / ")}</figcaption></figure>}
          </article>)}
        </div>
      </section>}
      <div className="shell case-cta"><a className="button button-outline" href="/#projects">Browse all projects</a>
        <a className="button button-primary" href="/#contact">Discuss your project</a></div>
    </main>
    <Footer studio={studio}/>
  </>;
}
