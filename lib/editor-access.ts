import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";

export async function getEditorAccess() {
  const configuredEmail = env.GREYSLATE_EDITOR_EMAIL?.trim().toLowerCase();
  const user = await getChatGPTUser();
  return { configured: Boolean(configuredEmail), signedIn: Boolean(user), allowed: Boolean(configuredEmail && user?.email.toLowerCase() === configuredEmail) };
}

export async function guardEditorWrite(request: Request) {
  if (request.headers.get("x-greyslate-editor") !== "1" || !(await getEditorAccess()).allowed) {
    return Response.json({message: "Studio editor access required."}, {status: 403});
  }
  return null;
}
