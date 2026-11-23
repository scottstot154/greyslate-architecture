import { env } from "cloudflare:workers";
import { guardEditorWrite } from "../../../../lib/editor-access";

const formats: Record<string, string> = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif"};
const maxSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await guardEditorWrite(request);
  if (denied) return denied;
  if (!env.BUCKET) return Response.json({message: "Image storage is unavailable."}, {status: 503});
  if (Number(request.headers.get("content-length")) > maxSize + 65536) {
    return Response.json({message: "Choose an image under 8 MB."}, {status: 413});
  }
  const data = await request.formData().catch(() => null);
  const file = data?.get("image");
  const extension = file instanceof File ? formats[file.type] : undefined;
  if (!(file instanceof File) || !extension || file.size > maxSize || file.size < 12) {
    return Response.json({message: "Choose a JPG, PNG, WebP or AVIF image under 8 MB."}, {status: 400});
  }
  const prefix = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const bytes = (...values: number[]) => values.every((value, i) => prefix[i] === value);
  const text = new TextDecoder().decode(prefix);
  const valid = extension === "jpg" ? bytes(255, 216, 255)
    : extension === "png" ? bytes(137, 80, 78, 71, 13, 10, 26, 10)
    : extension === "webp" ? text.startsWith("RIFF") && text.slice(8, 12) === "WEBP"
    : text.slice(4, 12) === "ftypavif" || text.slice(4, 12) === "ftypavis";
  if (!valid) return Response.json({message: "The selected file is not a recognized image."}, {status: 400});
  const key = `${crypto.randomUUID()}.${extension}`;
  await env.BUCKET.put(key, file.stream(), {httpMetadata: {contentType: file.type}});
  return Response.json({src: `/media/${key}`}, {status: 201});
}
