"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { useContent } from "@/components/Providers";

export default function ContactForm() {
  const { content } = useContent();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const services = [
    "Wedding Segment",
    "Pre-Wedding Shoot",
    "Maternity Portfolio",
    "Newborn & Toddler Setup",
    "Corporate & Event Shoots",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.service) newErrors.service = "Please select a service";
    if (!formData.date) newErrors.date = "Please select a date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        let localBookings: Array<Record<string, string>> = [];
        try {
          const rawBookings = window.localStorage.getItem("sk_bookings");
          localBookings = rawBookings ? JSON.parse(rawBookings) : [];
        } catch {
          localBookings = [];
        }

        if (!Array.isArray(localBookings)) {
          localBookings = [];
        }

        localBookings.unshift({
          id: data.booking?.id || `bk-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          service: formData.service,
          date: formData.date,
          status: "Pending Review"
        });
        window.localStorage.setItem("sk_bookings", JSON.stringify(localBookings.slice(0, 10)));
        setIsSuccess(true);
      } else {
        alert(data.message || "Failed to confirm booking.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Something went wrong. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-stretch">
        {/* Info & Map Block */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between gap-12">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono">
              Bespoke Bookings
            </span>
            <TextReveal
              text="Let's Co-Create Your Visual Masterpiece."
              style="mask"
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)] font-display leading-[1.15]"
            />
            <p className="text-gray-600 dark:text-gray-300 font-sans font-light max-w-md">
              Fill out the booking scheduler, and our concept coordinators will reach out to design your customized backdrop setups.
            </p>
          </div>

          {/* Location & Details cards */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5 text-[var(--foreground)] group">
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--accent)] shadow-lg group-hover:bg-[var(--accent)] group-hover:text-black group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <Phone size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase mb-0.5">Phone Helpline</span>
                <a 
                  data-edit-id="contact.phone"
                  href={`tel:${(content?.contact?.phone || "+91 93071 12119").replace(/\s+/g, "")}`} 
                  className="text-lg font-bold font-display hover:text-[var(--accent)] transition-colors"
                >
                  {content?.contact?.phone || "+91 93071 12119"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-5 text-[var(--foreground)] group">
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--accent)] shadow-lg group-hover:bg-[var(--accent)] group-hover:text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Mail size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase mb-0.5">Write To Us</span>
                <a 
                  data-edit-id="contact.email"
                  href={`mailto:${content?.contact?.email || "skstudiopune@gmail.com"}`} 
                  className="text-lg font-bold font-display hover:text-[var(--accent)] transition-colors lowercase"
                >
                  {content?.contact?.email || "skstudiopune@gmail.com"}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5 text-[var(--foreground)] group">
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--accent)] shadow-lg group-hover:bg-[var(--accent)] group-hover:text-black group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 mt-1">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase mb-0.5">Studio Address</span>
                <a 
                  data-edit-id="contact.address"
                  href="https://maps.app.goo.gl/BNVEcSovZRCPRdaj7" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-sans font-light text-sm md:text-base max-w-sm text-gray-300 group-hover:text-[var(--accent)] transition-colors leading-relaxed"
                >
                  {content?.contact?.address || "SK STUDIO PUNE, Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra 411039."}
                </a>
              </div>
            </div>
          </div>

          {/* Embedded responsive Google Map */}
          <Reveal style="blur" className="w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[var(--card-border)] shadow-xl relative mt-4">
            <iframe
              src="https://www.google.com/maps?q=SK+STUDIO+PUNE+Sakubai+Gawali+Gardan+Shriram+Colony+Bhosari+Maharashtra+411039&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </Reveal>
        </div>

        {/* Multi-step Contact Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <Reveal style="blur" className="w-full">
            <div className="glass border border-[var(--glass-border)] rounded-3xl p-8 md:p-12 shadow-2xl relative bg-[var(--card-bg)]">
              {isSuccess ? (
                <div className="flex flex-col items-center text-center gap-6 py-12 select-none">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)] font-display">
                    Booking Confirmed!
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm font-sans font-light">
                    Thank you for scheduling your session. Our concept coordinators will call you shortly to align on outlines and outfits.
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setStep(1);
                      setFormData({ name: "", email: "", phone: "", service: "", date: "", message: "" });
                    }}
                    className="px-6 py-2.5 rounded-full border border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-xs font-semibold uppercase tracking-wider clickable"
                  >
                    Book Another Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Steps Header indicator */}
                  <div className="flex justify-between items-center mb-4 select-none">
                    <span className="text-xs font-semibold tracking-wider font-mono text-[var(--accent)] uppercase">
                      Step {step} of 2
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-8 h-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`} />
                      <div className={`w-8 h-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`} />
                    </div>
                  </div>

                  {/* Step 1 Fields */}
                  {step === 1 && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <h3 className="text-lg font-bold text-[var(--foreground)] font-display mb-2">
                        Personal Details
                      </h3>
                      
                      <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] placeholder-gray-500 font-sans transition-all duration-300"
                        />
                        {errors.name && <span className="text-xs text-rose-500 font-sans">{errors.name}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="yourname@domain.com"
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] placeholder-gray-500 font-sans transition-all duration-300"
                        />
                        {errors.email && <span className="text-xs text-rose-500 font-sans">{errors.email}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile no"
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] placeholder-gray-500 font-sans transition-all duration-300"
                        />
                        {errors.phone && <span className="text-xs text-rose-500 font-sans">{errors.phone}</span>}
                      </div>

                      <button
                        onClick={handleNextStep}
                        className="mt-4 w-full btn-primary clickable"
                      >
                        <span className="shutter-label flex items-center justify-center gap-1.5 w-full font-semibold">
                          <span>Continue</span>
                          <ChevronRight size={16} />
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Step 2 Fields */}
                  {step === 2 && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <h3 className="text-lg font-bold text-[var(--foreground)] font-display mb-2">
                        Session Details
                      </h3>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="service" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Photoshoot Service</label>
                        <select
                          name="service"
                          id="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] font-sans transition-all duration-300"
                        >
                          <option value="" className="bg-[var(--background)]">Select service</option>
                          {services.map((srv) => (
                            <option key={srv} value={srv} className="bg-[var(--background)]">
                              {srv}
                            </option>
                          ))}
                        </select>
                        {errors.service && <span className="text-xs text-rose-500 font-sans">{errors.service}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="date" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Preferred Date</label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] font-sans transition-all duration-300"
                        />
                        {errors.date && <span className="text-xs text-rose-500 font-sans">{errors.date}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="text-xs uppercase tracking-wider text-gray-500 font-mono">Special Inquiries / Message</label>
                        <textarea
                          name="message"
                          id="message"
                          rows={3}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us about your concepts..."
                          className="w-full bg-[var(--background)]/40 border border-[var(--card-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] focus:shadow-[0_0_15px_rgba(209,176,108,0.15)] text-[var(--foreground)] placeholder-gray-500 font-sans resize-none transition-all duration-300"
                        />
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setStep(1);
                          }}
                          className="btn-secondary px-5 py-4 clickable"
                        >
                          <span className="shutter-label inline-flex items-center justify-center">
                            <ChevronLeft size={16} />
                          </span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed clickable"
                        >
                          <span className="shutter-label flex items-center justify-center gap-2 w-full font-semibold">
                            <span>{isSubmitting ? "Sending..." : "Submit Booking"}</span>
                            <Send size={16} />
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
