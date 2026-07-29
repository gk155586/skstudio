import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md bg-[#161616] border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
        <span className="text-5xl font-black font-mono text-[#b08d4b]">404</span>
        <h2 className="text-xl font-bold tracking-tight font-display">Page Not Found</h2>
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          The page or studio resource you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 bg-[#b08d4b] hover:bg-[#96753a] text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
