"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { dbHelper } from "@/lib/dbHelper";
import { safeJsonFetch } from "@/lib/apiHelper";
import { useCartStore } from "@/lib/cartStore";

const CATEGORIES = [
  { val: "all", label: "All Products" },
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

export default function ProductsPage() {
  const addToCart = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Modal views & Multi-Image Gallery State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewActiveImageIndex, setQuickViewActiveImageIndex] = useState(0);
  const [zoomModalImageUrl, setZoomModalImageUrl] = useState<string | null>(null);

  // Customer Laptop Enquiry Form Modal State
  const [showLaptopEnquiryModal, setShowLaptopEnquiryModal] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryCity, setEnquiryCity] = useState("");
  const [enquiryType, setEnquiryType] = useState("Business Laptop");
  const [enquiryBudget, setEnquiryBudget] = useState("₹30,000 – ₹40,000");
  const [enquiryBrand, setEnquiryBrand] = useState("Any Brand");
  const [enquiryProcessor, setEnquiryProcessor] = useState("No Preference");
  const [enquiryRam, setEnquiryRam] = useState("16 GB");
  const [enquiryStorage, setEnquiryStorage] = useState("512 GB");
  const [enquiryGpu, setEnquiryGpu] = useState("No Preference");
  const [enquiryCondition, setEnquiryCondition] = useState("Any");
  const [enquiryUseCase, setEnquiryUseCase] = useState("General Use");
  const [enquiryRequirements, setEnquiryRequirements] = useState("");
  const [enquiryContact, setEnquiryContact] = useState("WhatsApp");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccessRef, setEnquirySuccessRef] = useState<string | null>(null);

  // Booking inline form modal
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookCity, setBookCity] = useState("");
  const [bookBudget, setBookBudget] = useState("");
  const [bookQuantity, setBookQuantity] = useState("1");
  const [bookMessage, setBookMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

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
    window.addEventListener("nexbyte-realtime", loadProducts);
    return () => window.removeEventListener("nexbyte-realtime", loadProducts);
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

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookPhone || !bookingProduct) {
      setErrorMsg("Please fill in Name and Phone Number.");
      return;
    }

    if (honeypot) {
      setBookName("");
      setBookPhone("");
      setBookingProduct(null);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await safeJsonFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: bookName,
          phone: bookPhone,
          email: bookEmail || "",
          city: bookCity || "Bengaluru",
          requestType: "product",
          selectedItem: bookingProduct.title,
          description: bookMessage || "None",
          budget: bookBudget || "N/A",
          quantity: Number(bookQuantity || 1),
        }),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to submit booking.");
      }

      setCreatedBookingId(res.data.bookingId || res.data.booking?.bookingId || "NB-2026-SUBMITTED");
      setSuccessPopup(true);

      setBookName("");
      setBookPhone("");
      setBookEmail("");
      setBookCity("");
      setBookBudget("");
      setBookQuantity("1");
      setBookMessage("");
      setHoneypot("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaptopEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim() || !enquiryPhone.trim() || !enquiryCity.trim()) {
      setEnquiryError("Customer Name, Phone Number, and City are required.");
      return;
    }

    setEnquirySubmitting(true);
    setEnquiryError("");

    try {
      const res = await safeJsonFetch("/api/laptop-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: enquiryName,
          phone: enquiryPhone,
          email: enquiryEmail,
          city: enquiryCity,
          laptop_type: enquiryType,
          budget: enquiryBudget,
          brand_preference: enquiryBrand,
          processor_preference: enquiryProcessor,
          ram_preference: enquiryRam,
          storage_preference: enquiryStorage,
          gpu_preference: enquiryGpu,
          condition: enquiryCondition,
          use_case: enquiryUseCase,
          requirements: enquiryRequirements,
          preferred_contact: enquiryContact,
        }),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to submit laptop enquiry.");
      }

      setEnquirySuccessRef(res.data.referenceId || res.data.enquiry?.reference_id || "LE-2026-SUBMITTED");
    } catch (err: any) {
      console.error(err);
      setEnquiryError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(search.toLowerCase()) ||
      prod.description.toLowerCase().includes(search.toLowerCase()) ||
      Object.values(prod.specs || {}).some((v) => v.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === "all" ? true : prod.category === categoryFilter;
    const matchesWishlist = showWishlistOnly ? wishlist.includes(prod.id) : true;

    return matchesSearch && matchesCategory && matchesWishlist;
  });

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-nex-black pt-28 pb-16 overflow-hidden">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-nex-blue/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-nex-blueLight/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
              NEXBYTE HARDWARE HUB
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Premium Hardware <span className="text-gradient-blue">Catalog.</span>
            </h1>
            <p className="mt-4 text-base text-nex-mist leading-relaxed">
              Explore gaming rigs, certified premium used laptops, accessories, monitors, and security systems. Tap Compare to match specifications side-by-side.
            </p>
          </div>

          {/* Search, Favorites & Controls Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
              <input
                type="text"
                placeholder="Search specs, processors, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowWishlistOnly((prev) => !prev)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-xs font-semibold transition-all border flex items-center gap-2",
                  showWishlistOnly
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "glass-panel text-white/70 border-transparent hover:border-white/10 hover:bg-white/[0.06]"
                )}
              >
                <Heart className={cn("h-4 w-4", showWishlistOnly && "fill-red-400")} />
                <span>Favorites ({wishlist.length})</span>
              </button>

              {compareIds.length > 0 && (
                <button
                  onClick={() => setShowCompareDrawer(true)}
                  className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Compare ({compareIds.length})</span>
                </button>
              )}

              <button
                onClick={() => setShowLaptopEnquiryModal(true)}
                className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-2 bg-gradient-to-r from-nex-blue to-purple-600 border-none shadow-glow-blue"
              >
                <Laptop className="h-4 w-4 text-amber-300" />
                <span>Looking for a Laptop?</span>
              </button>
            </div>
          </div>

          {/* Prominent Customer Laptop Enquiry Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-nex-blue/20 bg-nex-ink/90 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-glow-blue">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center shrink-0">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Can&apos;t find the laptop you need?</h4>
                <p className="text-[11px] text-nex-mist mt-0.5">Tell us your budget &amp; specifications and NexByte will source or recommend a suitable laptop for you.</p>
              </div>
            </div>
            <button
              onClick={() => setShowLaptopEnquiryModal(true)}
              className="btn-primary !py-2 !px-4 text-xs shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Send Laptop Requirement
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.val}
                onClick={() => setCategoryFilter(cat.val)}
                className={cn(
                  "rounded-full px-4.5 py-2 text-[11px] font-semibold transition-all border",
                  categoryFilter === cat.val
                    ? "bg-nex-blue border-nex-blue text-white shadow-glow-blue"
                    : "glass-panel text-white/70 border-transparent hover:border-white/10 hover:bg-white/[0.06]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-nex-blue/20 bg-nex-ink/90 p-8 space-y-4">
              <Laptop className="h-12 w-12 text-nex-blueLight mx-auto" />
              <div>
                <h3 className="font-display text-lg font-bold text-white">Can&apos;t find what you&apos;re looking for?</h3>
                <p className="text-xs text-nex-mist mt-1 max-w-md mx-auto leading-relaxed">
                  Tell us your laptop requirements and budget, and NexByte will help you find or customize a suitable option.
                </p>
              </div>
              <button
                onClick={() => setShowLaptopEnquiryModal(true)}
                className="btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" /> Send Laptop Requirement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((prod) => {
                const isFav = wishlist.includes(prod.id);
                const isComparing = compareIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="glass-panel group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-nex-ink p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-nex-blue/40 hover:shadow-glow-blue"
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.08] p-4 flex items-center justify-center mb-4">
                        <img
                          src={getSafeImageSrc(prod.image)}
                          alt={prod.title}
                          className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top Badge Overlay */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {prod.discount && prod.discount > 0 ? (
                            <span className="rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                              -{prod.discount}% OFF
                            </span>
                          ) : null}
                          {prod.condition && (
                            <span className="rounded bg-nex-blue/20 border border-nex-blue/30 px-2 py-0.5 text-[9px] font-bold text-nex-blueLight uppercase">
                              {prod.condition.replace("_", " ")}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all"
                            title="Add to Wishlist"
                          >
                            <Heart className={cn("h-3.5 w-3.5", isFav && "text-red-400 fill-red-400")} />
                          </button>
                          <button
                            onClick={() => setQuickViewProduct(prod)}
                            className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all"
                            title="Quick View Gallery"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <span className="rounded-full bg-nex-blue/10 border border-nex-blue/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-nex-blueLight">
                        {CATEGORIES.find((c) => c.val === prod.category)?.label || prod.category}
                      </span>

                      <h3 className="font-display text-base font-bold text-white mt-2 line-clamp-1">
                        {prod.title}
                      </h3>

                      <p className="text-xs text-nex-mist mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      {/* Specs Snippet */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                        {Object.entries(prod.specs || {}).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-nex-mist font-medium">{k}: </span>
                            <span className="text-white font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/5 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Special Price</span>
                        <span className="font-display text-base font-bold text-white">
                          Rs. {(prod.price ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCompare(prod.id)}
                          className={cn(
                            "p-2 rounded-xl border text-xs font-semibold transition-all",
                            isComparing
                              ? "bg-nex-blue/20 border-nex-blue text-nex-blueLight"
                              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          )}
                          title="Compare specifications"
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => addToCart(prod)}
                          className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1 shadow-glow-blue"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> +Cart
                        </button>
                        <button
                          onClick={() => setBookingProduct(prod)}
                          className="btn-secondary !py-2 !px-2.5 text-xs font-semibold"
                          title="Book Custom Order"
                        >
                          Book
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

      {/* 2. Quick View Modal with Multi-Image Gallery */}
      {quickViewProduct && (() => {
        const galleryList = (quickViewProduct.images && Array.isArray(quickViewProduct.images) && quickViewProduct.images.length > 0)
          ? quickViewProduct.images
          : [{ id: "1", url: quickViewProduct.image, is_primary: true, sort_order: 1 }];
        
        const activeImgObj = galleryList[quickViewActiveImageIndex] || galleryList[0];
        const activeImgUrl = activeImgObj?.url || quickViewProduct.image;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setQuickViewProduct(null)} />
            
            <div className="glass-panel relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute right-4 top-4 z-10 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col gap-6 md:flex-row items-center md:items-start mt-2">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08] p-3 flex items-center justify-center group">
                    <img
                      src={getSafeImageSrc(activeImgUrl)}
                      alt={activeImgObj?.alt_text || quickViewProduct.title}
                      className="object-contain max-h-full max-w-full cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                      onClick={() => setZoomModalImageUrl(activeImgUrl)}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {quickViewActiveImageIndex + 1} / {galleryList.length}
                    </div>
                    <button
                      onClick={() => setZoomModalImageUrl(activeImgUrl)}
                      className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-all"
                      title="Click to Zoom Fullscreen"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    {galleryList.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1));
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-nex-blue text-white p-1.5 rounded-full backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewActiveImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-nex-blue text-white p-1.5 rounded-full backdrop-blur-sm"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {galleryList.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {galleryList.map((imgItem: any, idx: number) => (
                        <button
                          key={imgItem.id || idx}
                          onClick={() => setQuickViewActiveImageIndex(idx)}
                          className={cn(
                            "relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border p-1 transition-all",
                            quickViewActiveImageIndex === idx
                              ? "border-nex-blueLight bg-nex-blue/20 ring-2 ring-nex-blueLight/50"
                              : "border-white/10 bg-white/5 hover:border-white/30"
                          )}
                        >
                          <img src={getSafeImageSrc(imgItem.url)} alt={`Thumbnail ${idx + 1}`} className="object-contain h-full w-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left w-full space-y-4">
                  <div>
                    <span className="rounded-full bg-nex-blue/10 border border-nex-blue/20 px-2.5 py-0.5 text-[9px] font-bold uppercase text-nex-blueLight">
                      {CATEGORIES.find((c) => c.val === quickViewProduct.category)?.label}
                    </span>
                    <h3 className="font-display text-xl font-bold text-white mt-2">{quickViewProduct.title}</h3>
                    <p className="text-sm font-bold text-nex-blueLight mt-1">Rs. {(quickViewProduct.price ?? 0).toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-xs text-nex-mist leading-relaxed">{quickViewProduct.description}</p>
                  <div className="border-t border-white/5 pt-3">
                    <h4 className="text-xs font-semibold text-white/95 mb-2">Specifications:</h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                      {Object.entries(quickViewProduct.specs || {}).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/[0.02] pb-1 pr-1">
                          <span className="text-nex-mist">{key}</span>
                          <span className="text-white font-medium truncate max-w-[110px]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => { setBookingProduct(quickViewProduct); setQuickViewProduct(null); }}
                      className="btn-primary w-full !py-2.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="h-4 w-4" /> Book Product Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Fullscreen Zoom Modal */}
      {zoomModalImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <button
            onClick={() => setZoomModalImageUrl(null)}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl flex items-center justify-center p-4">
            <img src={getSafeImageSrc(zoomModalImageUrl)} alt="Zoom View" className="max-h-full max-w-full object-contain rounded-2xl shadow-glow-blue" />
          </div>
        </div>
      )}

      {/* 4. Customer Laptop Enquiry Form Modal */}
      {showLaptopEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => !enquirySubmitting && setShowLaptopEnquiryModal(false)} />
          
          <div className="glass-panel relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8 z-10">
            <button
              onClick={() => !enquirySubmitting && setShowLaptopEnquiryModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white z-10"
              disabled={enquirySubmitting}
            >
              <X className="h-5 w-5" />
            </button>

            {enquirySuccessRef ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto shadow-glow-blue">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">✓ Laptop Enquiry Submitted</h3>
                  <p className="text-xs text-nex-mist mt-1 max-w-md mx-auto leading-relaxed">
                    Your laptop requirement has been sent to NexByte Technologies. Our team will review your requirement and contact you shortly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 max-w-sm mx-auto">
                  <span className="text-[10px] text-nex-mist uppercase font-bold block">Reference ID</span>
                  <span className="font-mono text-base font-bold text-nex-blueLight tracking-wider mt-0.5 block">{enquirySuccessRef}</span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`/track?search=${encodeURIComponent(enquirySuccessRef)}`}
                    className="btn-primary !py-2.5 !px-6 text-xs flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Track Enquiry
                  </a>
                  <button
                    onClick={() => {
                      setShowLaptopEnquiryModal(false);
                      setEnquirySuccessRef(null);
                    }}
                    className="btn-secondary !py-2.5 !px-6 text-xs"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center shrink-0">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Find the Right Laptop</h3>
                    <p className="text-xs text-nex-mist">Tell us what you&apos;re looking for and NexByte will help you find a suitable laptop.</p>
                  </div>
                </div>

                {enquiryError && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-semibold">
                    {enquiryError}
                  </div>
                )}

                <form onSubmit={handleLaptopEnquirySubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">Customer Name *</label>
                      <input
                        type="text"
                        required
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="e.g. Meena Sharma"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={enquiryEmail}
                        onChange={(e) => setEnquiryEmail(e.target.value)}
                        placeholder="e.g. meena@gmail.com"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">City / Location *</label>
                      <input
                        type="text"
                        required
                        value={enquiryCity}
                        onChange={(e) => setEnquiryCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">Laptop Requirement *</label>
                      <select
                        value={enquiryType}
                        onChange={(e) => setEnquiryType(e.target.value)}
                        className="w-full rounded-xl bg-nex-ink border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Business Laptop">Business Laptop</option>
                        <option value="Gaming Laptop">Gaming Laptop</option>
                        <option value="Student Laptop">Student Laptop</option>
                        <option value="Programming Laptop">Programming Laptop</option>
                        <option value="Editing / Creator Laptop">Editing / Creator Laptop</option>
                        <option value="Workstation">Workstation</option>
                        <option value="Premium Used Laptop">Premium Used Laptop</option>
                        <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                        <option value="New Laptop">New Laptop</option>
                        <option value="Not Sure / Need Recommendation">Not Sure / Need Recommendation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/80 font-semibold">Budget Range *</label>
                      <select
                        value={enquiryBudget}
                        onChange={(e) => setEnquiryBudget(e.target.value)}
                        className="w-full rounded-xl bg-nex-ink border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Under ₹20,000">Under ₹20,000</option>
                        <option value="₹20,000 – ₹30,000">₹20,000 – ₹30,000</option>
                        <option value="₹30,000 – ₹40,000">₹30,000 – ₹40,000</option>
                        <option value="₹40,000 – ₹50,000">₹40,000 – ₹50,000</option>
                        <option value="₹50,000 – ₹70,000">₹50,000 – ₹70,000</option>
                        <option value="₹70,000 – ₹1,00,000">₹70,000 – ₹1,00,000</option>
                        <option value="₹1,00,000+">₹1,00,000+</option>
                        <option value="Custom Budget">Custom Budget</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">Preferred Brand</label>
                      <select
                        value={enquiryBrand}
                        onChange={(e) => setEnquiryBrand(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="Any Brand">Any Brand</option>
                        <option value="Lenovo">Lenovo</option>
                        <option value="Dell">Dell</option>
                        <option value="HP">HP</option>
                        <option value="ASUS">ASUS</option>
                        <option value="Acer">Acer</option>
                        <option value="Apple">Apple</option>
                        <option value="MSI">MSI</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">Processor</label>
                      <select
                        value={enquiryProcessor}
                        onChange={(e) => setEnquiryProcessor(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Intel Core i3">Intel Core i3</option>
                        <option value="Intel Core i5">Intel Core i5</option>
                        <option value="Intel Core i7">Intel Core i7</option>
                        <option value="Intel Core i9">Intel Core i9</option>
                        <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                        <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                        <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                        <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                        <option value="Apple Silicon">Apple Silicon</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">RAM</label>
                      <select
                        value={enquiryRam}
                        onChange={(e) => setEnquiryRam(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="8 GB">8 GB</option>
                        <option value="16 GB">16 GB</option>
                        <option value="32 GB">32 GB</option>
                        <option value="64 GB+">64 GB+</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">Storage</label>
                      <select
                        value={enquiryStorage}
                        onChange={(e) => setEnquiryStorage(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="256 GB">256 GB</option>
                        <option value="512 GB">512 GB</option>
                        <option value="1 TB">1 TB</option>
                        <option value="2 TB+">2 TB+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">GPU</label>
                      <select
                        value={enquiryGpu}
                        onChange={(e) => setEnquiryGpu(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Integrated Graphics">Integrated Graphics</option>
                        <option value="Dedicated Graphics">Dedicated Graphics</option>
                        <option value="RTX 3050">RTX 3050</option>
                        <option value="RTX 4050">RTX 4050</option>
                        <option value="RTX 4060+">RTX 4060+</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">Condition</label>
                      <select
                        value={enquiryCondition}
                        onChange={(e) => setEnquiryCondition(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="Any">Any</option>
                        <option value="Brand New">Brand New</option>
                        <option value="Premium Used">Premium Used</option>
                        <option value="Second Hand">Second Hand</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70">Primary Use Case</label>
                      <select
                        value={enquiryUseCase}
                        onChange={(e) => setEnquiryUseCase(e.target.value)}
                        className="w-full rounded-lg bg-nex-ink border border-white/10 px-2 py-1.5 text-[11px] text-white"
                      >
                        <option value="General Use">General Use</option>
                        <option value="Student">Student</option>
                        <option value="Office">Office</option>
                        <option value="Programming">Programming</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="3D / CAD">3D / CAD</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/80 font-semibold">Additional Requirements</label>
                    <textarea
                      value={enquiryRequirements}
                      onChange={(e) => setEnquiryRequirements(e.target.value)}
                      placeholder='e.g. Need an i5/16GB laptop with good battery backup for programming under ₹45,000.'
                      rows={2}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/80 font-semibold block">Preferred Contact Method</label>
                    <div className="flex items-center gap-6 text-xs text-white">
                      {["WhatsApp", "Phone Call", "Email"].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactMode"
                            checked={enquiryContact === mode}
                            onChange={() => setEnquiryContact(mode)}
                            className="text-nex-blue focus:ring-0"
                          />
                          <span>{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowLaptopEnquiryModal(false)}
                      className="btn-secondary !py-2 !px-4"
                      disabled={enquirySubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enquirySubmitting}
                      className="btn-primary !py-2 !px-6 flex items-center gap-2"
                    >
                      {enquirySubmitting ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Laptop Enquiry"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Booking Modal */}
      {bookingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setBookingProduct(null); setSuccessPopup(false); }} />
          
          <div className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => { setBookingProduct(null); setSuccessPopup(false); }}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {successPopup ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Booking Request Received!</h3>
                <p className="text-xs text-nex-mist">Reference ID:</p>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-sm font-bold text-nex-blueLight">
                  {createdBookingId}
                </div>
                <div className="pt-4 flex justify-center gap-2">
                  <a
                    href={`/track?search=${encodeURIComponent(createdBookingId || "")}`}
                    className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1"
                  >
                    Track Booking
                  </a>
                  <button
                    onClick={() => { setBookingProduct(null); setSuccessPopup(false); }}
                    className="btn-secondary !py-2 !px-4 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-base font-bold text-white mb-1">Book System Item</h3>
                <p className="text-xs text-nex-mist mb-4">Item: <span className="text-white font-semibold">{bookingProduct.title}</span></p>

                {errorMsg && (
                  <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
                  <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

                  <div>
                    <label className="text-[11px] text-white/80 font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/80 font-semibold">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-white/80 font-semibold">City</label>
                      <input
                        type="text"
                        value={bookCity}
                        onChange={(e) => setBookCity(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/80 font-semibold">Budget</label>
                      <input
                        type="text"
                        value={bookBudget}
                        onChange={(e) => setBookBudget(e.target.value)}
                        placeholder={`Rs. ${bookingProduct.price}`}
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/80 font-semibold">Message / Specifications</label>
                    <textarea
                      value={bookMessage}
                      onChange={(e) => setBookMessage(e.target.value)}
                      placeholder="Add requirements..."
                      rows={2}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingProduct(null)}
                      className="btn-secondary !py-2 !px-3.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary !py-2 !px-5"
                    >
                      {submitting ? "Submitting..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
