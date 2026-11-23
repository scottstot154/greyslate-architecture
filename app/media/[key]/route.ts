import { env } from "cloudflare:workers";
import { getEditorAccess } from "../../../lib/editor-access";
import { loadPortfolio } from "../../../lib/project-store";
import type { Project } from "../../../lib/portfolio";

function hasImage(project: Project, src: string) {
  return project.cover.src === src ||
    project.gallery.some((photo) => photo.src === src) ||
    project.updates.some((update) => update.image?.src === src) ||
    project.comparison?.before.src === src || project.comparison?.after.src === src;
}

export async function GET(_request: Request, {params}: {params: Promise<{key: string}>}) {
  const {key} = await params;
  if (!env.BUCKET || !/^[a-f0-9-]{36}\.(jpg|webp|png|avif)$/.test(key)) return new Response(null, {status: 404});
  const {projects} = await loadPortfolio();
  if (!projects.some((project) => hasImage(project, `/media/${key}`)) && !(await getEditorAccess()).allowed) {
    return new Response(null, {status: 404, headers: {"Cache-Control": "private, no-store"}});
  }
  const object = await env.BUCKET.get(key);
  if (!object) return new Response(null, {status: 404});
  const headers = new Headers({"Cache-Control": "private, no-cache", "X-Content-Type-Options": "nosniff"});
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  if (_request.headers.get("if-none-match") === object.httpEtag) return new Response(null, {status: 304, headers});
  return new Response(object.body, {headers});
}
