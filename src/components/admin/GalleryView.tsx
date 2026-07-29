import React, { useState, useEffect } from "react";
import { Upload, Sparkles, Plus, Copy, Link as LinkIcon, QrCode, Video } from "lucide-react";

interface GalleryViewProps {
  isDark: boolean;
  users: any[];
}

export default function GalleryView({
  isDark,
  users
}: GalleryViewProps) {
  const [storageData, setStorageData] = useState<any>(null);
  const [loadingStorage, setLoadingStorage] = useState<boolean>(true);
  
  const [simFiles, setSimFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [watermark, setWatermark] = useState<boolean>(true);

  const [selectedUser, setSelectedUser] = useState<string>("");
  
  // Multi-Gallery states
  const [galleriesList, setGalleriesList] = useState<any[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>("");
  const [newGalleryName, setNewGalleryName] = useState<string>("");
  const [creatingGallery, setCreatingGallery] = useState<boolean>(false);
  
  const [deliveryLink, setDeliveryLink] = useState<string>("");
  const [adminMediaTab, setAdminMediaTab] = useState<"photos" | "videos">("photos");

  useEffect(() => {
    fetchStorageMetrics();
  }, []);

  // Fetch galleries list when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchClientGalleries(selectedUser);
    } else {
      setGalleriesList([]);
      setSelectedGalleryId("");
      setDeliveryLink("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const fetchStorageMetrics = async () => {
    try {
      const res = await fetch("/api/admin/storage");
      const data = await res.json();
      if (data.success) {
        setStorageData(data);
      }
    } catch (e) {
      console.error("Storage scan metrics failed:", e);
    } finally {
      setLoadingStorage(false);
    }
  };

  const fetchClientGalleries = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/link?client=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setGalleriesList(data.galleries || []);
        if (data.galleries && data.galleries.length > 0) {
          // Default to the first gallery
          setSelectedGalleryId(data.galleries[0].id);
          generateLinkString(data.galleries[0]);
        } else {
          setSelectedGalleryId("");
          setDeliveryLink("");
        }
      }
    } catch (err) {
      console.error("Failed to load galleries:", err);
    }
  };

  const handleCreateGallery = async () => {
    if (!selectedUser) return;
    const name = newGalleryName.trim() || `Gallery Session ${new Date().toLocaleDateString("en-IN")}`;
    setCreatingGallery(true);

    try {
      const res = await fetch("/api/admin/gallery/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: selectedUser, name })
      });
      const data = await res.json();
      if (data.success) {
        setNewGalleryName("");
        alert("Separate new gallery session created successfully!");
        // Refresh galleries list
        await fetchClientGalleries(selectedUser);
      } else {
        alert("Failed to create gallery: " + data.message);
      }
    } catch (err) {
      console.error("Create gallery error:", err);
      alert("Network error creating gallery session.");
    } finally {
      setCreatingGallery(false);
    }
  };

  const generateLinkString = (gallery: any) => {
    if (!gallery) return;
    setDeliveryLink(`${window.location.origin}/shared/gallery?id=${gallery.id}&sec_token=${gallery.token}`);
  };

  const handleGallerySelectChange = (id: string) => {
    setSelectedGalleryId(id);
    const match = galleriesList.find(g => g.id === id);
    if (match) {
      generateLinkString(match);
    } else {
      setDeliveryLink("");
    }
  };

  const handleUploadFiles = async () => {
    if (simFiles.length === 0) return;
    if (!selectedUser || !selectedGalleryId) {
      alert("Please select a target Customer Profile and Gallery Session first to map the uploaded files.");
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("galleryId", selectedGalleryId);
      formData.append("client", selectedUser);
      simFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setProgress(100);
        alert(`Successfully uploaded and registered ${simFiles.length} file(s) online!`);
        setSimFiles([]);
        fetchStorageMetrics();
        // Refresh galleries to update file counts
        fetchClientGalleries(selectedUser);
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("An error occurred during file upload. Please check your connection.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i > 4) i = 4;
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Console */}
      <div className={`p-6 rounded-2xl border shadow-lg ${
        isDark ? "bg-[#141414] border-[#222222]" : "bg-white border-[#EFEFEE]"
      } flex flex-col gap-6`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider font-display border-b border-[#222222]/30 pb-3">Upload Console</h3>
        
        <div className="border border-dashed border-[#222222] rounded-2xl p-6 text-center hover:border-[#d1b06c]/40 transition-colors flex flex-col items-center gap-3">
          <Upload className="text-gray-500" size={32} />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold">Select RAW/JPEG Media</span>
            <span className="text-[10px] text-gray-500">Supports drag and drop folders</span>
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) setSimFiles(Array.from(e.target.files));
            }}
            className="hidden"
            id="sim-gallery-files"
          />
          <label
            htmlFor="sim-gallery-files"
            className="px-4 py-2 bg-black/40 border border-[#222222] hover:bg-black text-[10px] uppercase font-mono tracking-widest text-[#d1b06c] cursor-pointer rounded-lg"
          >
            Browse
          </label>
          {simFiles.length > 0 && (
            <span className="text-[10px] font-mono text-emerald-400">{simFiles.length} files queued</span>
          )}
        </div>

        {selectedUser && selectedGalleryId ? (
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Target client: <span className="text-white font-bold">{selectedUser}</span></span>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Gallery ID: <span className="text-[#d1b06c] font-bold">{selectedGalleryId}</span></span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-amber-500 text-center uppercase">Select customer & gallery session on the right first</span>
        )}

        {simFiles.length > 0 && (
          <button
            onClick={handleUploadFiles}
            disabled={uploading || !selectedUser || !selectedGalleryId}
            className="w-full py-3 bg-[#d1b06c] text-black font-bold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading (${progress}%)` : "Commit Upload Session"}
          </button>
        )}

        <div className="flex items-center justify-between border-t border-[#222222]/30 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold">Image Watermark Layer</span>
            <span className="text-[9px] text-gray-500 font-mono uppercase">Protects previews during checkout</span>
          </div>
          <button
            onClick={() => setWatermark(!watermark)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${watermark ? "bg-emerald-600" : "bg-gray-700"}`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${watermark ? "translate-x-5.5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Real Storage calculations */}
        <div className="border-t border-[#222222]/30 pt-4 flex flex-col gap-3">
          <div className="flex justify-between text-xs">
            <span>Disk Allocation Used:</span>
            <span className="font-mono text-[#d1b06c] font-bold">
              {loadingStorage ? "Scanning..." : `${formatBytes(storageData?.usedBytes)} / ${formatBytes(storageData?.totalBytes)}`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black border border-gray-800 overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${storageData?.percentageUsed || 0}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>Remaining: {loadingStorage ? "..." : formatBytes(storageData?.remainingBytes)}</span>
            <span>Used: {loadingStorage ? "..." : `${storageData?.percentageUsed || 0}%`}</span>
          </div>
        </div>
      </div>

      {/* Private client delivery */}
      <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-lg ${
        isDark ? "bg-[#141414] border-[#222222]" : "bg-white border-[#EFEFEE]"
      } flex flex-col gap-6`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider font-display border-b border-[#222222]/30 pb-3">Client Gallery Delivery</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="flex flex-col gap-2">
            <label>1. Select Customer Profile:</label>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
              }}
              className={`px-3 py-2.5 rounded-xl border focus:outline-none ${
                isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
              }`}
            >
              <option value="">-- Select Profile --</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="flex flex-col gap-2">
              <label>2. Select Active Gallery Link:</label>
              <select
                value={selectedGalleryId}
                onChange={(e) => handleGallerySelectChange(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              >
                {galleriesList.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.filesCount} file(s))</option>
                ))}
                {galleriesList.length === 0 && (
                  <option value="">-- No Active Galleries --</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Form to create separate new galleries */}
        {selectedUser && (
          <div className="border-t border-[#222222]/30 pt-4 flex flex-col gap-3 text-xs font-mono">
            <span className="font-bold text-gray-400">CREATE A SEPARATE NEW GALLERY SESSION</span>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. Wedding Shoot Part 2"
                value={newGalleryName}
                onChange={(e) => setNewGalleryName(e.target.value)}
                className={`flex-grow px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"
                }`}
              />
              <button
                onClick={handleCreateGallery}
                disabled={creatingGallery}
                className="px-5 py-2.5 bg-[#d1b06c] hover:bg-[#c39e58] text-black font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus size={14} /> {creatingGallery ? "Creating..." : "Create New Link"}
              </button>
            </div>
          </div>
        )}

        {/* Generated Share Link & Scanner QR Code */}
        {deliveryLink && (
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-mono flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex flex-col gap-3 flex-grow w-full">
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Sparkles size={12} /> SECURE CLIENT LINK ACTIVATED
              </span>
              
              <input
                type="text"
                readOnly
                value={deliveryLink}
                className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-[10px] text-[#d1b06c] focus:outline-none"
              />
              
              <div className="flex gap-3 mt-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deliveryLink);
                    alert("Gallery URL copied to clipboard!");
                  }}
                  className="px-3.5 py-2 rounded-lg bg-black hover:bg-gray-900 border border-gray-800 text-white font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5"
                >
                  <Copy size={11} /> Copy URL Link
                </button>
                <a
                  href={`https://wa.me/919307112119?text=${encodeURIComponent(`Hi, your photography event captures are ready! Scan the code or click here to review: ${deliveryLink}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[9px]"
                >
                  Share via WhatsApp
                </a>
              </div>
            </div>

            {/* Dynamic QR Code Scanner */}
            <div className="flex flex-col items-center gap-1.5 border border-[#222222]/40 rounded-xl p-3 bg-white text-black shrink-0 mx-auto md:mx-0">
              <span className="text-[8px] text-gray-500 font-mono tracking-wider font-semibold uppercase flex items-center gap-1"><QrCode size={10} /> Scan Portfolio Code</span>
              <div className="w-24 h-24 relative flex items-center justify-center bg-gray-50 rounded">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(deliveryLink)}`}
                  alt="Client Portfolio Scan QR Code"
                  className="w-20 h-20"
                />
              </div>
              <span className="text-[8px] font-mono font-bold text-gray-600">SK STUDIO PUNE</span>
            </div>
          </div>
        )}

        {/* Gallery Media Assets Real-Time Manager */}
        {selectedGalleryId && (() => {
          const activeGallery = galleriesList.find(g => g.id === selectedGalleryId);
          const activeFiles = activeGallery?.files || [];
          const photos = activeFiles.filter((f: any) => f.mimeType?.startsWith("image/"));
          const videos = activeFiles.filter((f: any) => f.mimeType?.startsWith("video/"));
          const currentTabFiles = adminMediaTab === "photos" ? photos : videos;

          return (
            <div className="border-t border-[#222222]/30 pt-6 mt-2 flex flex-col gap-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-400 uppercase tracking-wider">
                  Session media assets ({activeFiles.length} Total)
                </span>
                
                {/* Switch Tabs Category Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdminMediaTab("photos")}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-widest transition-all ${
                      adminMediaTab === "photos"
                        ? "bg-[#d1b06c] text-black border-[#d1b06c]"
                        : "bg-transparent border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Photos ({photos.length})
                  </button>
                  <button
                    onClick={() => setAdminMediaTab("videos")}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-widest transition-all ${
                      adminMediaTab === "videos"
                        ? "bg-[#d1b06c] text-black border-[#d1b06c]"
                        : "bg-transparent border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Videos / Clips ({videos.length})
                  </button>
                </div>
              </div>

              {/* Grid of Files */}
              {currentTabFiles.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl bg-black/10 text-gray-500">
                  No {adminMediaTab === "photos" ? "photos" : "videos/clips"} registered in this gallery.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentTabFiles.map((file: any) => {
                    const fileUrl = file.url || `/api/admin/gallery/file?name=${encodeURIComponent(file.path || "")}`;
                    return (
                      <div
                        key={file.id}
                        className="group relative rounded-xl border border-gray-800 bg-black/40 overflow-hidden flex flex-col justify-between"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-square bg-black flex items-center justify-center relative overflow-hidden">
                          {adminMediaTab === "photos" ? (
                            <img
                              src={fileUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                              <Video size={24} className="text-[#d1b06c]" />
                              <span className="text-[8px] mt-1 truncate max-w-[90%]">{file.name}</span>
                            </div>
                          )}
                          
                          {/* Hover action cover */}
                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <button
                              onClick={async () => {
                                if (confirm(`Remove this asset from gallery "${activeGallery?.name}"?`)) {
                                  try {
                                    const res = await fetch(`/api/admin/gallery/link?galleryId=${selectedGalleryId}&fileId=${file.id}`, {
                                      method: "DELETE"
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      fetchClientGalleries(selectedUser);
                                    } else {
                                      alert("Failed to delete: " + data.message);
                                    }
                                  } catch (err) {
                                    console.error("Delete error:", err);
                                  }
                                }
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[8px] font-bold uppercase tracking-wider transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* File details footer */}
                        <div className="p-2 border-t border-gray-800/60 bg-black/60 flex flex-col">
                          <span className="text-[9px] font-semibold truncate text-gray-300" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[8px] text-gray-500">
                            {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
