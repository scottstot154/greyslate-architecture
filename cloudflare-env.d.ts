declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    GREYSLATE_EDITOR_EMAIL?: string;
  }
}
