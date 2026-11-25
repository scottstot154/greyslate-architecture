import handler from "vinext/server/fetch-handler";

const ACCESS_EMAIL_HEADER = "x-greyslate-access-email";

type AccessExecutionContext = ExecutionContext & {
  access?: {
    getIdentity(): Promise<{ email?: string } | null>;
  };
};

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: AccessExecutionContext) {
    const authenticatedRequest = new Request(request);
    authenticatedRequest.headers.delete(ACCESS_EMAIL_HEADER);

    const identity = await ctx.access?.getIdentity();
    const hostname = new URL(request.url).hostname;
    const localEmail = hostname === "localhost" || hostname === "127.0.0.1"
      ? env.GREYSLATE_LOCAL_EDITOR_EMAIL
      : undefined;
    const editorEmail = identity?.email ?? localEmail;
    if (editorEmail) authenticatedRequest.headers.set(ACCESS_EMAIL_HEADER, editorEmail);

    return handler.fetch(authenticatedRequest, env, ctx);
  },
};

export default worker;
