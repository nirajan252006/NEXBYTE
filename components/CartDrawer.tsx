"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { getSafeImageSrc } from "@/lib/utils";
import { dbHelper } from "@/lib/dbHelper";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName || !customerPhone || !shippingAddress) {
      alert("Please enter Name, Phone, and Delivery Address.");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        total: getTotal(),
        status: "pending",
      };

      const newOrder = await dbHelper.orders.create(orderPayload);
      setCompletedOrder(newOrder);
      clearCart();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckingOut(false);
    setCompletedOrder(null);
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-nex-ink border-l border-white/10 h-full flex flex-col justify-between shadow-2xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-nex-black/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">Your Shopping Cart</h3>
              <p className="text-[10px] text-nex-mist">{getItemCount()} item(s) selected</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-nex-mist hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {completedOrder ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-blue animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-white">Order Confirmed!</h4>
                <p className="text-xs text-nex-mist mt-1 leading-relaxed">
                  Thank you for ordering with NexByte Technologies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left space-y-1.5 text-xs">
                <div className="text-[10px] text-nex-mist font-bold uppercase">Order Reference Number</div>
                <div className="font-mono text-base font-bold text-nex-blueLight">{completedOrder.id}</div>
                <div className="text-nex-mist text-[11px]">Total Amount: <span className="text-white font-bold">Rs. {(completedOrder.total || 0).toLocaleString("en-IN")}</span></div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <a
                  href={`/track?search=${encodeURIComponent(completedOrder.id)}`}
                  onClick={handleClose}
                  className="btn-primary !py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  Track Order Status <ArrowRight className="h-4 w-4" />
                </a>
                <button onClick={handleClose} className="btn-secondary !py-2 text-xs">
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">Customer Delivery Details</span>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-nex-blueLight hover:underline text-[11px]"
                >
                  ← Back to Cart
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nex-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/80 font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nex-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/80 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="rahul@gmail.com"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nex-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Delivery Address *</label>
                <textarea
                  required
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House/Flat No., Building Name, Street, City, Pincode"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nex-blue resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-semibold">Payment Option</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl bg-nex-ink border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="COD">Cash / Pay on Delivery (COD)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex justify-between text-nex-mist">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span className="text-white font-semibold">Rs. {getTotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-nex-mist">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/10 text-sm">
                  <span>Total Pay</span>
                  <span className="text-nex-blueLight">Rs. {getTotal().toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full !py-3 text-xs flex items-center justify-center gap-2 shadow-glow-blue"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" /> Confirm Order (Rs. {getTotal().toLocaleString("en-IN")})
                  </>
                )}
              </button>
            </form>
          ) : items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="h-12 w-12 text-nex-mist mx-auto" />
              <p className="text-sm font-semibold text-white">Your cart is currently empty</p>
              <p className="text-xs text-nex-mist max-w-xs mx-auto">
                Explore our hardware catalog to add gaming PCs, laptops, and accessories.
              </p>
              <button
                onClick={handleClose}
                className="btn-primary !py-2 !px-5 text-xs mt-2"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex gap-3 items-center"
                >
                  <img
                    src={getSafeImageSrc(item.image)}
                    alt={item.title}
                    className="h-14 w-14 object-contain rounded-lg bg-white/5 border border-white/5 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{item.title}</div>
                    <div className="text-xs font-bold text-nex-blueLight mt-0.5">
                      Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white/10 rounded text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-[11px] font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white/10 rounded text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 text-xs flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        {!isCheckingOut && !completedOrder && items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-nex-black/50 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-nex-mist">Total Amount</span>
              <span className="font-display text-lg font-bold text-white">
                Rs. {getTotal().toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="btn-primary w-full !py-3 text-xs flex items-center justify-center gap-2 shadow-glow-blue"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
