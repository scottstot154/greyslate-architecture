"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { categories } from "../lib/portfolio";

export default function Contact({email}: {email: string}) {
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = `Project inquiry: ${values.get("type")}`;
    const body = `Name: ${values.get("name")}\nEmail: ${values.get("email")}\nProject location: ${values.get("location") || "Not yet decided"}\n\n${values.get("message")}`;
    setDraft(`Subject: ${subject}\n\n${body}`);
    setCopied(false);
    if (email) window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return <section id="contact" className="contact-section section">
    <div className="shell contact-grid">
      <div>
        <p className="eyebrow"><span/> CONTACT</p>
        <h2>Tell us what you’re planning.</h2>
        <p className="section-lede">Whether you have a site in mind or are still working out the brief, we’d be glad to hear from you.</p>
        {email && <a className="email-link" href={`mailto:${email}`}><Mail size={18}/> {email}</a>}
      </div>
      <form className="inquiry-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Your name<input name="name" autoComplete="name" maxLength={100} required/></label>
          <label>Email<input type="email" name="email" autoComplete="email" required/></label>
          <label>Project category<select name="type" defaultValue="" required><option value="" disabled>Select category</option>
            {categories.map((category) => <option key={category}>{category}</option>)}<option>Not sure yet</option>
          </select></label>
          <label>Project location<input name="location" maxLength={160} placeholder="City or region"/></label>
        </div>
        <label>Tell us about the project<textarea name="message" rows={4} maxLength={1600} required/></label>
        <button className="button button-primary" type="submit"><Mail size={17}/>{email ? "Open email draft" : "Preview inquiry draft"}</button>
        {!email && <p className="form-note">The studio email is not configured in this preview.</p>}
        {draft && <div className="inquiry-draft">
          <label>Inquiry draft<textarea readOnly value={draft} rows={5}/></label>
          <button className="button button-outline" type="button" onClick={async () => {
            try {await navigator.clipboard.writeText(draft); setCopied(true);} catch {setCopied(false);}
          }}>{copied ? "Copied" : "Copy draft"}</button>
        </div>}
      </form>
    </div>
  </section>;
}
