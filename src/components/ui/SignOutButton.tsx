"use client";

import { useState, useRef } from "react";
import { signOutAction } from "@/app/actions/auth";

export default function SignOutButton({ className }: { className?: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={signOutAction} className="hidden" />
      <button
        type="button"
        className={className || "acct-signout-btn"}
        onClick={() => setShowConfirm(true)}
      >
        Sign out
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-[var(--color-bg,#F0EBE0)] text-[var(--color-text,#1A1A1A)] border border-[var(--color-border,rgba(0,0,0,0.1))] rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 font-sans text-left">
            <h3 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
              Confirm Sign Out
            </h3>
            <p className="text-sm text-[var(--color-text-muted,#666)] leading-relaxed">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold border border-[var(--color-border,rgba(0,0,0,0.15))] hover:bg-black/5 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  formRef.current?.requestSubmit();
                }}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[var(--color-brand,#FF4D2D)] hover:opacity-90 cursor-pointer shadow-sm transition uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
