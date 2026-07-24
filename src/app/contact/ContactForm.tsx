"use client";

import { useState } from "react";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(2, "Please tell us your name."),
  email: z.string().email("Please enter a valid email."),
  subject: z.string().min(2, "Add a short subject."),
  message: z.string().min(10, "A little more detail, please."),
});

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ContactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // A production deployment would post this to a mail service / Supabase table.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="contact-success" role="status">
        <div className="contact-success-mark">✓</div>
        <h3>Message received</h3>
        <p>
          Thank you, {form.name.split(" ")[0]}. We read every note and will reply to{" "}
          <strong>{form.email}</strong> soon.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-row">
        <div className="contact-field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" value={form.name} onChange={update("name")} />
          {errors.name && <span className="contact-err">{errors.name}</span>}
        </div>
        <div className="contact-field">
          <label htmlFor="c-email">Email</label>
          <input id="c-email" type="email" value={form.email} onChange={update("email")} />
          {errors.email && <span className="contact-err">{errors.email}</span>}
        </div>
      </div>
      <div className="contact-field">
        <label htmlFor="c-subject">Subject</label>
        <input id="c-subject" value={form.subject} onChange={update("subject")} />
        {errors.subject && <span className="contact-err">{errors.subject}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" rows={6} value={form.message} onChange={update("message")} />
        {errors.message && <span className="contact-err">{errors.message}</span>}
      </div>
      <button type="submit" className="ed-btn">Send message</button>
    </form>
  );
}
