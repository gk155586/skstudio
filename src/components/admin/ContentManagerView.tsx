"use client";

import React, { useState } from "react";
import { 
  Plus, Trash2, Image as ImageIcon, Save, X, Check,
  Star, MessageSquare, Layers, Camera, PenTool, 
  CheckCircle, HelpCircle, User, Compass, Info, Settings
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const iconMap: Record<string, any> = {
  MessageSquare: MessageSquare,
  Layers: Layers,
  Camera: Camera,
  PenTool: PenTool,
  CheckCircle: CheckCircle
};

export default function ContentManagerView({ isDark, content, saveTransaction }: any) {
  const [localContent, setLocalContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [subTab, setSubTab] = useState("categories");
  
  // Category State
  const [newCategoryKey, setNewCategoryKey] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Image Picker Modal State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null); // e.g. "hero", "cat-0", "cat-1"
  const [pickerFilterCat, setPickerFilterCat] = useState("all");

  const openImagePicker = (target: string) => {
    setPickerTarget(target);
    setPickerFilterCat("all");
    setPickerOpen(true);
  };

  const pickImage = (url: string) => {
    if (!pickerTarget) return;
    if (pickerTarget === "hero") {
      handleFrameChange("backgroundImage", url);
      toast.success("Hero background updated! Save to publish.");
    } else if (pickerTarget === "about-image") {
      handleAboutChange("image", url);
      toast.success("About section image updated! Save to publish.");
    } else if (pickerTarget.startsWith("cat-")) {
      const idx = parseInt(pickerTarget.replace("cat-", ""), 10);
      handleHomepageCatChange(idx, "image", url);
      toast.success("Category card image updated! Save to publish.");
    }
    setPickerOpen(false);
  };

  // Collect all gallery images for the picker, grouped by category
  const allGalleryImages = Object.entries(localContent.categoryGalleries || {}).flatMap(
    ([catKey, catData]: [string, any]) =>
      (catData.images || []).map((img: any) => ({ ...img, catKey, catName: catData.name }))
  );
  const [newHomepageCat, setNewHomepageCat] = useState({
    name: "",
    description: "",
    image: "/images/frames-preview.jpg",
    url: "/portfolio/baby"
  });

  // Testimonial Form State
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "Google Reviews",
    rating: 5,
    text: "",
    avatar: "/img/clients/1.jpg"
  });

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes to database...");
    const res = await saveTransaction("save_content", localContent);
    setIsSaving(false);
    if (res) {
      toast.success("Content updated successfully in real-time!", { id: toastId });
    } else {
      toast.error("Failed to save changes", { id: toastId });
    }
  };

  const uploadImageFile = async (file: File, galleryId: string) => {
    const formData = new FormData();
    formData.append("galleryId", galleryId);
    formData.append("files", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    if (data.success && data.files?.[0]?.url) {
      return data.files[0].url;
    }
    throw new Error("Invalid response from server");
  };

  // Category management
  const handleCategoryFieldChange = (catKey: string, field: string, value: any) => {
    setLocalContent((prev: any) => ({
      ...prev,
      categoryGalleries: {
        ...prev.categoryGalleries,
        [catKey]: {
          ...prev.categoryGalleries[catKey],
          [field]: value
        }
      }
    }));
  };

  const handleAddCategory = () => {
    if (!newCategoryKey || !newCategoryName) return toast.error("Key and Name required");
    const key = newCategoryKey.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setLocalContent((prev: any) => ({
      ...prev,
      categoryGalleries: {
        ...prev.categoryGalleries,
        [key]: {
          name: newCategoryName,
          description: "",
          images: []
        }
      }
    }));
    setNewCategoryKey("");
    setNewCategoryName("");
    toast.success("New category created. Remember to save!");
  };

  const handleDeleteCategory = (catKey: string) => {
    if (!confirm(`Are you sure you want to delete the ${catKey} category?`)) return;
    const newGalleries = { ...localContent.categoryGalleries };
    delete newGalleries[catKey];
    setLocalContent((prev: any) => ({
      ...prev,
      categoryGalleries: newGalleries
    }));
  };

  const handleUploadImage = async (catKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const toastId = toast.loading(`Uploading ${files.length} image(s)...`);
    
    try {
      const uploadedImages: any[] = [];
      const formData = new FormData();
      formData.append("galleryId", "content-manager");
      for (const file of files) {
        formData.append("files", file);
      }
      
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server upload error");
      const data = await res.json();
      
      if (data.success && data.files?.length > 0) {
        data.files.forEach((fileMeta: any) => {
          uploadedImages.push({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            url: fileMeta.url,
            title: "New Upload",
            description: ""
          });
        });

        const currentImages = localContent.categoryGalleries[catKey]?.images || [];
        handleCategoryFieldChange(catKey, "images", [...currentImages, ...uploadedImages]);
        toast.success(`Successfully uploaded ${files.length} image(s)!`, { id: toastId });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image", { id: toastId });
    }
  };

  const handleDeleteImage = (catKey: string, imgId: string) => {
    const currentImages = localContent.categoryGalleries[catKey]?.images || [];
    const newImages = currentImages.filter((img: any) => img.id !== imgId);
    handleCategoryFieldChange(catKey, "images", newImages);
    toast.success("Image removed. Save to finalize!");
  };

  // Hero section management
  const handleFrameChange = (field: string, value: string) => {
    setLocalContent((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  // About management
  const handleAboutChange = (field: string, value: any) => {
    setLocalContent((prev: any) => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
  };

  const handleAboutStatChange = (idx: number, field: string, value: any) => {
    const currentStats = [...(localContent.about?.stats || [])];
    currentStats[idx] = { ...currentStats[idx], [field]: value };
    handleAboutChange("stats", currentStats);
  };

  // Process management
  const handleProcessChange = (field: string, value: any) => {
    setLocalContent((prev: any) => ({
      ...prev,
      process: {
        ...prev.process,
        [field]: value
      }
    }));
  };

  const handleProcessStepChange = (idx: number, field: string, value: any) => {
    const currentSteps = [...(localContent.process?.steps || [])];
    currentSteps[idx] = { ...currentSteps[idx], [field]: value };
    handleProcessChange("steps", currentSteps);
  };

  // Homepage Category Cards CRUD
  const handleHomepageCatChange = (idx: number, field: string, value: any) => {
    const currentCats = [...(localContent.categories || [])];
    currentCats[idx] = { ...currentCats[idx], [field]: value };
    setLocalContent((prev: any) => ({
      ...prev,
      categories: currentCats
    }));
  };

  const handleDeleteHomepageCat = (idx: number) => {
    if (!confirm("Are you sure you want to delete this category card?")) return;
    const currentCats = [...(localContent.categories || [])];
    currentCats.splice(idx, 1);
    setLocalContent((prev: any) => ({
      ...prev,
      categories: currentCats
    }));
    toast.success("Category card removed. Save to finalize!");
  };

  const handleAddHomepageCat = () => {
    if (!newHomepageCat.name || !newHomepageCat.image) {
      return toast.error("Name and Image are required.");
    }
    setLocalContent((prev: any) => ({
      ...prev,
      categories: [...(prev.categories || []), newHomepageCat]
    }));
    setNewHomepageCat({
      name: "",
      description: "",
      image: "/images/frames-preview.jpg",
      url: "/portfolio/baby"
    });
    toast.success("Category card added. Remember to save changes!");
  };

  // Testimonials management
  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.text) {
      return toast.error("Name and testimonial content are required.");
    }
    const currentTestimonials = [...(localContent.testimonials || [])];
    currentTestimonials.push({
      id: "t-" + Date.now().toString(),
      ...newTestimonial
    });
    setLocalContent((prev: any) => ({
      ...prev,
      testimonials: currentTestimonials
    }));
    setNewTestimonial({
      name: "",
      role: "Google Reviews",
      rating: 5,
      text: "",
      avatar: "/img/clients/1.jpg"
    });
    toast.success("Review added. Click Save Changes to publish!");
  };

  const handleUpdateTestimonial = (id: string, field: string, value: any) => {
    const currentTestimonials = (localContent.testimonials || []).map((t: any) => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setLocalContent((prev: any) => ({
      ...prev,
      testimonials: currentTestimonials
    }));
  };

  const handleDeleteTestimonial = (id: string) => {
    const currentTestimonials = (localContent.testimonials || []).filter((t: any) => t.id !== id);
    setLocalContent((prev: any) => ({
      ...prev,
      testimonials: currentTestimonials
    }));
    toast.success("Review deleted. Click Save Changes to publish.");
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl pb-24">
      <Toaster position="bottom-right" />
      
      {/* Header bar with publish actions */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
        <div className="flex items-center gap-3">
          <Settings className="text-[#d1b06c]" size={24} />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Site Editor Panels</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Draft layout changes instantly. Reload public views via real-time SSE stream.</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 clickable py-3 px-6 rounded-xl"
        >
          <Save size={16} />
          {isSaving ? "Publishing..." : "Save Changes"}
        </button>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-3">
        {[
          { id: "categories", label: "Categories & Galleries", desc: "Category names, descriptions, images" },
          { id: "homepage-categories", label: "Homepage Category Cards", desc: "Edit user page category shortcuts" },
          { id: "hero", label: "Hero Banner & Stats", desc: "Welcome text, slide statistics, alignments" },
          { id: "sections", label: "About & Workflow", desc: "Narration, counter metrics, process steps" },
          { id: "testimonials", label: "Testimonials CRUD", desc: "Client stories and review slides" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 ${
              subTab === tab.id
                ? "bg-[#d1b06c] text-black shadow-md scale-102"
                : `text-gray-400 hover:text-white ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Categories & Galleries */}
      {subTab === "categories" && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {Object.keys(localContent.categoryGalleries || {}).map((key) => {
              const category = localContent.categoryGalleries[key];
              return (
                <div key={key} className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
                  <div className="flex items-center justify-between border-b pb-4 border-dashed border-gray-800">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Display Name</label>
                        <input
                          type="text"
                          value={category.name}
                          className={`p-2.5 rounded-lg border text-sm font-semibold focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                          onChange={(e) => handleCategoryFieldChange(key, "name", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Category Description</label>
                        <input
                          type="text"
                          value={category.description}
                          className={`p-2.5 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                          onChange={(e) => handleCategoryFieldChange(key, "description", e.target.value)}
                        />
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCategory(key)} className="ml-6 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Images Grid */}
                  <div className="mt-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-gray-400">
                      <ImageIcon size={14}/> {category.name} Gallery ({category.images?.length || 0} Images)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {(category.images || []).map((img: any) => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--card-border)] bg-black/10">
                          <img src={img.url} alt={category.name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/40">
                            <button onClick={() => handleDeleteImage(key, img.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Upload Button */}
                      <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group ${isDark ? "border-gray-800 hover:border-[var(--accent)] bg-black/30" : "border-gray-300 hover:border-[var(--accent)] bg-gray-50"}`}>
                        <Plus size={24} className="text-gray-400 group-hover:text-[var(--accent)] transition-colors" />
                        <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Upload</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUploadImage(key, e)} />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Category Form */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)]">Add New Category Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Category ID (e.g. newborn)</label>
                <input
                  className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newCategoryKey}
                  onChange={(e) => setNewCategoryKey(e.target.value)}
                  placeholder="Unique ID key (lowercase)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Display Name</label>
                <input
                  className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Newborn Specials"
                />
              </div>
              <button onClick={handleAddCategory} className="btn-primary py-3.5 h-[48px] rounded-lg font-bold text-sm clickable w-full">
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Banner & Stats */}
      {subTab === "hero" && (
        <div className="flex flex-col gap-8">
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-6 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)]">Hero Text Content & Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Main Title Text</label>
                  <textarea
                    className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] h-24 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.hero?.title || ""}
                    onChange={(e) => handleFrameChange("title", e.target.value)}
                    placeholder="Main headline in hero."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Subtitle Overlay</label>
                  <input
                    className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.hero?.subtitle || ""}
                    onChange={(e) => handleFrameChange("subtitle", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Hero Description Copy</label>
                  <textarea
                    className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] h-24 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.hero?.description || ""}
                    onChange={(e) => handleFrameChange("description", e.target.value)}
                    placeholder="Short description sentence below header."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Background Image Overlay</label>
                  <div className="flex gap-2">
                    <input
                      className={`p-3 rounded-lg border text-sm flex-grow focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={localContent.hero?.backgroundImage || ""}
                      onChange={(e) => handleFrameChange("backgroundImage", e.target.value)}
                      placeholder="e.g. /img/slid/3.jpg or upload"
                    />
                    <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-3.5 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center justify-center select-none shrink-0 transition-colors">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          const toastId = toast.loading("Uploading background file...");
                          try {
                            const url = await uploadImageFile(files[0], "hero-bg");
                            handleFrameChange("backgroundImage", url);
                            toast.success("Background image updated!", { id: toastId });
                          } catch (err: any) {
                            toast.error(err.message, { id: toastId });
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => openImagePicker("hero")}
                      className="bg-[#d1b06c] hover:bg-[#c9a85a] text-black text-xs px-4 py-3.5 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <ImageIcon size={14} /> Pick
                    </button>
                  </div>
                  {localContent.hero?.backgroundImage && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[var(--card-border)] w-full aspect-video max-h-40 relative">
                      <img src={localContent.hero.backgroundImage} alt="Hero preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/60 text-white px-2 py-0.5 rounded">Current Hero Background</span>
                    </div>
                  )}
                </div>


                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Background Gradient tint</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={localContent.hero?.backgroundColor || "#c9b8a0"} 
                      onChange={(e) => handleFrameChange("backgroundColor", e.target.value)}
                      className="w-12 h-12 rounded-xl border-none cursor-pointer"
                    />
                    <span className="font-mono text-sm">{localContent.hero?.backgroundColor || "#c9b8a0"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Text Alignment Direction</label>
                  <select
                    className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.hero?.textAlignment || "right"}
                    onChange={(e) => handleFrameChange("textAlignment", e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar Configuration */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-6 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)]">Hero Stats Bar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(localContent.heroStats || [
                ["250+", "Luxury Sessions"],
                ["4.9/5", "Client Love"],
                ["24h", "Preview Support"]
              ]).map((stat: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-xl border ${isDark ? "bg-black/40 border-gray-800" : "bg-gray-50 border-gray-200"} flex flex-col gap-3`}>
                  <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-semibold">Stat Card {idx + 1}</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Card Metric Value</label>
                    <input
                      type="text"
                      value={stat[0]}
                      onChange={(e) => {
                        const nextStats = [...(localContent.heroStats || [["250+", "Luxury Sessions"], ["4.9/5", "Client Love"], ["24h", "Preview Support"]])];
                        nextStats[idx] = [e.target.value, stat[1]];
                        setLocalContent((prev: any) => ({ ...prev, heroStats: nextStats }));
                      }}
                      className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Card Description Label</label>
                    <input
                      type="text"
                      value={stat[1]}
                      onChange={(e) => {
                        const nextStats = [...(localContent.heroStats || [["250+", "Luxury Sessions"], ["4.9/5", "Client Love"], ["24h", "Preview Support"]])];
                        nextStats[idx] = [stat[0], e.target.value];
                        setLocalContent((prev: any) => ({ ...prev, heroStats: nextStats }));
                      }}
                      className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: About & Workflow */}
      {subTab === "sections" && (
        <div className="flex flex-col gap-8">
          {/* About Section */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-6 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)] flex items-center gap-2"><Info size={16} className="text-[#d1b06c]"/> About Narration Panel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Tag Tagline</label>
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={localContent.about?.tag || ""}
                      onChange={(e) => handleAboutChange("tag", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Established Tag</label>
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={localContent.about?.established || ""}
                      onChange={(e) => handleAboutChange("established", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Headline Title</label>
                  <textarea
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none h-16 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.about?.title || ""}
                    onChange={(e) => handleAboutChange("title", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Narrative Paragraph 1</label>
                  <textarea
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none h-20 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.about?.p1 || ""}
                    onChange={(e) => handleAboutChange("p1", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Narrative Paragraph 2</label>
                  <textarea
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none h-20 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.about?.p2 || ""}
                    onChange={(e) => handleAboutChange("p2", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Footer Italic quote</label>
                  <input
                    type="text"
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.about?.p3 || ""}
                    onChange={(e) => handleAboutChange("p3", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">About Banner Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs flex-grow focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={localContent.about?.image || ""}
                      onChange={(e) => handleAboutChange("image", e.target.value)}
                    />
                    <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3.5 py-3 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center shrink-0">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          const toastId = toast.loading("Uploading about banner...");
                          try {
                            const url = await uploadImageFile(files[0], "about-section");
                            handleAboutChange("image", url);
                            toast.success("About image updated!", { id: toastId });
                          } catch (err: any) {
                            toast.error(err.message, { id: toastId });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Banner Award Subtitle</label>
                  <input
                    type="text"
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={localContent.about?.awardLabel || ""}
                    onChange={(e) => handleAboutChange("awardLabel", e.target.value)}
                  />
                </div>

                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-semibold border-t pt-4 border-dashed border-gray-800 mt-2">Section Metrics Counters</span>
                <div className="grid grid-cols-1 gap-3">
                  {(localContent.about?.stats || [
                    { end: 1400, label: "Google Reviews", suffix: "+" },
                    { end: 350, label: "Projects Completed", suffix: "" },
                    { end: 10, label: "Years Experience", suffix: "+" }
                  ]).map((stat: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-xl border flex gap-3 ${isDark ? "bg-black/30 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Counter Max</label>
                        <input
                          type="number"
                          value={stat.end}
                          onChange={(e) => handleAboutStatChange(idx, "end", parseInt(e.target.value) || 0)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-grow-[2]">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Metric Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleAboutStatChange(idx, "label", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Suffix</label>
                        <input
                          type="text"
                          value={stat.suffix || ""}
                          onChange={(e) => handleAboutStatChange(idx, "suffix", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Process Workflow Section */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-6 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)] flex items-center gap-2"><Compass size={16} className="text-[#d1b06c]"/> Workflow Journey Planner</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Journey Small Tag</label>
                <input
                  type="text"
                  className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={localContent.process?.tag || ""}
                  onChange={(e) => handleProcessChange("tag", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Journey Title</label>
                <input
                  type="text"
                  className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={localContent.process?.title || ""}
                  onChange={(e) => handleProcessChange("title", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Journey Description Paragraph</label>
              <textarea
                className={`p-2.5 rounded-lg border text-xs focus:outline-none h-16 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                value={localContent.process?.description || ""}
                onChange={(e) => handleProcessChange("description", e.target.value)}
              />
            </div>

            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-semibold border-t pt-4 border-dashed border-gray-800">Timeline Steps (Max 5)</span>
            <div className="flex flex-col gap-4">
              {(localContent.process?.steps || [
                { number: "01", icon: "MessageSquare", title: "Concept & Consult", description: "We align on props..." },
                { number: "02", icon: "Layers", title: "Setup & Style", description: "Our production designers..." },
                { number: "03", icon: "Camera", title: "The Shoot Day", description: "A comfortable..." },
                { number: "04", icon: "PenTool", title: "Cinematic Editing", description: "Applying award-winning..." },
                { number: "05", icon: "CheckCircle", title: "Premium Delivery", description: "Receive wooden bound..." }
              ]).map((step: any, idx: number) => {
                const IconComponent = iconMap[step.icon] || HelpCircle;
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start ${isDark ? "bg-black/30 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                    <div className="w-10 h-10 rounded-full bg-[#d1b06c]/10 text-[#d1b06c] border border-[#d1b06c]/20 flex items-center justify-center shrink-0">
                      <IconComponent size={20} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-grow w-full">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Step No.</label>
                        <input
                          type="text"
                          value={step.number}
                          onChange={(e) => handleProcessStepChange(idx, "number", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Step Icon</label>
                        <select
                          value={step.icon}
                          onChange={(e) => handleProcessStepChange(idx, "icon", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        >
                          <option value="MessageSquare">MessageSquare (Consult)</option>
                          <option value="Layers">Layers (Setup)</option>
                          <option value="Camera">Camera (Shoot)</option>
                          <option value="PenTool">PenTool (Editing)</option>
                          <option value="CheckCircle">CheckCircle (Delivery)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Step Title</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleProcessStepChange(idx, "title", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] uppercase text-gray-400 font-mono">Step Description</label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => handleProcessStepChange(idx, "description", e.target.value)}
                          className={`p-2 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Testimonials CRUD */}
      {subTab === "testimonials" && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {(localContent.testimonials || []).map((review: any) => (
              <div key={review.id} className={`p-5 rounded-xl border flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-800 bg-gray-900 shrink-0">
                      <img src={review.avatar || "/img/clients/1.jpg"} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{review.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{review.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleUpdateTestimonial(review.id, "rating", i + 1)}
                          className="text-[#d1b06c] focus:outline-none"
                        >
                          <Star key={i} size={14} fill={i < review.rating ? "var(--accent)" : "none"} stroke="var(--accent)" />
                        </button>
                      ))}
                    </div>
                    
                    <button onClick={() => handleDeleteTestimonial(review.id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Reviewer Name</label>
                    <input
                      type="text"
                      value={review.name}
                      onChange={(e) => handleUpdateTestimonial(review.id, "name", e.target.value)}
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Source Platform</label>
                    <input
                      type="text"
                      value={review.role}
                      onChange={(e) => handleUpdateTestimonial(review.id, "role", e.target.value)}
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">Review Text Description</label>
                  <textarea
                    value={review.text}
                    onChange={(e) => handleUpdateTestimonial(review.id, "text", e.target.value)}
                    className={`p-2.5 rounded-lg border text-xs focus:outline-none h-16 resize-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Testimonial */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)] flex items-center gap-2"><User size={16} className="text-[#d1b06c]"/> Add New Testimonial Review</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Swati Agrawal"
                  className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Platform / Role Label</label>
                <input
                  type="text"
                  placeholder="e.g. Google Reviews"
                  className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Rating Stars</label>
                <select
                  className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Bad)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Reviewer Avatar Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`p-2.5 rounded-lg border text-xs flex-grow focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={newTestimonial.avatar}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, avatar: e.target.value }))}
                  />
                  <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3.5 py-3 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center shrink-0">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const toastId = toast.loading("Uploading avatar...");
                        try {
                          const url = await uploadImageFile(files[0], "avatars");
                          setNewTestimonial(prev => ({ ...prev, avatar: url }));
                          toast.success("Avatar image uploaded!", { id: toastId });
                        } catch (err: any) {
                          toast.error(err.message, { id: toastId });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Review Text Comment</label>
              <textarea
                placeholder="Write what the client said about the studio..."
                className={`p-2.5 rounded-lg border text-xs focus:outline-none h-20 ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
              />
            </div>

            <button onClick={handleAddTestimonial} className="btn-primary py-3 rounded-xl font-bold text-sm clickable mt-2">
              Add Review
            </button>
          </div>
        </div>
      )}
      {subTab === "homepage-categories" && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {(localContent.categories || []).map((cat: any, idx: number) => (
              <div key={idx} className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
                <div className="flex items-center justify-between border-b pb-4 border-dashed border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Homepage Category Card {idx + 1}</span>
                  <button onClick={() => handleDeleteHomepageCat(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Card Name</label>
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={cat.name}
                      onChange={(e) => handleHomepageCatChange(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Description Subtitle</label>
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={cat.description || ""}
                      onChange={(e) => handleHomepageCatChange(idx, "description", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Page Route URL (e.g. /services/baby)</label>
                    <input
                      type="text"
                      className={`p-2.5 rounded-lg border text-xs focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                      value={cat.url || ""}
                      onChange={(e) => handleHomepageCatChange(idx, "url", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Card Thumbnail Image</label>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        className={`p-2.5 rounded-lg border text-xs flex-grow min-w-0 focus:outline-none ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                        value={cat.image}
                        onChange={(e) => handleHomepageCatChange(idx, "image", e.target.value)}
                      />
                      <label className="bg-gray-800 hover:bg-gray-700 text-white text-[10px] px-3 py-2.5 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center shrink-0">
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            const toastId = toast.loading("Uploading thumbnail image...");
                            try {
                              const url = await uploadImageFile(files[0], "homepage-cats");
                              handleHomepageCatChange(idx, "image", url);
                              toast.success("Thumbnail image updated! Remember to save.", { id: toastId });
                            } catch (err: any) {
                              toast.error(err.message, { id: toastId });
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openImagePicker(`cat-${idx}`)}
                        className="bg-[#d1b06c] hover:bg-[#c9a85a] text-black text-[10px] px-3 py-2.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <ImageIcon size={12} /> Pick
                      </button>
                    </div>
                    {cat.image && (
                      <div className="mt-1 rounded-lg overflow-hidden border border-[var(--card-border)] w-20 h-14 relative shrink-0">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Card Form */}
          <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-[#eee]"}`}>
            <h3 className="text-base font-bold uppercase tracking-widest border-b pb-3 border-[var(--card-border)]">Add New Category Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Card Name</label>
                <input
                  className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newHomepageCat.name}
                  onChange={(e) => setNewHomepageCat(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Birthday Shoots"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Subtitle Description</label>
                <input
                  className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newHomepageCat.description}
                  onChange={(e) => setNewHomepageCat(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 1st year celebrations"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Page URL Route</label>
                <input
                  className={`p-3 rounded-lg border text-sm focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                  value={newHomepageCat.url}
                  onChange={(e) => setNewHomepageCat(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="e.g. /services/baby"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    className={`p-3 rounded-lg border text-sm flex-grow focus:outline-none focus:border-[var(--accent)] ${isDark ? "bg-black border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-black"}`}
                    value={newHomepageCat.image}
                    onChange={(e) => setNewHomepageCat(prev => ({ ...prev, image: e.target.value }))}
                  />
                  <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-3 rounded-lg cursor-pointer font-bold uppercase tracking-wider flex items-center shrink-0">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const toastId = toast.loading("Uploading new card thumbnail...");
                        try {
                          const url = await uploadImageFile(files[0], "homepage-cats");
                          setNewHomepageCat(prev => ({ ...prev, image: url }));
                          toast.success("Thumbnail uploaded!", { id: toastId });
                        } catch (err: any) {
                          toast.error(err.message, { id: toastId });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
            <button onClick={handleAddHomepageCat} className="btn-primary py-3 rounded-xl font-bold text-sm clickable mt-2">
              Add Category Card
            </button>
          </div>
        </div>
      )}

      {/* ====== IMAGE PICKER MODAL ====== */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.75)" }}>
          <div className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${isDark ? "bg-[#0d0d0d] border-[#2a2a2a]" : "bg-white border-[#ddd]"}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] shrink-0">
              <div>
                <h3 className="font-bold text-base uppercase tracking-widest">Pick from Gallery</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  {pickerTarget === "hero" ? "Selecting → Hero Background" :
                   pickerTarget === "about-image" ? "Selecting → About Section Image" :
                   `Selecting → Category Card Thumbnail`}
                </p>
              </div>
              <button onClick={() => setPickerOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-[var(--card-border)] overflow-x-auto shrink-0">
              <button
                onClick={() => setPickerFilterCat("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${pickerFilterCat === "all" ? "bg-[#d1b06c] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                All Images ({allGalleryImages.length})
              </button>
              {Object.entries(localContent.categoryGalleries || {}).map(([catKey, catData]: [string, any]) =>
                (catData.images || []).length > 0 ? (
                  <button
                    key={catKey}
                    onClick={() => setPickerFilterCat(catKey)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${pickerFilterCat === catKey ? "bg-[#d1b06c] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {catData.name} ({catData.images.length})
                  </button>
                ) : null
              )}
            </div>

            {/* Images Grid */}
            <div className="overflow-y-auto flex-1 p-6">
              {allGalleryImages.filter(img => pickerFilterCat === "all" || img.catKey === pickerFilterCat).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <ImageIcon size={48} className="mb-4 opacity-30" />
                  <p className="text-sm font-mono">No images found. Upload images to the Categories &amp; Galleries tab first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {allGalleryImages
                    .filter(img => pickerFilterCat === "all" || img.catKey === pickerFilterCat)
                    .map((img: any) => {
                      const isCurrentHero = pickerTarget === "hero" && localContent.hero?.backgroundImage === img.url;
                      const isCatSelected = pickerTarget?.startsWith("cat-") &&
                        localContent.categories?.[parseInt(pickerTarget.replace("cat-",""))]?.image === img.url;
                      const isSelected = isCurrentHero || isCatSelected;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => pickImage(img.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.03] focus:outline-none group ${isSelected ? "border-[#d1b06c] ring-2 ring-[#d1b06c]/50" : "border-transparent hover:border-[#d1b06c]/60"}`}
                        >
                          <img src={img.url} alt={img.catName} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#d1b06c]/20 flex items-center justify-center">
                              <div className="bg-[#d1b06c] rounded-full p-1.5">
                                <Check size={16} className="text-black" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-[10px] text-white font-mono truncate">{img.catName}</p>
                          </div>
                        </button>
                      );
                    })
                  }
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[var(--card-border)] shrink-0 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-mono">Click any image to select it. Changes apply after you click Save Changes.</p>
              <button onClick={() => setPickerOpen(false)} className="px-5 py-2 rounded-xl border border-[var(--card-border)] text-xs font-bold uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
