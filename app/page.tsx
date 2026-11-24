import { Header, Footer } from "../components/brand";
import ProjectBrowser from "../components/project-browser";
import Contact from "../components/contact";
import { loadPortfolio } from "../lib/project-store";
import { projectDate } from "../lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {projects, studio} = await loadPortfolio();
  const featured = projects.find((project) => project.featured) ?? projects[0];
  const updates = projects.flatMap((project) => project.updates.map((update) => ({project, update})))
    .sort((a, b) => b.update.date.localeCompare(a.update.date)).slice(0, 3);

  return <>
    <Header/>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        {featured && <img className="hero-image" src={featured.cover.src} alt={featured.cover.alt} fetchPriority="high"/>}
        <div className="hero-shade"/>
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span/> INDEPENDENT DESIGN STUDIO</p>
            <h1 id="hero-title">GreySlate<br/>Architecture</h1>
            <p>Architecture, interiors and adaptive reuse, from the first sketch to the finished space.</p>
            <a className="button button-primary" href="#projects">Explore projects</a>
          </div>
          {featured && <a className="hero-caption" href={`/projects/${featured.slug}`}>
            <span>{featured.demo ? "ILLUSTRATIVE PROJECT" : "FEATURED PROJECT"}</span>
            <strong>{featured.title}</strong>
            <span>{featured.category} / {featured.location}</span>
          </a>}
        </div>
      </section>

      <section id="projects" className="shell section work-section" aria-labelledby="work-title">
        <div className="section-heading">
          <div><p className="eyebrow"><span/> PORTFOLIO</p><h2 id="work-title">Selected work</h2></div>
          <p className="section-lede">Homes, workplaces and shared spaces. Explore completed projects and work in progress.</p>
        </div>
        <ProjectBrowser projects={projects}/>
        {projects.some((project) => project.demo) && <p className="sample-note">Illustrative projects and AI-generated imagery for this preview.</p>}
      </section>

      {updates.length > 0 && <section className="shell section journal-section" aria-labelledby="journal-title">
        <p className="eyebrow"><span/> PROJECT JOURNAL</p>
        <h2 id="journal-title">From the site</h2>
        <div className="journal-list">
          {updates.map(({project, update}, index) => <article className="journal-row" key={`${project.slug}-${update.date}-${index}`}>
            <time dateTime={update.date}>{projectDate(update.date)}</time>
            <div><a className="plain-link" href={`/projects/${project.slug}#progress`}><h3>{update.title}</h3></a>
            <p>{update.note}</p></div><span>{project.title}</span>
          </article>)}
        </div>
      </section>}

      <section id="studio" className="studio-section section">
        <div className="shell studio-grid">
          <div><p className="eyebrow"><span/> THE STUDIO</p><h2>About GreySlate</h2>
          <p className="section-lede">We design around the way people live, work and gather, with attention to what can be kept as well as what needs to change.</p></div>
          <ul className="services-list">
            <li>Architecture</li><li>Interior design</li><li>Renovation &amp; adaptive reuse</li><li>Master planning</li>
          </ul>
        </div>
      </section>
      <Contact email={studio.email}/>
    </main>
    <Footer studio={studio}/>
  </>;
}
