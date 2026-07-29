import React, { useState } from "react";
import { Info, Settings, ShieldAlert, Sparkles } from "lucide-react";

interface SettingsViewProps {
  isDark: boolean;
  settings: any;
  setSettings: (val: any) => void;
  saveTransaction: (action: string, payload: any) => Promise<any>;
  crew?: string[];
  setCrew?: (val: string[]) => void;
}

export default function SettingsView({
  isDark,
  settings,
  setSettings,
  saveTransaction,
  crew,
  setCrew
}: SettingsViewProps) {
  const [storageDriver, setStorageDriver] = useState<string>("local"); // 'local' | 's3'
  const [newCrewName, setNewCrewName] = useState<string>("");
  const [editingCrewName, setEditingCrewName] = useState<string | null>(null);
  const [editingNewValue, setEditingNewValue] = useState<string>("");

  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) return;
    const res = await saveTransaction("manage_crew", { action: "add", name: newCrewName.trim() });
    if (res && res.success) {
      if (setCrew && res.data) setCrew(res.data);
      setNewCrewName("");
    }
  };

  const handleUpdateCrew = async (oldName: string) => {
    if (!editingNewValue.trim()) return;
    const res = await saveTransaction("manage_crew", { action: "update", oldName, newName: editingNewValue.trim() });
    if (res && res.success) {
      if (setCrew && res.data) setCrew(res.data);
      setEditingCrewName(null);
      setEditingNewValue("");
    }
  };

  const handleDeleteCrew = async (name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the crew?`)) return;
    const res = await saveTransaction("manage_crew", { action: "delete", name });
    if (res && res.success) {
      if (setCrew && res.data) setCrew(res.data);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTransaction("save_settings", settings);
    alert("Studio configurations committed to DB storage.");
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleFormSubmit} className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-6 text-xs font-mono ${
        isDark ? "bg-[#141414] border-[#222222] text-white" : "bg-white border-[#EFEFEE] text-[#1c1a17]"
      }`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider font-display border-b border-[#222222]/30 pb-3 flex items-center gap-1.5"><Settings size={15} /> Studio Configuration panel</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label>Studio Brand Name:</label>
            <input
              type="text"
              value={settings.studioName || ""}
              onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
                isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label>Corporate email:</label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
                isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label>Studio Phone Callline:</label>
            <input
              type="text"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
                isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label>Business Operating Hours:</label>
            <input
              type="text"
              value={settings.hours || ""}
              onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
              className={`px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
                isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label>Physical Studio Address Location:</label>
          <input
            type="text"
            value={settings.address || ""}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className={`px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
              isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
            }`}
          />
        </div>

        {/* Storage Driver Selector */}
        <div className="flex flex-col gap-2 border-t border-[#222222]/20 pt-4">
          <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">File Storage Driver Allocation:</label>
          <div className="flex gap-4 mt-1">
            {["local", "s3"].map(driver => (
              <label key={driver} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storage_driver"
                  value={driver}
                  checked={storageDriver === driver}
                  onChange={() => setStorageDriver(driver)}
                  className="accent-[#d1b06c]"
                />
                <span className="uppercase text-[10px] tracking-wider">
                  {driver === "local" ? "Local Directory uploads/" : "AWS S3 / Cloudflare R2 Store"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {storageDriver === "s3" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#222222]/20 pt-4">
            <div className="flex flex-col gap-1.5">
              <label>S3 Access Key ID:</label>
              <input
                type="text"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className={`px-3 py-2 border rounded-xl focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label>S3 Secret Access Key:</label>
              <input
                type="password"
                placeholder="••••••••••••••••••••"
                className={`px-3 py-2 border rounded-xl focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3.5 border-t border-[#222222]/20 pt-4">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Connected API channels:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label>Meta Cloud WhatsApp Access Token:</label>
              <input
                type="password"
                placeholder="EAAZB28••••••••••••"
                className={`px-3 py-2 border rounded-xl focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label>Razorpay Merchant Key ID:</label>
              <input
                type="text"
                placeholder="rzp_live_77777777"
                className={`px-3 py-2 border rounded-xl focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 py-3.5 bg-[#d1b06c] hover:bg-[#c39e58] text-black font-bold uppercase rounded-xl transition-all duration-300"
        >
          Save Studio Settings
        </button>
      </form>

      {/* Crew Management Section */}
      <div className={`mt-8 p-6 rounded-2xl border shadow-lg flex flex-col gap-6 text-xs font-mono ${
        isDark ? "bg-[#141414] border-[#222222] text-white" : "bg-white border-[#EFEFEE] text-[#1c1a17]"
      }`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider font-display border-b border-[#222222]/30 pb-3 flex items-center gap-1.5">
          <Sparkles size={15} /> Manage Studio Crew / Photographer
        </h3>

        <form onSubmit={handleAddCrew} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter crew member name..."
            value={newCrewName}
            onChange={(e) => setNewCrewName(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:border-[#d1b06c] ${
              isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
            }`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#d1b06c] text-black font-bold uppercase rounded-xl hover:bg-[#c39e58] transition-colors font-sans text-xs tracking-wider"
          >
            Add Crew
          </button>
        </form>

        <div className="flex flex-col gap-2.5 mt-2">
          {(crew || ["Ganesh SK", "Sunil K", "Rohit P"]).map((member) => (
            <div
              key={member}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? "bg-black/30 border-[#222222]" : "bg-gray-50 border-gray-150"
              }`}
            >
              {editingCrewName === member ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={editingNewValue}
                    onChange={(e) => setEditingNewValue(e.target.value)}
                    className={`flex-1 px-3 py-1 border rounded-lg focus:outline-none ${
                      isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                    }`}
                  />
                  <button
                    onClick={() => handleUpdateCrew(member)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors font-sans"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCrewName(null)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors font-sans"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-semibold text-sm font-sans">{member}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCrewName(member);
                        setEditingNewValue(member);
                      }}
                      className="px-2.5 py-1 text-[10px] uppercase font-bold border border-gray-500 rounded-lg hover:bg-gray-500/10 transition-all font-sans"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCrew(member)}
                      className="px-2.5 py-1 text-[10px] uppercase font-bold border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all font-sans"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
