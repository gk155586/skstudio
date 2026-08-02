import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Login | SK Photo Studio Pune",
  description: "Client login portal for SK Photo Studio Pune.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
