"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Sparkles } from "lucide-react";

export default function DedicatedContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "Maternity Shoot",
    eventDate: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit via API
      await fetch("/api/admin/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="pt-20 pb-12">
        <section className="pt-2 pb-8 px-6 max-w-7xl mx-auto">
          <Reveal style="blur" className="text-center mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold mb-4 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
              Reach Out To SK Studio Pune
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight mb-6">
              Contact Our <span className="text-[var(--accent)]">Creative Team</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Have questions about pricing, gown closet access, themes, or availability? Send us a message or chat directly on WhatsApp.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* CONTACT DETAILS & MAP */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Reveal style="split">
                <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl flex flex-col gap-6">
                  <h3 className="text-2xl font-extrabold font-display text-[var(--foreground)]">
                    Studio Address & Info
                  </h3>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shrink-0 mt-1">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Studio Location</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                        Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra 411039
                      </p>
                      <a
                        href="https://maps.app.goo.gl/BNVEcSovZRCPRdaj7"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs text-[var(--accent)] font-semibold underline mt-1 hover:opacity-80"
                      >
                        Open in Google Maps &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Phone / WhatsApp</h4>
                      <p className="text-xs text-gray-400 mt-0.5">+91 93071 12119</p>
                      <a
                        href="https://wa.me/919307112119"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs text-emerald-400 font-semibold underline mt-1 hover:opacity-80"
                      >
                        Chat Instantly on WhatsApp &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shrink-0 mt-1">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Official Email</h4>
                      <p className="text-xs text-gray-400 mt-0.5">skstudiopune@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">Working Hours</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Monday – Sunday (Open All Day)</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* INTERACTIVE ENQUIRY FORM */}
            <div className="lg:col-span-7">
              <Reveal style="diagonal">
                <div className="p-8 sm:p-10 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl">
                  <h3 className="text-2xl font-extrabold font-display mb-2">Book Your Shoot Session</h3>
                  <p className="text-xs text-gray-400 mb-8">Fill out the form below and our studio team will get back to you within 2 hours.</p>

                  {submitted ? (
                    <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center">
                      <CheckCircle2 size={48} className="text-emerald-400 mb-3" />
                      <h4 className="text-xl font-bold text-emerald-400">Enquiry Received!</h4>
                      <p className="text-xs text-gray-300 mt-2 max-w-sm">
                        Thank you! SK Studio Pune has received your request. We will contact you on WhatsApp / Phone shortly.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-6 px-6 py-2.5 rounded-full bg-[var(--accent)] text-black font-extrabold text-xs uppercase tracking-wider"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                            WhatsApp / Mobile No. *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                            Select Shoot Type *
                          </label>
                          <select
                            value={formData.eventType}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                          >
                            <option value="Maternity Shoot">Maternity Shoot (Indoor/Outdoor)</option>
                            <option value="Newborn Baby Shoot">Newborn Baby Shoot</option>
                            <option value="Baby Indoor Theme">Baby Indoor Theme</option>
                            <option value="Baby Outdoor Shoot">Baby Outdoor Shoot</option>
                            <option value="Wedding & Pre-Wedding">Wedding & Pre-Wedding</option>
                            <option value="Photo Frames & Canvas">Photo Frames & Canvas Order</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                          Preferred Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">
                          Message / Special Requests
                        </label>
                        <textarea
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us about your preferred themes, gown requirements, or shoot venue..."
                          className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                      >
                        {loading ? "Sending..." : "Submit Shoot Inquiry"}
                        <Send size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
