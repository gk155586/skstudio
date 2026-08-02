import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console Login | SK Photo Studio Pune",
  description: "Protected administrative login for SK Photo Studio Pune.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
