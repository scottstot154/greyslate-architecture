import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { evaluateEditorAccess } from "./editor-policy";

const ACCESS_EMAIL_HEADER = "x-greyslate-access-email";

export async function getEditorAccess(requestHeaders?: Headers) {
  const currentHeaders = requestHeaders ?? await headers();
  return evaluateEditorAccess(env.GREYSLATE_EDITOR_EMAIL, currentHeaders.get(ACCESS_EMAIL_HEADER));
}

export async function guardEditorWrite(request: Request) {
  if (request.headers.get("x-greyslate-editor") !== "1" || !(await getEditorAccess(request.headers)).allowed) {
    return Response.json({message: "Studio editor access required."}, {status: 403});
  }
  return null;
}
