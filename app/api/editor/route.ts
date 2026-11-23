import { z } from "zod";
import { guardEditorWrite } from "../../../lib/editor-access";
import { projectSchema, samples, studioSchema } from "../../../lib/portfolio";
import { saveProject, saveStudio } from "../../../lib/project-store";

const revisionSchema = z.string().datetime().nullable();
const studioWriteSchema = z.object({type: z.literal("studio"), studio: studioSchema});

export async function PUT(request: Request) {
  const denied = await guardEditorWrite(request);
  if (denied) return denied;
  const input = await request.json().catch(() => null);
  if (input && typeof input === "object" && "type" in input && input.type === "studio") {
    const result = studioWriteSchema.safeParse(input);
    if (!result.success) return Response.json({message: "Check the email and studio location."}, {status: 400});
    await saveStudio(result.data.studio);
    return Response.json({studio: result.data.studio});
  }
  const result = z.object({project: projectSchema, published: z.boolean(), revision: revisionSchema}).safeParse(input);
  if (!result.success) {
    const {path, message} = result.error.issues[0];
    return Response.json({message: `${path.join(".")}: ${message}`}, {status: 400});
  }
  const {project, published, revision} = result.data;
  if (revision === null && samples.some((sample) => sample.slug === project.slug && !project.demo)) {
    return Response.json({message: "That URL belongs to an illustrative project. Choose another slug."}, {status: 409});
  }
  const updatedAt = await saveProject(project, published, revision);
  if (!updatedAt) return Response.json({message: "This project changed since you opened it, or the URL is already in use. Reload before editing it."}, {status: 409});
  return Response.json({project, published, updatedAt});
}
