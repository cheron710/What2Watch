"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";

interface ProfileFormProps {
  initial: {
    display_name: string;
    username: string;
    bio: string;
  };
  email: string;
}

export default function ProfileForm({ initial, email }: ProfileFormProps) {
  const [form, setForm] = useState(initial);
  const [note, setNote] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNote(null);
    startTransition(async () => {
      const res = await updateProfile(form);
      setNote(
        res.ok
          ? { type: "ok", text: "Profile saved." }
          : { type: "err", text: res.error ?? "Couldn't save." }
      );
    });
  };

  return (
    <form className="acct-form" onSubmit={onSubmit}>
      <div className="acct-field">
        <label htmlFor="p-email">Email</label>
        <input id="p-email" value={email} disabled />
        <span className="acct-field-hint">Your email is managed through your login and can&apos;t be changed here.</span>
      </div>
      <div className="acct-field">
        <label htmlFor="p-name">Display name</label>
        <input id="p-name" value={form.display_name} onChange={update("display_name")} required />
      </div>
      <div className="acct-field">
        <label htmlFor="p-username">Username</label>
        <input id="p-username" value={form.username} onChange={update("username")} placeholder="cinephile_92" />
        <span className="acct-field-hint">Letters, numbers, and underscores only.</span>
      </div>
      <div className="acct-field">
        <label htmlFor="p-bio">Bio</label>
        <textarea id="p-bio" rows={4} value={form.bio} onChange={update("bio")} placeholder="A sentence or two about your taste in film." />
      </div>
      <div>
        <button type="submit" className="ed-btn" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {note && <span className={`acct-note ${note.type}`} style={{ marginLeft: 14 }}>{note.text}</span>}
      </div>
    </form>
  );
}
