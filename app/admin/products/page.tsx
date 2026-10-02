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
  RotateCcw,
  Upload,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  Loader2
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/utils";

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

export type ProductImageItem = {
  id: string;
  url: string;
  file?: File;
  is_primary: boolean;
  sort_order: number;
  alt_text?: string;
  isUploading?: boolean;
  uploadError?: string;
};

export default function AdminProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden" | "out_of_stock" | "pending_approval" | "trash">("all");
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

  // Multi-Image Upload State
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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
    setProductImages([]);
    setImageError("");
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
    setImageError("");

    // Populate existing images
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      setProductImages(p.images.map((img: any, idx: number) => ({
        id: img.id || `img-${idx}-${Date.now()}`,
        url: img.url || img,
        is_primary: img.is_primary !== undefined ? Boolean(img.is_primary) : (img.url === p.image || idx === 0),
        sort_order: img.sort_order || idx + 1,
        alt_text: img.alt_text || ""
      })));
    } else {
      setProductImages([{
        id: `img-primary-${Date.now()}`,
        url: p.image || "/images/poster-products.png",
        is_primary: true,
        sort_order: 1,
        alt_text: p.title || "Product Image"
      }]);
    }
    setIsModalOpen(true);
  };

  // Image Upload File Handlers
  const handleFileSelect = (files: File[]) => {
    setImageError("");
    const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles: File[] = [];

    for (const f of files) {
      const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      const isValidExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
      const isValidMime = validMimeTypes.includes(f.type.toLowerCase());

      if (!isValidMime && !isValidExt) {
        setImageError(`File "${f.name}" is unsupported. Please upload JPG, PNG, or WebP.`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setImageError(`File "${f.name}" exceeds maximum limit of 5 MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    const currentCount = productImages.length;
    if (currentCount + validFiles.length > 10) {
      setImageError("Maximum 10 product images allowed.");
    }

    const allowedFiles = validFiles.slice(0, Math.max(0, 10 - currentCount));
    const newItems: ProductImageItem[] = allowedFiles.map((file, idx) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: URL.createObjectURL(file),
      file,
      is_primary: currentCount === 0 && idx === 0,
      sort_order: currentCount + idx + 1,
      alt_text: ""
    }));

    setProductImages((prev) => {
      const combined = [...prev, ...newItems];
      if (combined.length > 0 && !combined.some((i) => i.is_primary)) {
        combined[0].is_primary = true;
      }
      return combined;
    });
  };

  const handleSetPrimary = (id: string) => {
    setProductImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id: string) => {
    setProductImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.url && target.url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(target.url);
        } catch {}
      }
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered.map((img, idx) => ({ ...img, sort_order: idx + 1 }));
    });
  };

  const handleCloseModal = () => {
    if (uploading) return;
    productImages.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(img.url);
        } catch {}
      }
    });
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= productImages.length) return;

    setProductImages((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[targetIndex];
      arr[targetIndex] = temp;
      return arr.map((img, idx) => ({ ...img, sort_order: idx + 1 }));
    });
  };

  const handleAltTextChange = (id: string, alt_text: string) => {
    setProductImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt_text } : img))
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;

    if (productImages.length === 0) {
      setImageError("At least 1 product image is required.");
      return;
    }

    setUploading(true);
    setImageError("");
    setUploadProgress("Uploading product images...");

    try {
      const uploadedImages: ProductImageItem[] = [];
      const targetProductId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;

      for (let i = 0; i < productImages.length; i++) {
        const item = productImages[i];
        if (item.file) {
          setUploadProgress(`Uploading image ${i + 1} of ${productImages.length}...`);
          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("productId", targetProductId);

          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await res.json();

          if (json.success && json.fileUrl) {
            uploadedImages.push({
              id: item.id,
              url: json.fileUrl,
              is_primary: item.is_primary,
              sort_order: i + 1,
              alt_text: item.alt_text || ""
            });
          } else {
            throw new Error(json.message || `Failed to upload image ${i + 1}`);
          }
        } else {
          uploadedImages.push({
            ...item,
            sort_order: i + 1
          });
        }
      }

      // Guarantee at least 1 Primary image
      if (uploadedImages.length > 0 && !uploadedImages.some((img) => img.is_primary)) {
        uploadedImages[0].is_primary = true;
      }

      const primaryImageUrl = uploadedImages.find((img) => img.is_primary)?.url || uploadedImages[0]?.url || "/images/poster-products.png";

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
        image: primaryImageUrl,
        images: uploadedImages.map((img) => ({
          id: img.id,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
          alt_text: img.alt_text || ""
        })),
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
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Failed to save product images. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Move this product to Trash? It will be removed from customer website.")) {
      await dbHelper.products.delete(id);
      loadProducts();
    }
  };

  const handleApproveProduct = async (p: any) => {
    await dbHelper.products.update(p.id, {
      approval_status: "approved",
      status: "show"
    });
    try {
      await dbHelper.notifications.create({
        title: "Product Approved",
        message: `Product "${p.title}" has been approved by admin and is live on store.`,
        type: "product",
        target_role: "reseller"
      });
    } catch {}
    loadProducts();
  };

  const handleRejectProduct = async (p: any) => {
    await dbHelper.products.update(p.id, {
      approval_status: "rejected",
      status: "hide"
    });
    try {
      await dbHelper.notifications.create({
        title: "Product Rejected",
        message: `Product "${p.title}" has been rejected by admin.`,
        type: "product",
        target_role: "reseller"
      });
    } catch {}
    loadProducts();
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
    if (statusFilter === "hidden") return p.status === "hide" && p.approval_status !== "pending";
    if (statusFilter === "out_of_stock") return p.stock === 0;
    if (statusFilter === "pending_approval") return p.approval_status === "pending" || p.status === "pending";
    if (statusFilter === "trash") return p.status === "deleted";
    return p.status !== "deleted"; // "all" excludes soft-deleted trash items
  });

  const pendingCount = products.filter((p) => p.approval_status === "pending" || p.status === "pending").length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Products Catalog</h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage systems supply chains, pricing points, reseller submissions, and galleries.</p>
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
            { id: "pending_approval", label: `Pending (${pendingCount})` },
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
                  : pill.id === "pending_approval" && pendingCount > 0
                  ? "bg-amber-500/20 text-amber-300 font-bold"
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
                {filteredProducts.map((p) => {
                  const imageCount = p.images?.length || (p.image ? 1 : 0);
                  return (
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
                            <Image src={getSafeImageSrc(p.image)} alt={p.title || "Product"} width={36} height={36} className="object-contain" />
                            {imageCount > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                                {imageCount}
                              </span>
                            )}
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

                      {/* Flags & Status Badges */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex flex-wrap gap-1.5">
                          {(p.approval_status === "pending" || p.status === "pending") && (
                            <span className="rounded bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[8px] text-amber-300 font-extrabold uppercase animate-pulse">
                              Pending Approval
                            </span>
                          )}
                          {p.approval_status === "approved" && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] text-emerald-400 font-bold uppercase">
                              Approved
                            </span>
                          )}
                          {p.approval_status === "rejected" && (
                            <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] text-red-400 font-bold uppercase">
                              Rejected
                            </span>
                          )}
                          {p.seller_id && (
                            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[8px] text-purple-300 font-bold uppercase">
                              Reseller
                            </span>
                          )}
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
                        ) : (p.approval_status === "pending" || p.status === "pending") ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveProduct(p)}
                              className="h-7 px-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1"
                              title="Approve Reseller Product"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectProduct(p)}
                              className="h-7 px-2.5 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 text-[11px] font-bold inline-flex items-center gap-1"
                              title="Reject Reseller Product"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => !uploading && setIsModalOpen(false)} />
          
          <div className="glass-panel relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => !uploading && setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
              disabled={uploading}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* PRODUCT IMAGES MULTI-UPLOADER SECTION */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/90 font-bold uppercase tracking-wider">
                    Product Images *
                  </label>
                  <span className={`text-[11px] font-bold ${productImages.length >= 10 ? "text-amber-400" : "text-nex-mist"}`}>
                    {productImages.length} / 10 images
                  </span>
                </div>

                {imageError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-semibold flex items-center justify-between">
                    <span>{imageError}</span>
                    <button type="button" onClick={() => setImageError("")} className="text-red-400 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Drag & Drop Upload Zone */}
                {productImages.length < 10 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.length) {
                        handleFileSelect(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragging
                        ? "border-nex-blue bg-nex-blue/10 scale-[1.01]"
                        : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleFileSelect(Array.from(e.target.files));
                        }
                        e.target.value = "";
                      }}
                      className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="h-10 w-10 rounded-full bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Drag &amp; Drop Product Images Here</p>
                        <p className="text-[11px] text-nex-mist mt-0.5">JPG, PNG or WebP • Maximum 10 images (Up to 5MB each)</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary !py-1.5 !px-3.5 text-xs mt-1 pointer-events-auto"
                      >
                        + Browse Images
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {uploading && (
                  <div className="rounded-xl bg-nex-blue/10 border border-nex-blue/20 p-3 text-xs text-nex-blueLight flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0 text-nex-blueLight" />
                    <span>{uploadProgress || "Uploading product images..."}</span>
                  </div>
                )}

                {/* Image Preview Grid */}
                {productImages.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productImages.map((img, index) => (
                        <div
                          key={img.id}
                          className={`relative rounded-xl overflow-hidden border bg-nex-black/60 p-2 flex flex-col justify-between transition-all ${
                            img.is_primary
                              ? "border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/50"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {/* Primary Badge */}
                          {img.is_primary && (
                            <div className="absolute top-2 left-2 z-10 rounded bg-amber-500 text-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow">
                              PRIMARY
                            </div>
                          )}

                          {/* Thumbnail */}
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white/5 border border-white/5 mb-2 flex items-center justify-center p-1">
                            <img
                              src={img.url}
                              alt={img.alt_text || `Product image ${index + 1}`}
                              className="object-contain max-h-full max-w-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/images/poster-products.png"; }}
                            />
                            {img.file && (
                              <span className="absolute bottom-1 right-1 bg-nex-blue/90 text-white text-[8px] font-bold px-1 rounded">
                                New
                              </span>
                            )}
                          </div>

                          {/* Controls */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-nex-mist">
                              <span>Img #{index + 1}</span>
                              {!img.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(img.id)}
                                  className="text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-0.5"
                                >
                                  <Star className="h-3 w-3" /> Set Primary
                                </button>
                              )}
                            </div>

                            {/* Alt Text Input */}
                            <input
                              type="text"
                              value={img.alt_text || ""}
                              onChange={(e) => handleAltTextChange(img.id, e.target.value)}
                              placeholder="Alt text (e.g. Front view)"
                              className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-2 py-1 text-[10px] text-white focus:outline-none placeholder-white/20"
                            />

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveImage(index, "left")}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === productImages.length - 1}
                                  onClick={() => handleMoveImage(index, "right")}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
                                  title="Move Right"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px]"
                                title="Remove image"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-nex-mist italic">
                      💡 Use arrows to reorder images. The PRIMARY image will be displayed on customer product cards.
                    </p>
                  </div>
                )}
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
                  onClick={() => !uploading && setIsModalOpen(false)}
                  className="btn-secondary !py-2 !px-4"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary !py-2 !px-5 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function getStatusConfig(val: string) {
  return { value: val };
}
