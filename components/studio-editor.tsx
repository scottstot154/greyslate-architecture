"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { categories, imageKinds, stages, type Photo, type Project, type ProjectEntry, type Studio } from "../lib/portfolio";

const emptyPhoto: Photo = {src: "", alt: "", credit: "", kind: "Photograph"};
const emptyProject: ProjectEntry = {
  project: {slug: "", title: "", category: "Residential", stage: "Concept", location: "", year: "", scope: "", summary: "", story: "",
    cover: emptyPhoto, gallery: [], updates: [], featured: false, demo: false},
  published: false, updatedAt: null,
};

async function editorRequest<T>(url: string, method: string, body: FormData | Record<string, unknown>): Promise<T> {
  const multipart = body instanceof FormData;
  const headers: Record<string, string> = {"x-greyslate-editor": "1"};
  if (!multipart) headers["Content-Type"] = "application/json";
  const response = await fetch(url, {method, headers, body: multipart ? body : JSON.stringify(body)});
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    const message = result && typeof result === "object" && "message" in result && typeof result.message === "string" ? result.message : null;
    throw new Error(message ?? "Could not save your changes. Please try again.");
  }
  return result as T;
}

function PhotoInput({title, photo, onChange, onUpload, required}: {
  title: string; photo: Photo; onChange: (value: Photo) => void; onUpload: (busy: boolean) => void; required: boolean;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return <fieldset className="editor-photo">
    <legend>{title}</legend>
    {photo.src && <img src={photo.src} alt={photo.alt || "Uploaded image preview"}/>}
    <label><span><Upload size={15} aria-hidden="true"/> {photo.src ? "Replace image" : "Upload image"}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;
        setBusy(true);
        onUpload(true);
        setStatus("Uploading…");
        const form = new FormData();
        form.set("image", file);
        try {
          const {src} = await editorRequest<{src: string}>("/api/editor/images", "POST", form);
          onChange({...photo, src});
          setStatus("Uploaded.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Upload failed.");
        } finally {
          setBusy(false);
          onUpload(false);
          input.value = "";
        }
      }}/>
    </label>
    {status && <p role="status" className="form-note">{status}</p>}
    <label>Image description<input value={photo.alt} maxLength={200} onChange={(event) => onChange({...photo, alt: event.target.value})} required={required} disabled={busy}/></label>
    <div className="form-grid">
      <label>Credit<input value={photo.credit} maxLength={160} onChange={(event) => onChange({...photo, credit: event.target.value})} disabled={busy}/></label>
      <label>Image type<select value={photo.kind} onChange={(event) => onChange({...photo, kind: event.target.value as Photo["kind"]})} disabled={busy}>
        {imageKinds.map((kind) => <option key={kind}>{kind}</option>)}
      </select></label>
    </div>
  </fieldset>;
}

function ProjectForm({entry, isNew, onSave, setSaving, onUpload, uploading, savedMessage}: {
  entry: ProjectEntry; isNew: boolean; onSave: (entry: ProjectEntry) => void; setSaving: (busy: boolean) => void;
  onUpload: (busy: boolean) => void; uploading: boolean; savedMessage: string;
}) {
  const [project, setProject] = useState(entry.project);
  const [published, setPublished] = useState(entry.published);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const assign = <K extends keyof Project,>(key: K, value: Project[K]) => setProject((previous) => ({...previous, [key]: value}));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaving(true);
    setMessage("");
    try {
      const saved = await editorRequest<ProjectEntry>("/api/editor", "PUT", {project, published, revision: entry.updatedAt});
      onSave(saved);
      setMessage(null);
    } catch (error) {setMessage(error instanceof Error ? error.message : "Save failed.");}
    finally {setBusy(false); setSaving(false);}
  }
  return <form className="editor-form" onSubmit={submit}><fieldset className="project-fields" disabled={uploading || busy}>
    <legend className="sr-only">Project information</legend>
    <div className="editor-panel-heading"><h2>{isNew ? "New project" : entry.project.title}</h2>
      {!isNew && entry.published && <a className="plain-link" href={`/projects/${entry.project.slug}`}>View project</a>}</div>
    <div className="form-grid">
      <label>Project title<input value={project.title} onChange={(e) => {
        const title = e.target.value;
        setProject((current) => ({...current, title, slug: isNew && (!current.slug || current.slug === toSlug(current.title)) ? toSlug(title) : current.slug}));
      }} maxLength={100} required/></label>
      <label>Project URL slug<input value={project.slug} onChange={(e) => assign("slug", e.target.value)} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" readOnly={!isNew} required/></label>
      <label>Category<select value={project.category} onChange={(e) => assign("category", e.target.value as Project["category"])}>
        {categories.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label>Stage<select value={project.stage} onChange={(e) => assign("stage", e.target.value as Project["stage"])}>
        {stages.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label>City or region<input value={project.location} onChange={(e) => assign("location", e.target.value)} maxLength={100} required={published}/></label>
      <label>Year<input value={project.year} onChange={(e) => assign("year", e.target.value)} inputMode="numeric" pattern="[0-9]{4}" required={published}/></label>
    </div>
    <label>Firm scope<input value={project.scope} onChange={(e) => assign("scope", e.target.value)} maxLength={160} required={published}/></label>
    <label>Summary<textarea rows={2} value={project.summary} onChange={(e) => assign("summary", e.target.value)} maxLength={350} required={published}/></label>
    <label>Design approach<textarea rows={5} value={project.story} onChange={(e) => assign("story", e.target.value)} maxLength={5000} required={published}/></label>
    <PhotoInput title="Cover image" photo={project.cover} onChange={(photo) => assign("cover", photo)} onUpload={onUpload} required={published}/>
    <fieldset className="editor-fieldset">
      <legend>Project gallery</legend>
      {project.gallery.map((photo, index) => <div key={index} className="editor-repeat">
        <PhotoInput title={`Gallery image ${index + 1}`} photo={photo} onUpload={onUpload} required={published}
          onChange={(value) => assign("gallery", project.gallery.map((item, i) => i === index ? value : item))}/>
        <button className="icon-button" type="button" title="Remove gallery image" aria-label={`Remove gallery image ${index + 1}`}
          onClick={() => assign("gallery", project.gallery.filter((_, i) => i !== index))}><Trash2 size={16}/></button>
      </div>)}
      <button className="button button-outline" type="button" disabled={project.gallery.length >= 24} onClick={() => assign("gallery", [...project.gallery, emptyPhoto])}><Plus size={16}/> Add gallery image</button>
    </fieldset>
    <fieldset className="editor-fieldset">
      <legend>Progress updates</legend>
      {project.updates.map((update, index) => {
        const modify = (value: Partial<typeof update>) => assign("updates", project.updates.map((item, i) => i === index ? {...item, ...value} : item));
        return <fieldset key={index} className="editor-photo">
          <legend>Update {index + 1}</legend>
          <div className="form-grid">
            <label>Date<input type="date" value={update.date} onChange={(e) => modify({date: e.target.value})} required={published}/></label>
            <label>Title<input value={update.title} onChange={(e) => modify({title: e.target.value})} maxLength={120} required={published}/></label>
          </div>
          <label>Milestone<textarea rows={3} value={update.note} onChange={(e) => modify({note: e.target.value})} maxLength={1800} required={published}/></label>
          {update.image && <PhotoInput title="Update image" photo={update.image} onChange={(image) => modify({image})} onUpload={onUpload} required={published}/>}
          <div className="editor-actions">
            <button className="button button-outline" type="button" onClick={() => modify({image: update.image ? undefined : {...emptyPhoto, kind: "Site photograph"}})}>
              {update.image ? "Remove update image" : "Add update image"}
            </button>
            <button className="icon-button" type="button" title="Remove update" aria-label={`Remove update ${index + 1}`}
              onClick={() => assign("updates", project.updates.filter((_, i) => i !== index))}><Trash2 size={16}/></button>
          </div>
        </fieldset>;
      })}
      <button className="button button-outline" type="button" disabled={project.updates.length >= 30} onClick={() => assign("updates", [...project.updates, {date: "", title: "", note: ""}])}><Plus size={16}/> Add update</button>
    </fieldset>
    <label className="checkbox-row"><input type="checkbox" checked={project.featured} onChange={(e) => assign("featured", e.target.checked)}/>Feature on homepage</label>
    {project.demo && <p className="form-note">Illustrative sample. Create a new project for real studio work.</p>}
    <label>Visibility<select value={published ? "published" : "draft"} onChange={(e) => setPublished(e.target.value === "published")}>
      <option value="draft">Draft</option><option value="published">Published</option>
    </select></label>
    <div className="editor-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : published ? "Publish project" : entry.published ? "Unpublish to draft" : "Save draft"}</button>
      <p role="status">{message ?? savedMessage}</p></div>
  </fieldset></form>;
}

function toSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
}

function StudioForm({initialStudio, onSave}: {initialStudio: Studio; onSave: (studio: Studio) => void}) {
  const [studio, setStudio] = useState(initialStudio);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="editor-form" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const saved = await editorRequest<{studio: Studio}>("/api/editor", "PUT", {type: "studio", studio});
      onSave(saved.studio);
      setMessage("Studio settings saved.");
    }
    catch (error) {setMessage(error instanceof Error ? error.message : "Save failed.");}
    finally {setBusy(false);}
  }}>
    <h2>Studio settings</h2>
    <label>Public inquiry email<input type="email" value={studio.email} onChange={(e) => setStudio({...studio, email: e.target.value})} maxLength={200}/></label>
    <label>Studio location<input value={studio.location} onChange={(e) => setStudio({...studio, location: e.target.value})} placeholder="City or region" maxLength={120}/></label>
    <label className="checkbox-row"><input type="checkbox" checked={studio.showSamples} onChange={(e) => setStudio({...studio, showSamples: e.target.checked})}/>Show illustrative projects</label>
    <div className="editor-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      <p role="status">{message}</p></div>
  </form>;
}

export default function Editor({initialEntries, initialStudio}: {initialEntries: ProjectEntry[]; initialStudio: Studio}) {
  const [entries, setEntries] = useState(initialEntries);
  const [studio, setStudio] = useState(initialStudio);
  const [selection, setSelection] = useState(initialEntries[0]?.project.slug ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const chosen = entries.find(({project}) => project.slug === selection) ?? emptyProject;
  const choose = (slug: string) => {setSavedMessage(""); setSelection(slug);};
  return <div className="editor-layout">
    <aside className="editor-sidebar">
      <button type="button" className="button button-primary" disabled={uploading || saving} onClick={() => choose("")}><Plus size={16}/> New project</button>
      <button type="button" className="button button-outline" disabled={uploading || saving} aria-pressed={selection === ":studio"} onClick={() => choose(":studio")}>Studio settings</button>
      <nav aria-label="Editable projects">
        {entries.map(({project, published}) => <button key={project.slug} type="button" disabled={uploading || saving} aria-pressed={selection === project.slug} onClick={() => choose(project.slug)}>
          <strong>{project.title}</strong><small>{project.demo ? "Sample / " : ""}{published ? "Published" : "Draft"}</small>
        </button>)}
      </nav>
    </aside>
    {selection === ":studio" ? <StudioForm initialStudio={studio} onSave={setStudio}/> : <ProjectForm key={selection} entry={chosen} isNew={!selection}
      onUpload={setUploading} uploading={uploading} setSaving={setSaving} savedMessage={savedMessage} onSave={(saved) => {
      setEntries((value) => [saved, ...value.filter(({project}) => project.slug !== saved.project.slug)]);
      setSelection(saved.project.slug);
      setSavedMessage(saved.published ? "Project published." : chosen.published ? "Project unpublished. Draft saved." : "Draft saved.");
    }}/>}
  </div>;
}
