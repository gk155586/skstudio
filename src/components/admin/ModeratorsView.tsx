import React from "react";
import { Star, Shield, UserCheck, Calendar, DollarSign, Award } from "lucide-react";

interface ModeratorsViewProps {
  isDark: boolean;
  users: any[];
  bookings: any[];
}

export default function ModeratorsView({
  isDark,
  users,
  bookings
}: ModeratorsViewProps) {
  // Filter only staff and moderators
  const staffRoles = ["admin", "manager", "photographer", "editor", "receptionist"];
  const moderators = users.filter((u: any) => staffRoles.includes(u.role || ""));

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "border-red-500/20 bg-red-500/5 text-red-400";
      case "manager": return "border-purple-500/20 bg-purple-500/5 text-purple-400";
      case "photographer": return "border-amber-500/20 bg-amber-500/5 text-amber-400";
      case "editor": return "border-indigo-500/20 bg-indigo-500/5 text-indigo-400";
      case "receptionist": return "border-sky-500/20 bg-sky-500/5 text-sky-400";
      default: return "border-gray-500/20 bg-gray-500/5 text-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-[#222222]/20 pb-4">
        <span className="text-[10px] font-mono text-gray-500 uppercase">ACTIVE CREW & SECURITY REGISTRY</span>
        <span className="text-[10px] font-mono text-gray-500">{moderators.length} active crew logged</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moderators.map((m: any) => {
          // Count assigned bookings
          const assignedShoots = bookings.filter(b => b.photographer === m.name).length;
          // Generate realistic rating stats
          const rating = m.name === "Admin" ? 5.0 : m.name.charCodeAt(0) % 2 === 0 ? 4.8 : 4.9;

          return (
            <div key={m.id} className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between gap-5 transition-all hover:border-[#d1b06c]/40 ${
              isDark ? "bg-[#141414] border-[#222222]" : "bg-white border-[#EFEFEE]"
            }`}>
              <div className="flex flex-col gap-3">
                {/* Profile header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                      isDark ? "bg-black text-[#d1b06c] border border-gray-800" : "bg-gray-100 text-black border border-gray-200"
                    }`}>
                      {m.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold leading-none">{m.name}</span>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5">{m.email}</span>
                    </div>
                  </div>

                  {/* Animated Dropdown Menu Action Button */}
                  <label className="event-wrapper scale-90">
                    <input type="checkbox" className="event-wrapper-inp" defaultChecked={true} />
                    <div className="bar">
                      <span className="top bar-list"></span>
                      <span className="middle bar-list"></span>
                      <span className="bottom bar-list"></span>
                    </div>
                    <section className="menu-container">
                      <div className="menu-list" onClick={() => alert(`Edit staff settings for ${m.name}`)}>Edit</div>
                      <div className="menu-list" onClick={() => alert(`Repost assigned schedule for ${m.name}`)}>Repost</div>
                      <div style={{ color: "crimson" }} className="menu-list" onClick={() => alert(`Remove staff access for ${m.name}`)}>Delete</div>
                    </section>
                  </label>
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap mt-1">
                  <span className={`text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${getRoleBadgeColor(m.role)}`}>
                    {m.role}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border border-gray-800 bg-black/40 text-gray-400 flex items-center gap-0.5">
                    <Star size={8} className="text-yellow-500" /> {rating.toFixed(1)} rating
                  </span>
                </div>
              </div>

              {/* Stats telemetry */}
              <div className={`p-4 rounded-xl text-[10px] font-mono flex flex-col gap-2 ${
                isDark ? "bg-black/30" : "bg-gray-50"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Assigned shoots:</span>
                  <span className="font-semibold text-white">{assignedShoots} sessions</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Attendance state:</span>
                  <span className="text-emerald-400 font-semibold uppercase">100% Present</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Commission rate:</span>
                  <span className="text-white font-semibold">15% Per Shoot</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payout threshold:</span>
                  <span className="text-[#d1b06c] font-semibold">₹15,000 pending</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
