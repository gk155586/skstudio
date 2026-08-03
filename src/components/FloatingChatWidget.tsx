"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function FloatingChatWidget() {
  const pathname = usePathname();

  // Hide global WhatsApp floating button on user dashboard (/bookings) and admin pages (/admin)
  if (pathname?.startsWith("/bookings") || pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappPhone = "919307112119";
  const defaultText = encodeURIComponent(
    "Hello SK Photo Studio Pune, I would like to inquire about photoshoot booking & package details!"
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${defaultText}`;

  return (
    <>
      <style jsx global>{`
        .wa-floating-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999 !important;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .wa-floating-pill {
          background: #18181b;
          color: #25d366;
          border: 1px solid rgba(37, 211, 102, 0.4);
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 0.78rem;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          letter-spacing: 0.03em;
          white-space: nowrap;
          animation: waFloatPulse 3s infinite ease-in-out;
          transition: all 0.3s ease;
        }
        @keyframes waFloatPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .wa-floating-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 10px 30px rgba(37, 211, 102, 0.45), 0 0 18px rgba(37, 211, 102, 0.3);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: #ffffff;
        }
        .wa-floating-container:hover .wa-floating-btn {
          transform: scale(1.12) rotate(6deg);
          box-shadow: 0 14px 35px rgba(37, 211, 102, 0.65);
        }
        .wa-floating-container:hover .wa-floating-pill {
          background: #25d366;
          color: #000000;
          border-color: #25d366;
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
        }
      `}</style>

      {/* Floating WhatsApp Action Link */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-floating-container"
        aria-label="Chat with SK Photo Studio Pune on WhatsApp"
      >
        <div className="wa-floating-pill hidden sm:block">
          💬 WhatsApp Us (+91 93071 12119)
        </div>
        <div className="wa-floating-btn">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-phone-call"
          >
            <path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-2.81 0-5.405-1.094-7.388-2.906-1.984-1.813-3.136-4.298-3.136-7.009 0-5.466 4.708-9.93 10.524-9.93 5.815 0 10.523 4.464 10.523 9.93 0 2.711-1.152 5.196-3.136 7.009-1.983 1.812-4.578 2.906-7.387 2.906z"/>
          </svg>
        </div>
      </a>
    </>
  );
}
