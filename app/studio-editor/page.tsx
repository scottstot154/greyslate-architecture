import { Header } from "../../components/brand";
import Editor from "../../components/studio-editor";
import { getEditorAccess } from "../../lib/editor-access";
import { loadEntries, loadStudio } from "../../lib/project-store";

export const dynamic = "force-dynamic";
export const metadata = {title: "Studio editor", robots: {index: false, follow: false}};

export default async function EditorPage() {
  const access = await getEditorAccess();
  const data = access.allowed ? await Promise.all([loadEntries(), loadStudio()]) : null;
  return <><Header/><main className="shell section editor-page" id="main">
    <p className="eyebrow"><span/> GREYSLATE STUDIO</p><h1>Portfolio editor</h1>
    {data ? <Editor initialEntries={data[0]} initialStudio={data[1]}/> : <div className="editor-access">
      <p>{!access.configured ? "The studio editor email has not been configured." : access.signedIn ? "This account does not have studio editor access." : "Cloudflare Access is not configured for this editor path."}</p>
    </div>}
  </main></>;
}
