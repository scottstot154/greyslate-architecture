"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { categories, type Project } from "../lib/portfolio";

export default function ProjectBrowser({projects}: {projects: Project[]}) {
  const [category, setCategory] = useState("All projects");
  const [status, setStatus] = useState("Any stage");
  const visible = projects.filter((project) =>
    (category === "All projects" || project.category === category) &&
    (status === "Any stage" || (status === "Completed" ? project.stage === "Completed" : project.stage !== "Completed"))
  );
  return <>
    <div className="filter-bar">
      <div className="category-filters" role="group" aria-label="Project category">
        {["All projects", ...categories].map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <label className="select-wrap">
        <span className="sr-only">Project stage</span>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option>Any stage</option><option>Ongoing</option><option>Completed</option>
        </select>
        <ChevronDown size={15} aria-hidden="true"/>
      </label>
    </div>
    <p className="sr-only" role="status">{visible.length} {visible.length === 1 ? "project" : "projects"} shown</p>
    {visible.length ? <div className="project-grid">
      {visible.map((project) => (
        <article key={project.slug} className="project-tile">
          <a href={`/projects/${project.slug}`}>
            <div className="tile-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.cover.src} alt={project.cover.alt} loading="lazy" decoding="async"/>
              <span className={`stage-badge ${project.stage === "Completed" ? "complete" : "ongoing"}`}>{project.stage}</span>
            </div>
            <p className="tile-meta">{project.category} <span aria-hidden="true">/</span> {project.location}</p>
            <h3>{project.title}</h3>
            <p className="tile-description">{project.summary}</p>
          </a>
        </article>
      ))}
    </div> : <div className="empty-state">
      <p>{projects.length ? "No projects match these filters." : "No projects have been published yet."}</p>
      {projects.length > 0 && <button className="button button-outline" onClick={() => {setCategory("All projects"); setStatus("Any stage");}}>Clear filters</button>}
    </div>}
  </>;
}
