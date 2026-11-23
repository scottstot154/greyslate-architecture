import { env } from "cloudflare:workers";
import { desc, eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { projects, settings } from "../db/schema";
import { defaultStudio, samples, type Project, type ProjectEntry, type Studio } from "./portfolio";

export async function loadPortfolio() {
  const [stored, studio] = await Promise.all([loadEntries(), loadStudio()]);
  const visible = stored.filter((item) => item.published && (studio.showSamples || !item.project.demo));
  return { studio, projects: visible.map((item) => item.project) };
}

export async function loadEntries(): Promise<ProjectEntry[]> {
  const saved = env.DB ? await getDb().select().from(projects).orderBy(desc(projects.updatedAt)).all() : [];
  const assigned = new Set(saved.map(({slug}) => slug));
  return [
    ...saved.map(({content, published, updatedAt}) => ({project: content, published, updatedAt})),
    ...samples.filter(({slug}) => !assigned.has(slug)).map((project) => ({project, published: true, updatedAt: null})),
  ];
}

export async function loadStudio(): Promise<Studio> {
  if (!env.DB) return defaultStudio;
  const row = await getDb().select().from(settings).where(eq(settings.id, 1)).get();
  return row?.content ?? defaultStudio;
}

export async function saveStudio(studio: Studio) {
  await getDb().insert(settings).values({id: 1, content: studio})
    .onConflictDoUpdate({target: settings.id, set: {content: studio}});
}

export async function saveProject(project: Project, published: boolean, revision: string | null) {
  const updatedAt = new Date().toISOString();
  const values = {content: project, published, updatedAt};
  const rows = revision === null
    ? await getDb().insert(projects).values({slug: project.slug, ...values}).onConflictDoNothing().returning({slug: projects.slug})
    : await getDb().update(projects).set(values)
        .where(and(eq(projects.slug, project.slug), eq(projects.updatedAt, revision))).returning({slug: projects.slug});
  return rows.length ? updatedAt : null;
}
