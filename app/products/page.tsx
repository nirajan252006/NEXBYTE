"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/lib/data";
import { getSafeImageSrc, cn } from "@/lib/utils";
import {
  Search,
  Heart,
  Eye,
  X,
  GitCompare,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Laptop,
  Filter,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Star,
  Layers,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { safeJsonFetch } from "@/lib/apiHelper";
import { useCartStore } from "@/lib/cartStore";

// Plain language category cards
const CUSTOMER_CATEGORIES = [
  { val: "all", label: "All Products" },
  { val: "business_laptops", label: "Laptops" },
  { val: "desktop_systems", label: "Desktops" },
  { val: "gaming_pcs", label: "Gaming PCs" },
  { val: "monitors", label: "Monitors" },
  { val: "storage", label: "Storage (SSD / Hard Disk)" },
  { val: "ram", label: "RAM Memory" },
  { val: "accessories", label: "Accessories" },
  { val: "networking", label: "Networking & WiFi" },
  { val: "cctv", label: "CCTV Cameras" },
  { val: "printers", label: "Printers" },
  { val: "parts", label: "Computer Parts" },
];

export default function ProductsPage() {
  const addToCart = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedUsage, setSelectedUsage] = useState("all");
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showMobileFilterSheet, setShowMobileFilterSheet] = useState(false);

  // Favorites & Compare
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Modals
  const [productDetailModal, setProductDetailModal] = useState<Product | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [specsExpanded, setSpecsExpanded] = useState(false);

  // Laptop Enquiry Modal
  const [showLaptopEnquiryModal, setShowLaptopEnquiryModal] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryCity, setEnquiryCity] = useState("");
  const [enquiryType, setEnquiryType] = useState("Business Laptop");
  const [enquiryBudget, setEnquiryBudget] = useState("₹30,000 – ₹40,000");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccessRef, setEnquirySuccessRef] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const list = await dbHelper.products.list();
      setProducts(list);
    } catch (e) {
      console.error("Failed to load products", e);
    }
  };

  useEffect(() => {
    loadProducts();
    const stored = localStorage.getItem("nexbyte_wishlist");
    if (stored) {
      try { setWishlist(JSON.parse(stored)); } catch {}
    }
  }, []);

  const toggleWishlist = (id: string) => {
    const isFav = wishlist.includes(id);
    const updated = isFav ? wishlist.filter((item) => item !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("nexbyte_wishlist", JSON.stringify(updated));
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds((prev) => [prev[1], id]);
      } else {
        setCompareIds((prev) => [...prev, id]);
      }
    }
  };

  // Helper function for plain language benefit text
  const getSimpleBenefitLine = (prod: Product) => {
    const specs = prod.specs || {};
    const parts = [];
    if (specs.Storage) parts.push(specs.Storage.replace("NVMe PCIe Gen4 SSD", "Fast SSD").replace("SSD", "SSD"));
    if (specs.RAM) parts.push(`${specs.RAM} RAM`);
    if (specs.Processor) {
      const proc = specs.Processor;
      if (proc.includes("i7")) parts.push("Powerful i7 Processor");
      else if (proc.includes("i5")) parts.push("Intel i5 Processor");
      else if (proc.includes("i3")) parts.push("Intel i3 Processor");
      else if (proc.includes("Ryzen")) parts.push("AMD Ryzen Processor");
    }
    if (parts.length > 0) return parts.join(" • ");
    return "Tested for high performance & reliability";
  };

  // Suitable usage tags
  const getUsageChecklist = (prod: Product) => {
    const cat = prod.category;
    if (cat === "gaming_pcs") return ["Gaming", "3D Editing", "Programming", "High Performance"];
    if (cat === "business_laptops" || cat === "premium_used_laptops" || cat === "second_hand_laptops") {
      return ["Office Work", "Study & Online Classes", "Programming", "Daily Use"];
    }
    return ["Office & Business", "Home Use", "Daily Operations"];
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        prod.category === selectedCategory ||
        (selectedCategory === "business_laptops" && (prod.category === "premium_used_laptops" || prod.category === "second_hand_laptops"));

      const matchesPrice = (prod.price || 0) <= maxPrice;
      const matchesOffers = showOffersOnly ? Boolean(prod.discount && prod.discount > 0) : true;
      const matchesWishlist = showWishlistOnly ? wishlist.includes(prod.id) : true;

      return matchesSearch && matchesCat && matchesPrice && matchesOffers && matchesWishlist;
    });
  }, [products, search, selectedCategory, maxPrice, showOffersOnly, showWishlistOnly, wishlist]);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-nex-blue/10 border border-nex-blue/20 px-3 py-1 text-xs font-bold text-nex-blue dark:text-nex-blueLight mb-3">
              <ShoppingBag className="h-3.5 w-3.5" /> NexByte Computer Store
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Buy Computers &amp; Accessories
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Simple pricing, tested hardware, genuine warranty, and doorstep assistance.
            </p>
          </div>

          {/* Simple Language Category Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {CUSTOMER_CATEGORIES.map((cat) => (
              <button
                key={cat.val}
                onClick={() => setSelectedCategory(cat.val)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all border shadow-sm",
                  selectedCategory === cat.val
                    ? "bg-nex-blue text-white border-nex-blue"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search, Filter Bar & Actions */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search laptops, computers, accessories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-nex-blue"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Mobile Filter Sheet Trigger */}
              <button
                onClick={() => setShowMobileFilterSheet(true)}
                className="md:hidden flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <Filter className="h-3.5 w-3.5 text-nex-blue" />
                <span>Filters</span>
              </button>

              {/* Favorites Filter Toggle */}
              <button
                onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all border",
                  showWishlistOnly
                    ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800"
                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                )}
              >
                <Heart className={cn("h-3.5 w-3.5", showWishlistOnly && "fill-rose-500 text-rose-500")} />
                <span>Favorites ({wishlist.length})</span>
              </button>

              {/* Compare Button */}
              {compareIds.length > 0 && (
                <button
                  onClick={() => setShowCompareDrawer(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-nex-blue text-white px-3 py-2 text-xs font-bold shadow-sm"
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>Compare ({compareIds.length})</span>
                </button>
              )}

              <button
                onClick={() => setShowLaptopEnquiryModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 text-xs font-bold shadow-sm"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Ask About Laptop</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
              <Laptop className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Need a specific laptop or custom PC setup? Tell us what you need and our technicians will assist you.
              </p>
              <button
                onClick={() => setShowLaptopEnquiryModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-nex-blue text-white px-5 py-2.5 text-xs font-bold shadow-md"
              >
                <Sparkles className="h-4 w-4" /> Send Custom Requirement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const isFav = wishlist.includes(prod.id);
                const isComparing = compareIds.includes(prod.id);

                return (
                  <div
                    key={prod.id}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image & Offer Badges */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center mb-3 border border-slate-100 dark:border-white/5">
                        <img
                          src={getSafeImageSrc(prod.image)}
                          alt={prod.title}
                          className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top Offer Badge */}
                        {prod.discount && prod.discount > 0 ? (
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm">
                            {prod.discount}% OFF
                          </span>
                        ) : null}

                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-slate-700 dark:text-white shadow-sm hover:scale-110 transition-all"
                        >
                          <Heart className={cn("h-4 w-4", isFav && "fill-rose-500 text-rose-500")} />
                        </button>
                      </div>

                      {/* Product Name & Benefit Line (No Spec List clutter) */}
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {prod.title}
                      </h3>

                      <p className="text-xs text-nex-blue dark:text-nex-blueLight font-semibold mt-1">
                        {getSimpleBenefitLine(prod)}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Pricing & Clean Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Price</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                            ₹{(prod.price || 0).toLocaleString("en-IN")}
                          </span>
                          {prod.discount && prod.discount > 0 ? (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{Math.round((prod.price || 0) * (1 + prod.discount / 100)).toLocaleString("en-IN")}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setProductDetailModal(prod);
                            setActiveGalleryIndex(0);
                            setSpecsExpanded(false);
                          }}
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => addToCart(prod)}
                          className="rounded-xl bg-nex-blue hover:bg-blue-600 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> +Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* PRODUCT DETAILS MODAL */}
      {productDetailModal && (() => {
        const prod = productDetailModal;
        const gallery = (prod.images && prod.images.length > 0)
          ? prod.images.map((i) => i.url)
          : [prod.image];
        const activeImg = gallery[activeGalleryIndex] || prod.image;
        const usageList = getUsageChecklist(prod);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setProductDetailModal(null)} />

            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl z-10 text-slate-900 dark:text-white">
              <button
                onClick={() => setProductDetailModal(null)}
                className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Gallery */}
                <div>
                  <div className="relative aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-3">
                    <img src={getSafeImageSrc(activeImg)} alt={prod.title} className="object-contain max-h-full max-w-full" />
                  </div>

                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {gallery.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={cn(
                            "h-14 w-14 rounded-xl border p-1 shrink-0 overflow-hidden",
                            activeGalleryIndex === idx ? "border-nex-blue ring-2 ring-nex-blue/30" : "border-slate-200 dark:border-white/10"
                          )}
                        >
                          <img src={getSafeImageSrc(imgUrl)} alt="thumb" className="object-contain h-full w-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info & Good for Checklist */}
                <div className="space-y-4">
                  <div>
                    <span className="rounded-full bg-nex-blue/10 border border-nex-blue/20 px-2.5 py-0.5 text-[10px] font-bold text-nex-blue uppercase">
                      {prod.category.replace("_", " ")}
                    </span>
                    <h2 className="font-display text-xl font-bold mt-1.5">{prod.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{prod.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-extrabold text-nex-blue">
                      ₹{(prod.price || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Warranty Included</span>
                  </div>

                  {/* "Good For:" Checklist */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200/60 dark:border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Good for:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {usageList.map((useItem, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{useItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Technical Specs */}
                  <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                    <button
                      onClick={() => setSpecsExpanded(!specsExpanded)}
                      className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 py-1"
                    >
                      <span>Technical Specifications</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", specsExpanded && "rotate-180")} />
                    </button>

                    {specsExpanded && (
                      <div className="mt-2 space-y-1.5 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                        {Object.entries(prod.specs || {}).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-1">
                            <span className="text-slate-500">{k}:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        addToCart(prod);
                        setProductDetailModal(null);
                      }}
                      className="flex-1 rounded-xl bg-nex-blue hover:bg-blue-600 text-white font-bold text-xs py-3 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setProductDetailModal(null);
                        setShowLaptopEnquiryModal(true);
                      }}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white font-bold text-xs py-3 flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" /> Ask About Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
    </>
  );
}
