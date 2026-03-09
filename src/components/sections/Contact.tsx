"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * ─── Contact ──────────────────────────────────────────────────────────────────
 *
 * A hand-written letter form. On submit:
 *   1. The paper folds (CSS transform) as if being folded into an envelope.
 *   2. An envelope slides up from the bottom, swallows it, and flies off-screen.
 *   3. A "sent!" confirmation appears.
 *
 * TODO:
 *   1. Wire the form to your real email service (Resend, EmailJS, Formspree…).
 *   2. Replace the letter paper background with your paper texture asset.
 *   3. Replace the envelope with your hand-drawn envelope asset.
 *   4. Apply your grungy font classes.
 */

type FormState = "idle" | "sending" | "folding" | "sent" | "error";

export default function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== "idle") return;

    setState("sending");

    try {
      /**
       * TODO: replace with your actual email sending logic.
       * Example with Formspree:
       *   const res = await fetch("https://formspree.io/f/YOUR_ID", {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify(form),
       *   });
       *   if (!res.ok) throw new Error("Send failed");
       */

      // Simulated delay — remove once real endpoint is wired:
      await new Promise((r) => setTimeout(r, 800));

      // Trigger paper-fold + envelope animation
      setState("folding");
      setTimeout(() => setState("sent"), 1400); // after animations finish
    } catch {
      setState("error");
    }
  };

  return (
    <SectionWrapper id="contact" fullHeight={false}>
      <div className="flex min-h-screen w-full items-center justify-center px-8 py-24">

        {/* ── Sent confirmation ── */}
        {state === "sent" && (
          <div className="text-center animate-fade-in">
            <p className="text-4xl">✉️</p>
            <p className="mt-4 text-xl opacity-70">Letter sent!</p>
            <button
              onClick={() => { setState("idle"); setForm({ name: "", email: "", message: "" }); }}
              className="mt-6 text-sm underline opacity-50 hover:opacity-80"
            >
              Send another?
            </button>
          </div>
        )}

        {/* ── The letter ── */}
        {state !== "sent" && (
          <div
            className={`
              relative w-full max-w-xl origin-bottom
              transition-transform duration-700 ease-in-out
              ${state === "folding" ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"}
            `}
          >
            {/* Paper background — TODO: replace bg-[#fdfaf4] with a paper texture via backgroundImage once ready */}
            <div
              className="
                rounded-sm border border-current/20
                bg-[#fdfaf4]
                px-10 py-12
                shadow-[3px_3px_0_rgba(0,0,0,0.08)]
              "
            >
              {/* Letter header */}
              <p className="mb-8 text-sm opacity-40">
                {/* TODO: style as handwritten date line */}
                Dear Marwa,
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1 block text-xs uppercase tracking-widest opacity-50"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="
                      w-full border-0 border-b border-current/30 bg-transparent
                      py-1 text-base outline-none placeholder:opacity-30
                      focus:border-current/80
                    "
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1 block text-xs uppercase tracking-widest opacity-50"
                  >
                    Your email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="
                      w-full border-0 border-b border-current/30 bg-transparent
                      py-1 text-base outline-none placeholder:opacity-30
                      focus:border-current/80
                    "
                    placeholder="you@example.com"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1 block text-xs uppercase tracking-widest opacity-50"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    className="
                      w-full resize-none border-0 border-b border-current/30 bg-transparent
                      py-1 text-base leading-relaxed outline-none placeholder:opacity-30
                      focus:border-current/80
                    "
                    placeholder="Write your message here…"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm opacity-30">
                    {/* TODO: add hand-drawn signature / stamp decoration here */}
                    — Marwa
                  </p>

                  <button
                    type="submit"
                    disabled={state !== "idle"}
                    className="
                      flex items-center gap-2 rounded-none border border-current
                      px-6 py-2 text-sm uppercase tracking-widest
                      transition-opacity hover:opacity-60
                      disabled:pointer-events-none disabled:opacity-30
                    "
                  >
                    {state === "sending" ? "Folding…" : "Send ✉"}
                  </button>
                </div>
              </form>

              {state === "error" && (
                <p className="mt-4 text-sm text-red-500 opacity-80">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>

            {/* ── Envelope (slides up when folding) ── */}
            <div
              className={`
                absolute bottom-0 left-0 right-0
                flex items-end justify-center
                transition-all duration-700 ease-in-out
                ${state === "folding" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
              `}
            >
              {/* TODO: replace with your hand-drawn envelope asset */}
              <div className="flex h-24 w-full max-w-xl items-center justify-center border-t-2 border-current bg-[#fdfaf4] text-4xl shadow-md">
                ✉️
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
