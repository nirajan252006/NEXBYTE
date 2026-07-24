"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, business } from "@/lib/data";
import {
  Search,
  Heart,
  Eye,
  MessageCircle,
  X,
  SlidersHorizontal,
  GitCompare,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { dbHelper } from "@/lib/dbHelper";
import { safeJsonFetch } from "@/lib/apiHelper";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Wishlist state (persisted in local storage)
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Modal views
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Booking inline form modal
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookCity, setBookCity] = useState("");
  const [bookBudget, setBookBudget] = useState("");
  const [bookQuantity, setBookQuantity] = useState("1");
  const [bookPreferredContact, setBookPreferredContact] = useState("WhatsApp");
  const [bookMessage, setBookMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  
  const [successPopup, setSuccessPopup] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await dbHelper.products.list();
      // Assume missing status means show for backward compatibility with static data
      setProducts(allProducts.filter(p => !p.status || p.status === "show"));
    };
    loadProducts();
    window.addEventListener("nexbyte-realtime", loadProducts);

    try {
      const saved = localStorage.getItem("nexbyte_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener("nexbyte-realtime", loadProducts);
    };
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
        // Swap first item out
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

    // Bot spam trap check
    if (honeypot) {
      // Silent fail
      setBookName("");
      setBookPhone("");
      setBookingProduct(null);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await safeJsonFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Reset form
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



  // Filters calculations
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(search.toLowerCase()) ||
      prod.description.toLowerCase().includes(search.toLowerCase()) ||
      Object.values(prod.specs).some((v) => v.toLowerCase().includes(search.toLowerCase()));

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
          <div className="text-center max-w-3xl mx-auto mb-12">
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

          {/* Search, Favorites & Filters Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            {/* Search Box */}
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

            {/* Controls Toggles */}
            <div className="flex items-center gap-3">
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
                <span>Favorites Only ({wishlist.length})</span>
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
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
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
            <div className="text-center py-20 glass-panel rounded-2xl">
              <Search className="h-10 w-10 text-nex-mist mx-auto mb-4" />
              <p className="text-base text-white font-medium">No hardware items found matching criteria.</p>
              {showWishlistOnly && (
                <button onClick={() => setShowWishlistOnly(false)} className="text-nex-blueLight text-xs mt-2 underline">
                  Show all products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((prod) => {
                const isFav = wishlist.includes(prod.id);
                const isComparing = compareIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="glass-card p-5 bg-nex-ink border border-white/5 flex flex-col justify-between group rounded-2xl relative overflow-hidden"
                  >
                    <div>
                      {/* Product Image Panel */}
                      <div className="relative h-48 w-full rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] mb-4 flex items-center justify-center p-4">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top action flags */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                          <span className="rounded-full bg-nex-blue/90 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            {CATEGORIES.find((c) => c.val === prod.category)?.label}
                          </span>
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="h-8.5 w-8.5 rounded-full glass-panel flex items-center justify-center text-white hover:text-red-400 transition-colors shadow-glass"
                            aria-label="Add to wishlist"
                          >
                            <Heart className={cn("h-4.5 w-4.5", isFav && "fill-red-500 text-red-500")} />
                          </button>
                        </div>
                      </div>

                      {/* Header details */}
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-nex-blueLight transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-[11px] text-nex-mist mt-1 leading-relaxed line-clamp-2">
                        {prod.description}
                      </p>

                      {/* Spec summary bullet points */}
                      <div className="mt-3.5 space-y-1">
                        {prod.specs.Processor && (
                          <div className="text-[10px] text-white/80 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-nex-blueLight" />
                            <span className="font-semibold">CPU:</span> {prod.specs.Processor}
                          </div>
                        )}
                        {prod.specs.RAM && (
                          <div className="text-[10px] text-white/80 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-nex-blueLight" />
                            <span className="font-semibold">RAM:</span> {prod.specs.RAM}
                          </div>
                        )}
                        {prod.specs.Condition && (
                          <div className="text-[10px] text-white/80 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-nex-blueLight" />
                            <span className="font-semibold">State:</span> {prod.specs.Condition}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Price & Stock display */}
                      <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-nex-mist">Ref. Price</span>
                          {prod.discount && prod.discount > 0 ? (
                            <span className="text-[10px] text-green-400 font-semibold">{prod.discount}% OFF</span>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">
                            Rs. {(prod.price ?? 0).toLocaleString("en-IN")}
                          </span>
                          {prod.stock === 0 && (
                            <div className="text-[9px] font-bold text-red-400 uppercase">Out of Stock</div>
                          )}
                        </div>
                      </div>

                      {/* Interactive triggers */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setQuickViewProduct(prod)}
                          className="btn-secondary !py-2 !px-3 text-[10px] flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Quick View
                        </button>
                        <button
                          onClick={() => toggleCompare(prod.id)}
                          className={cn(
                            "btn-secondary !py-2 !px-3 text-[10px] flex items-center justify-center gap-1",
                            isComparing && "border-nex-blueLight text-nex-blueLight"
                          )}
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                          {isComparing ? "Comparing" : "Compare"}
                        </button>
                      </div>

                      <div className="mt-2">
                        {prod.stock === 0 ? (
                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", {
                                detail: { prefilledItem: `Notify Me: ${prod.title}` }
                              }));
                            }}
                            className="w-full !py-2 !px-3 text-[10px] font-bold rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1"
                          >
                            Notify Me When Available
                          </button>
                        ) : (
                          <button
                            onClick={() => setBookingProduct(prod)}
                            className="btn-primary w-full !py-2 !px-3 text-[10px] flex items-center justify-center gap-1 !shadow-none hover:!shadow-glow-blue"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" /> Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* 1. Compare Modal/Drawer */}
      {showCompareDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCompareDrawer(false)} />
          
          <div className="glass-panel relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => setShowCompareDrawer(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-6">
              <GitCompare className="h-5 w-5 text-nex-blueLight" />
              Side-by-Side Product Comparison
            </h3>

            {compareIds.length === 0 ? (
              <p className="text-xs text-nex-mist py-8 text-center">No products selected. Click Compare on product cards.</p>
            ) : compareIds.length === 1 ? (
              <div className="text-center py-8">
                <p className="text-xs text-nex-mist">Compare requires at least 2 selected products.</p>
                <div className="mt-4 inline-flex items-center gap-3">
                  {products.filter(p => p.id === compareIds[0]).map(p => (
                    <span key={p.id} className="text-xs font-semibold text-white/90 glass-panel px-3 py-1.5 rounded-full">{p.title}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-white border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-2 text-nex-mist">Specs</th>
                      {compareIds.map((id) => {
                        const p = products.find((prod) => prod.id === id);
                        return (
                          <th key={id} className="py-3 px-4 font-bold text-nex-blueLight">
                            {p?.title}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-2 text-nex-mist font-semibold">Ref. Price</td>
                      {compareIds.map((id) => {
                        const p = products.find((prod) => prod.id === id);
                        return (
                          <td key={id} className="py-3 px-4 font-bold text-white">
                            Rs. {(p?.price ?? 0).toLocaleString("en-IN")}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-2 text-nex-mist font-semibold">Category</td>
                      {compareIds.map((id) => {
                        const p = products.find((prod) => prod.id === id);
                        return (
                          <td key={id} className="py-3 px-4 text-white/90">
                            {CATEGORIES.find((c) => c.val === p?.category)?.label}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Gather specs keys */}
                    {["Processor", "RAM", "GPU", "Storage", "Display", "Condition"].map((key) => (
                      <tr key={key} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-3 px-2 text-nex-mist font-semibold">{key}</td>
                        {compareIds.map((id) => {
                          const p = products.find((prod) => prod.id === id);
                          return (
                            <td key={id} className="py-3 px-4 text-white/90">
                              {p?.specs[key] || p?.specs[key.toLowerCase()] || "N/A"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setCompareIds([])} className="btn-secondary !py-2 !px-4 text-xs mr-2">
                Clear Compare List
              </button>
              <button onClick={() => setShowCompareDrawer(false)} className="btn-primary !py-2 !px-5 text-xs">
                Close Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setQuickViewProduct(null)} />
          
          <div className="glass-panel relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-6 sm:flex-row items-center sm:items-start mt-4">
              <div className="relative h-40 w-40 rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.08] p-2 flex items-center justify-center shrink-0">
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  width={140}
                  height={140}
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="rounded-full bg-nex-blue/10 border border-nex-blue/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-nex-blueLight">
                  {CATEGORIES.find((c) => c.val === quickViewProduct.category)?.label}
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-2">
                  {quickViewProduct.title}
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Rs. {(quickViewProduct.price ?? 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-nex-mist mt-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4">
              <h4 className="text-xs font-semibold text-white/95 mb-2">Specifications:</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-white/[0.02] pb-1">
                    <span className="text-nex-mist">{key}</span>
                    <span className="text-white font-medium truncate max-w-[120px]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <button
                onClick={() => {
                  setBookingProduct(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="btn-primary !py-2 !px-4 text-xs"
              >
                Book Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Booking / Enquiry Modal */}
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
              /* Upgraded Success Popup */
              <div className="text-center py-6 space-y-5">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto animate-bounce" />
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Booking Submitted Successfully!</h3>
                  <p className="text-xs text-nex-mist mt-1 leading-relaxed">
                    Your request has been logged in our database. Reference ID is:
                  </p>
                  <div className="mt-3.5 inline-block rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2 text-sm font-mono font-bold text-nex-blueLight shadow-inner">
                    {createdBookingId}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 text-[11px] text-nex-mist leading-relaxed">
                  We will contact you shortly to confirm your booking. You can track your booking status anytime.
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => { setBookingProduct(null); setSuccessPopup(false); }}
                    className="btn-primary w-full py-3 text-xs"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Product Enquiry / Booking
                </h3>
                <p className="text-xs text-nex-mist mb-5">
                  Interested Product: <span className="text-nex-blueLight font-semibold">{bookingProduct.title}</span>
                </p>

                {errorMsg && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleBookSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  {/* Honeypot hidden input */}
                  <input
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label htmlFor="prod-book-name" className="text-xs font-semibold text-white/85">Customer Name *</label>
                    <input
                      id="prod-book-name"
                      type="text"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="prod-book-phone" className="text-xs font-semibold text-white/85">Phone Number *</label>
                      <input
                        id="prod-book-phone"
                        type="tel"
                        required
                        value={bookPhone}
                        onChange={(e) => setBookPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="prod-book-email" className="text-xs font-semibold text-white/85">Email Address</label>
                      <input
                        id="prod-book-email"
                        type="email"
                        value={bookEmail}
                        onChange={(e) => setBookEmail(e.target.value)}
                        placeholder="e.g. ramesh@gmail.com"
                        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="prod-book-city" className="text-xs font-semibold text-white/85">City *</label>
                      <input
                        id="prod-book-city"
                        type="text"
                        required
                        value={bookCity}
                        onChange={(e) => setBookCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/85">State</label>
                      <input
                        type="text"
                        disabled
                        value="Karnataka"
                        className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] px-3.5 py-2.5 text-xs text-white/40 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Budget & Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="prod-book-budget" className="text-xs font-semibold text-white/85">Budget (optional)</label>
                      <input
                        id="prod-book-budget"
                        type="text"
                        value={bookBudget}
                        onChange={(e) => setBookBudget(e.target.value)}
                        placeholder="e.g. Rs. 40,000"
                        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="prod-book-qty" className="text-xs font-semibold text-white/85">Quantity *</label>
                      <input
                        id="prod-book-qty"
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={bookQuantity}
                        onChange={(e) => setBookQuantity(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preferred Contact Mode */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/85">Preferred Contact Mode *</label>
                    <div className="flex gap-4">
                      {["WhatsApp", "Call", "Email"].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer text-xs text-white/80 select-none">
                          <input
                            type="radio"
                            name="contactMode"
                            checked={bookPreferredContact === mode}
                            onChange={() => setBookPreferredContact(mode)}
                            className="bg-nex-black border-white/20 text-nex-blue focus:ring-0 h-4 w-4"
                          />
                          <span>{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label htmlFor="prod-book-msg" className="text-xs font-semibold text-white/85">Message Notes (optional)</label>
                    <textarea
                      id="prod-book-msg"
                      value={bookMessage}
                      onChange={(e) => setBookMessage(e.target.value)}
                      placeholder="e.g. Need details on courier shipping or custom upgrades..."
                      rows={3}
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingProduct(null)}
                      className="btn-secondary !py-2.5 !px-4 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary !py-2.5 !px-5 text-xs flex items-center gap-1.5"
                    >
                      {submitting ? "Booking..." : "Submit Booking"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
