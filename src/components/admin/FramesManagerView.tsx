import React, { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Search, Filter, RefreshCw, Eye, CheckCircle2, 
  XCircle, Image as ImageIcon, LayoutGrid, List, SlidersHorizontal, 
  Upload, Tag, DollarSign, Palette, CheckSquare, Square, X, Download, Info
} from "lucide-react";

export default function FramesManagerView({ isDark }: { isDark: boolean }) {
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({ total: 0, outOfStock: 0, featured: 0 });

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", category: "Wedding Frames", style: "Classic", size: "12x18",
    material: "Wood", color: "Black", orientation: "Portrait", thickness: "1 inch",
    finish: "Matte", description: "", price: 0, discount: 0,
    isFeatured: false, isPopular: false, isBestSeller: false, isNew: true,
    availability: true, images: [] as string[]
  });

  useEffect(() => {
    fetchFrames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, category, limit: "100" });
      const res = await fetch(`/api/admin/frames?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFrames(data.frames || []);
        
        // Calculate metrics
        const total = data.frames.length;
        const outOfStock = data.frames.filter((f: any) => !f.availability).length;
        const featured = data.frames.filter((f: any) => f.isFeatured).length;
        setMetrics({ total, outOfStock, featured });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(frames.map(f => f.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} frames?`)) return;
    try {
      const res = await fetch(`/api/admin/frames?ids=${selectedIds.join(",")}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedIds([]);
        fetchFrames();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this frame?")) return;
    try {
      const res = await fetch(`/api/admin/frames?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchFrames();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/frames";
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { id: editingId, frame: formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsFormOpen(false);
        fetchFrames();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
    try {
      const newImages = [...formData.images];
      for (const file of Array.from(e.target.files)) {
        const formDataPayload = new FormData();
        formDataPayload.append("file", file);
        formDataPayload.append("collectionId", "frames");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formDataPayload
        });
        const data = await res.json();
        if (data.success) {
          newImages.push(data.fileUrl);
        }
      }
      setFormData({ ...formData, images: newImages });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      name: "", category: "Wedding Frames", style: "Classic", size: "12x18",
      material: "Wood", color: "Black", orientation: "Portrait", thickness: "1 inch",
      finish: "Matte", description: "", price: 0, discount: 0,
      isFeatured: false, isPopular: false, isBestSeller: false, isNew: true,
      availability: true, images: []
    });
    setIsFormOpen(true);
  };

  const openEditForm = (frame: any) => {
    setEditingId(frame.id);
    setFormData({ ...frame });
    setIsFormOpen(true);
  };
  
  const exportCSV = () => {
    const headers = ["Code,Name,Category,Price,Material,Stock"];
    const rows = frames.map(f => `${f.code},"${f.name}",${f.category},${f.price},${f.material},${f.availability ? 'In Stock' : 'Out'}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "frames_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-[var(--foreground)] tracking-wide">Photo Frames Inventory</h2>
          <p className="text-sm text-[var(--foreground)]/60">Manage the studio's 25+ feature frame catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm rounded-lg hover:border-[var(--accent)] transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={openAddForm} className="bg-[var(--accent)] text-[#06080c] px-5 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20">
            <Plus size={18} /> Add Frame Design
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-xl border border-[var(--card-border)] flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Total Frames</p>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">{metrics.total}</h3>
          </div>
        </div>
        <div className="glass p-5 rounded-xl border border-[var(--card-border)] flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Featured Collections</p>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">{metrics.featured}</h3>
          </div>
        </div>
        <div className="glass p-5 rounded-xl border border-[var(--card-border)] flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Out of Stock</p>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">{metrics.outOfStock}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass rounded-xl border border-[var(--card-border)] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={16} />
            <input 
              type="text" 
              placeholder="Search code, name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Categories</option>
            <option value="Wedding Frames">Wedding Frames</option>
            <option value="Baby Frames">Baby Frames</option>
            <option value="Premium Luxury Frames">Premium Luxury Frames</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 font-semibold">
              <Trash2 size={16} /> Delete ({selectedIds.length})
            </button>
          )}
          <div className="flex items-center border border-[var(--card-border)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
            <button 
              onClick={() => setViewMode("table")} 
              className={`p-2 ${viewMode === "table" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"} transition-colors`}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")} 
              className={`p-2 border-l border-[var(--card-border)] ${viewMode === "grid" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"} transition-colors`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button onClick={fetchFrames} className="p-2 text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-[var(--accent)]" size={32} /></div>
      ) : frames.length === 0 ? (
        <div className="glass rounded-xl border border-[var(--card-border)] p-12 text-center flex flex-col items-center">
          <ImageIcon size={48} className="text-[var(--foreground)]/20 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">No frames found</h3>
          <p className="text-[var(--foreground)]/50 mt-1 mb-6">Your inventory is empty or no frames match the filters.</p>
          <button onClick={openAddForm} className="text-[var(--accent)] font-semibold hover:underline flex items-center gap-2">
            <Plus size={16} /> Add First Frame
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="glass rounded-xl border border-[var(--card-border)] overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 text-[11px] uppercase tracking-wider text-[var(--foreground)]/50 font-semibold">
                <th className="p-4 w-12">
                  <input type="checkbox" checked={selectedIds.length === frames.length && frames.length > 0} onChange={handleSelectAll} className="accent-[var(--accent)] rounded" />
                </th>
                <th className="p-4">Frame</th>
                <th className="p-4">Code / SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frames.map((frame, i) => (
                <tr key={frame.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--card-bg)]/30 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedIds.includes(frame.id)} onChange={() => handleSelectOne(frame.id)} className="accent-[var(--accent)] rounded" />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-[var(--card-border)] overflow-hidden bg-[var(--card-bg)] flex items-center justify-center shrink-0">
                      {frame.images && frame.images.length > 0 ? (
                        <img src={frame.images[0]} alt={frame.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-[var(--foreground)]/20" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{frame.name}</p>
                      <p className="text-[10px] text-[var(--foreground)]/50">{frame.size} • {frame.material}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-[var(--accent)]">{frame.code}</td>
                  <td className="p-4 text-sm text-[var(--foreground)]/70">{frame.category}</td>
                  <td className="p-4 text-sm font-semibold text-[var(--foreground)]">₹{frame.price}</td>
                  <td className="p-4">
                    {frame.availability ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded">
                        <CheckCircle2 size={12} /> In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded">
                        <XCircle size={12} /> Out
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {frame.isFeatured && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Featured"></span>}
                      {frame.isNew && <span className="w-2 h-2 rounded-full bg-blue-500" title="New"></span>}
                      {frame.isBestSeller && <span className="w-2 h-2 rounded-full bg-purple-500" title="Best Seller"></span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`/photo-frames?search=${frame.code}`} target="_blank" rel="noreferrer" className="p-1.5 text-[var(--foreground)]/50 hover:text-[var(--accent)] bg-[var(--card-bg)] rounded-md border border-[var(--card-border)]" title="Preview Live">
                        <Eye size={14} />
                      </a>
                      <button onClick={() => openEditForm(frame)} className="p-1.5 text-[var(--foreground)]/50 hover:text-blue-400 bg-[var(--card-bg)] rounded-md border border-[var(--card-border)]" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(frame.id)} className="p-1.5 text-[var(--foreground)]/50 hover:text-red-400 bg-[var(--card-bg)] rounded-md border border-[var(--card-border)]" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {frames.map(frame => (
            <div key={frame.id} className="glass rounded-xl border border-[var(--card-border)] overflow-hidden group">
              <div className="relative aspect-square bg-[var(--card-bg)]">
                {frame.images && frame.images.length > 0 ? (
                  <img src={frame.images[0]} alt={frame.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-[var(--foreground)]/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {frame.isFeatured && <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-yellow-500 text-black">Featured</span>}
                  {frame.isNew && <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-blue-500 text-white">New</span>}
                </div>
                {!frame.availability && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-full">Out of Stock</span>
                  </div>
                )}
                
                {/* Grid Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                   <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-[var(--accent)] font-semibold">{frame.code}</span>
                      <div className="flex gap-2">
                        <button onClick={() => openEditForm(frame)} className="text-white hover:text-blue-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(frame.id)} className="text-white hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                   </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-[var(--foreground)] truncate">{frame.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[var(--foreground)]/50">{frame.category}</span>
                  <span className="text-sm font-bold text-[var(--accent)]">₹{frame.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draw/Modal for Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[var(--background)] h-full overflow-y-auto border-l border-[var(--card-border)] shadow-2xl animate-slide-in-right">
            <div className="sticky top-0 z-10 glass border-b border-[var(--card-border)] p-4 flex justify-between items-center px-6">
              <h2 className="text-xl font-bold font-display text-[var(--foreground)]">{editingId ? 'Edit Frame Design' : 'Add New Frame Design'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
              
              {/* Media Upload */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--card-border)] pb-2 flex items-center gap-2"><ImageIcon size={14} /> Media Assets</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--card-border)] group">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ))}
                  
                  <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--card-border)] hover:border-[var(--accent)] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[var(--card-bg)] group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    {isUploading ? <RefreshCw size={20} className="animate-spin text-[var(--accent)]" /> : <Upload size={20} className="text-[var(--foreground)]/40 group-hover:text-[var(--accent)]" />}
                    <span className="text-xs text-[var(--foreground)]/50 group-hover:text-[var(--accent)]">{isUploading ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--card-border)] pb-2 flex items-center gap-2"><Info size={14} /> Basic Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Frame Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" placeholder="e.g. Vintage Royal Gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none">
                      {["Wedding Frames", "Pre-Wedding Frames", "Baby Frames", "Premium Luxury Frames", "Vintage Frames", "Modern Frames"].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Rich Description</label>
                  <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" placeholder="Describe the frame design, vibe, and ideal use cases..." />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--card-border)] pb-2 flex items-center gap-2"><SlidersHorizontal size={14} /> Specifications</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Material</label>
                    <input type="text" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Color</label>
                    <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Size</label>
                    <input type="text" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" placeholder="e.g. 12x18" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Orientation</label>
                    <select value={formData.orientation} onChange={(e) => setFormData({...formData, orientation: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none">
                      <option>Portrait</option><option>Landscape</option><option>Square</option><option>Any</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Badges */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--card-border)] pb-2 flex items-center gap-2"><DollarSign size={14} /> Pricing & Attributes</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Base Price (₹)</label>
                    <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--foreground)]/70 mb-1">Discount (%)</label>
                    <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none" />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <label className="flex items-center gap-3 p-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg w-full cursor-pointer hover:border-[var(--accent)] transition-colors">
                      <input type="checkbox" checked={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.checked})} className="accent-[var(--accent)] w-4 h-4" />
                      <span className="text-sm font-semibold text-[var(--foreground)]">In Stock Availability</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "isFeatured", label: "Featured" },
                    { key: "isPopular", label: "Popular" },
                    { key: "isBestSeller", label: "Best Seller" },
                    { key: "isNew", label: "New Arrival" }
                  ].map(({key, label}) => (
                    <label key={key} className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${formData[key as keyof typeof formData] ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)]/50 hover:border-[var(--foreground)]/30'}`}>
                      <input type="checkbox" className="hidden" checked={!!formData[key as keyof typeof formData]} onChange={(e) => setFormData({...formData, [key]: e.target.checked})} />
                      {formData[key as keyof typeof formData] ? <CheckSquare size={20} className="mb-2" /> : <Square size={20} className="mb-2" />}
                      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="sticky bottom-0 bg-[var(--background)] p-4 border-t border-[var(--card-border)] flex justify-end gap-3 -mx-6 -mb-6 px-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-red-400 transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className="bg-[var(--accent)] text-[#06080c] px-8 py-3 text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle2 size={18} /> {editingId ? 'Save Changes' : 'Publish Frame Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
