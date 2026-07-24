"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Zap,
  CheckCircle,
  X,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import Image from "next/image";

const CATEGORIES = [
  { val: "gaming_pcs", label: "Gaming PCs" },
  { val: "business_laptops", label: "Business Laptops" },
  { val: "premium_used_laptops", label: "Premium Used Laptops" },
  { val: "second_hand_laptops", label: "Second-Hand Laptops" },
  { val: "servers", label: "Servers" },
  { val: "desktop_systems", label: "Desktop Systems" },
  { val: "accessories", label: "Accessories" },
  { val: "storage", label: "Storage" },
  { val: "networking", label: "Networking" },
  { val: "monitors", label: "Monitors" },
  { val: "cctv", label: "CCTV" },
];

export default function AdminProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden" | "out_of_stock" | "trash">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("gaming_pcs");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [warranty, setWarranty] = useState("");
  const [condition, setCondition] = useState("new");
  const [featured, setFeatured] = useState(false);
  const [latest, setLatest] = useState(false);
  const [imageUrl, setImageUrl] = useState("/images/poster-products.png");

  const loadProducts = async () => {
    const list = await dbHelper.products.list();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener("nexbyte-realtime", loadProducts);
    return () => window.removeEventListener("nexbyte-realtime", loadProducts);
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setCategory("gaming_pcs");
    setPrice("45000");
    setDiscount("10");
    setStock("12");
    setWarranty("1 Year Warranty");
    setCondition("new");
    setFeatured(false);
    setLatest(false);
    setImageUrl("/images/poster-products.png");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setCategory(p.category);
    setPrice(String(p.price ?? ""));
    setDiscount(String(p.discount || 0));
    setStock(String(p.stock || 0));
    setWarranty(p.warranty || "");
    setCondition(p.condition || "new");
    setFeatured(p.featured || false);
    setLatest(p.latest || false);
    setImageUrl(p.image);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;

    const payload = {
      title,
      description,
      category,
      price: Number(price),
      discount: Number(discount),
      stock: Number(stock),
      warranty,
      condition,
      featured,
      latest,
      image: imageUrl,
      status: editingProduct ? editingProduct.status : "show",
      specs: editingProduct ? editingProduct.specs : { Processor: "Intel Core i5", RAM: "8GB", Storage: "512GB SSD" }
    };

    if (editingProduct) {
      await dbHelper.products.update(editingProduct.id, payload);
    } else {
      await dbHelper.products.create(payload);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Move this product to Trash? It will be removed from customer website.")) {
      await dbHelper.products.delete(id);
      loadProducts();
    }
  };

  const handleRestore = async (id: string) => {
    await dbHelper.products.restore(id);
    loadProducts();
  };

  const handleToggleStatus = async (p: any) => {
    const nextStatus = p.status === "show" ? "hide" : "show";
    await dbHelper.products.update(p.id, { status: nextStatus });
    loadProducts();
  };

  const handleToggleFeatured = async (p: any) => {
    await dbHelper.products.update(p.id, { featured: !p.featured });
    loadProducts();
  };

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to move ${selectedIds.length} selected products to Trash?`)) {
      for (const id of selectedIds) {
        await dbHelper.products.delete(id);
      }
      setSelectedIds([]);
      loadProducts();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  // Filter calculations
  const filteredProducts = products.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchLower) ||
      (p.description || "").toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (statusFilter === "active") return (!p.status || p.status === "show") && (p.stock === undefined || p.stock > 0);
    if (statusFilter === "hidden") return p.status === "hide";
    if (statusFilter === "out_of_stock") return p.stock === 0;
    if (statusFilter === "trash") return p.status === "deleted";
    return p.status !== "deleted"; // "all" excludes soft-deleted trash items
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Products Catalog</h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage systems supply chains, pricing points, discounts, and visual banners.</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn-secondary !py-2.5 !px-4 text-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
            >
              Bulk Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" /> Add Product Item
          </button>
        </div>
      </div>

      {/* Search & Status Filter Strip */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            placeholder="Search systems title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-nex-black p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: "all", label: "All Items" },
            { id: "active", label: "Active" },
            { id: "hidden", label: "Hidden" },
            { id: "out_of_stock", label: "Out of Stock" },
            { id: "trash", label: "Trash" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? "bg-nex-blue text-white shadow-glow-blue font-bold"
                  : "text-nex-mist hover:text-white hover:bg-white/5"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <ShoppingBag className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No products found matching criteria.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3 px-5 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-nex-black border-white/20 text-nex-blue"
                    />
                  </th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing &amp; Stock</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    
                    {/* Checkbox */}
                    <td className="py-4 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded bg-nex-black border-white/20 text-nex-blue"
                      />
                    </td>

                    {/* Image & Title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 p-1 flex items-center justify-center">
                          <Image src={p.image} alt={p.title} width={36} height={36} className="object-contain" />
                        </div>
                        <div>
                          <div className="font-semibold text-white truncate max-w-[180px]">{p.title}</div>
                          <div className="text-[10px] text-nex-mist mt-0.5 capitalize">{p.condition?.replace("_", " ")}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold text-white/80">
                      {CATEGORIES.find((c) => c.val === p.category)?.label || p.category}
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">Rs. {(p.price ?? 0).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-nex-mist mt-0.5">Stock: <span className="text-white font-bold">{p.stock}</span></div>
                    </td>

                    {/* Flags */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex flex-wrap gap-1.5">
                        {p.featured && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] text-amber-400 font-bold uppercase flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-amber-400" /> Featured
                          </span>
                        )}
                        {p.latest && (
                          <span className="rounded bg-nex-blue/20 border border-nex-blue/30 px-2 py-0.5 text-[8px] text-nex-blueLight font-bold uppercase flex items-center gap-0.5">
                            <Zap className="h-2.5 w-2.5" /> Latest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right space-x-1.5">
                      {p.status === "deleted" ? (
                        <button
                          onClick={() => handleRestore(p.id)}
                          className="h-8 px-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-xs font-semibold inline-flex items-center gap-1"
                          title="Restore Product to Catalog"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`h-8 w-8 rounded-full border border-transparent flex items-center justify-center inline-flex ${
                              p.featured
                                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                : "bg-white/5 text-white/40 hover:bg-white/10"
                            }`}
                            title={p.featured ? "Remove from Featured" : "Mark as Featured"}
                          >
                            <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-400" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`h-8 w-8 rounded-full border border-transparent flex items-center justify-center inline-flex ${
                              p.status === "show"
                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "bg-white/5 text-white/40 hover:bg-white/10"
                            }`}
                            title={p.status === "show" ? "Hide from website" : "Show on website"}
                          >
                            {p.status === "show" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="h-8 w-8 rounded-full bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 flex items-center justify-center inline-flex text-white"
                            title="Edit Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="h-8 w-8 rounded-full bg-red-500/10 border border-transparent hover:border-red-500/20 hover:bg-red-500/20 flex items-center justify-center inline-flex text-red-400"
                            title="Move to Trash"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="glass-panel relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold text-white mb-6">
              {editingProduct ? "Modify Product Specifications" : "Register New Product Item"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lenovo ThinkPad T480"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.val} value={c.val}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">Item Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize processor, graphics, memory configurations..."
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Discount */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Discount (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="10"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="12"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Warranty */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Warranty Terms</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Brand Warranty"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Condition */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Product Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="new">Brand New</option>
                    <option value="premium_used">Premium Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Image URL Mock */}
                <div className="space-y-1">
                  <label className="text-xs text-white/80 font-semibold">Image Asset URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="pt-2 flex items-center gap-6 text-xs text-white/95">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-nex-black border-white/20 text-nex-blue focus:ring-0"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={latest}
                    onChange={(e) => setLatest(e.target.checked)}
                    className="rounded bg-nex-black border-white/20 text-nex-blue focus:ring-0"
                  />
                  <span>Mark as Latest Arrival</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
