import { createClient } from "@supabase/supabase-js";
import { products as initialProducts, services as initialServices } from "./data";
import { broadcastServerEvent } from "./realtimeServer";

function notifyDataChange(table: string, action: string, data?: any) {
  if (typeof window !== "undefined") {
    // 1. Dispatch locally so the immediate tab updates instantly
    window.dispatchEvent(
      new CustomEvent("nexbyte-data-changed", {
        detail: { table, action, data },
      })
    );
    // 2. Push to server to broadcast to other tabs via SSE
    fetch("/api/trigger-realtime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, action, data }),
    }).catch((err) => console.error("Realtime Trigger Error:", err));
  } else {
    // Broadcast via Server-Sent Events if running natively on the server
    try {
      broadcastServerEvent(table, action, data);
    } catch (e) {
      console.error("SSE Broadcast Error:", e);
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Real Supabase Client
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Mock Local Memory for Server-side compilation fallback
const globalRef = globalThis as any;
if (!globalRef.__nexbyteMockDb) {
  globalRef.__nexbyteMockDb = {
    users: [
      { id: "cust-1", email: "customer@nexbyte.com", full_name: "Ramesh Kumar", phone: "9876543210", role: "customer" },
      { id: "admin-1", email: "admin@nexbyte.com", full_name: "Admin Officer", phone: "8088979706", role: "admin" }
    ],
    products: initialProducts.map((p) => ({
      ...p,
      stock: p.stock ?? 12,
      discount: 10,
      warranty: "1 Year NexByte Warranty",
      condition: p.category.includes("used") || p.category.includes("second") ? "premium_used" : "new",
      status: "show",
      featured: p.id === "p1" || p.id === "p2",
      latest: p.id === "p3" || p.id === "p4",
      created_at: new Date().toISOString()
    })),
    services: initialServices.map((s, idx) => ({
      ...s,
      price: [1200, 1500, 800, 600, 500, 1800, 3500, 1000, 2500, 6500, 8500, 4500, 950, 1200, 1500][idx % 15],
      duration: "2-4 Hours",
      status: "enabled",
      created_at: new Date().toISOString()
    })),
    bookings: [
      {
        id: "b-1",
        customer_id: "cust-1",
        customer_name: "Ramesh Kumar",
        phone: "9876543210",
        email: "customer@nexbyte.com",
        service_name: "Laptop Keyboard & Trackpad Repair",
        status: "pending",
        technician: "",
        booking_date: "2026-07-20",
        booking_time: "10:30 AM",
        notes: "Need it fixed urgently. Keyboard space bar not responding.",
        created_at: new Date().toISOString()
      },
      {
        id: "b-2",
        customer_id: "cust-1",
        customer_name: "Ramesh Kumar",
        phone: "9876543210",
        email: "customer@nexbyte.com",
        service_name: "Windows OS Optimization & Driver Setup",
        status: "completed",
        technician: "Niranjan M.",
        booking_date: "2026-07-15",
        booking_time: "02:00 PM",
        notes: "Clean install of Windows 11 Pro.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    reviews: [
      {
        id: "rev-1",
        customer_name: "Anil Murthy",
        phone: "9845321045",
        email: "anil.m@gmail.com",
        city: "Tumkur",
        service_used: "Laptop Repair",
        product_purchased: "",
        overall_experience: "Excellent repair service. Repaired my Lenovo laptop hinge within 3 hours.",
        rating: 5,
        review_message: "Fast turn-around, reasonable price, clean work. Highly recommended branch in Tumkur.",
        recommend: true,
        image_urls: [],
        status: "approved",
        verified: true,
        featured: false,
        source: "public_form",
        likes_count: 5,
        helpful_count: 3,
        admin_reply: null,
        admin_reply_at: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    internships: [
      {
        id: "int-1",
        student_name: "Vikram R.",
        email: "vikram.r@sit.edu",
        phone: "8976543210",
        college: "SIT Tumkur",
        domain: "Embedded & IoT Systems",
        resume_url: "#",
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    training: [
      {
        id: "tr-1",
        course_title: "Desktop Repair Training",
        student_name: "Priya Gowda",
        email: "priya@gmail.com",
        phone: "9008765432",
        batch: "July Batch A",
        trainer: "Niranjan M.",
        attendance_status: "present",
        certificate_url: "",
        created_at: new Date().toISOString()
      }
    ],
    notifications: [
      { id: "n-1", title: "New Service Booking", message: "Ramesh Kumar booked Laptop Keyboard Repair", status: "unread", type: "booking", created_at: new Date().toISOString() },
      { id: "n-2", title: "New Internship Application", message: "Vikram R. applied for Embedded & IoT Systems", status: "unread", type: "internship", created_at: new Date().toISOString() }
    ],
    contacts: [
      {
        id: "ct-1",
        name: "Suresh Patel",
        email: "suresh.p@gmail.com",
        phone: "9876501234",
        subject: "Bulk laptop supply enquiry",
        message: "We need 25 laptops for our school lab. Please share bulk pricing.",
        status: "unread",
        admin_reply: null,
        admin_reply_at: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    laptop_enquiries: [
      {
        id: "lp-1",
        customer_name: "Meena Sharma",
        phone: "9988776655",
        email: "meena.s@yahoo.com",
        budget: "30000-40000",
        laptop_type: "Business Laptop",
        message: "Looking for a lightweight business laptop for daily office use with good battery life.",
        status: "new",
        admin_notes: "",
        created_at: new Date().toISOString()
      }
    ],
    gallery: [
      { id: "gal-1", title: "Store Front", url: "/images/poster-products.png", category: "store", visible: true, created_at: new Date().toISOString() }
    ],
    cms_content: {
      hero: {
        headline: "Premium IT Solutions — NexByte Technologies",
        subheadline: "Laptops, Gaming PCs, Servers, Accessories, Repairs & Academy Training.",
        cta: "Explore Products",
        secondary_cta: "Book a Service",
      },
      seo: {
        title: "NexByte Technologies — Hardware, Repairs & IT Training",
        description: "NexByte Technologies offers premium laptops, gaming PCs, servers, bulk hardware supply, CCTV installation, software support, and IT academy training.",
        keywords: "laptop repair, gaming PC, computer service, bulk supply, IT training, CCTV installation, NexByte",
        og_image: "/images/poster-products.png",
      },
      footer: {
        tagline: "Your trusted partner for premium IT solutions.",
        address: "#372, 1st Floor, MK Puttalingaiah Road, Uttarahalli Main Road, Bengaluru 560070",
        copyright: "© 2026 NexByte Technologies. All rights reserved.",
      },
      contact_info: {
        phone1: "+91 8088979706",
        phone2: "+91 9876543210",
        email: "info@nexbytetechnologies.com",
        whatsapp: "918088979706",
      },
      updated_at: new Date().toISOString(),
    },
    certificates: [
      {
        id: "c-1",
        registrationId: "NBT-TR-2026-001",
        certificateId: "CERT-908123",
        studentName: "Niranjan M",
        photoUrl: "/images/logo-icon.png",
        courseTitle: "Full Stack Web Development",
        trainingType: "Advanced Web Technologies",
        internshipType: "N/A",
        projectTitle: "NextJS Glassmorphic CRM Portal",
        completionDate: "2026-07-15",
        status: "verified",
        phoneNumber: "9876543210",
        email: "niranjan@gmail.com",
        created_at: new Date().toISOString()
      }
    ],
    enrollments: [
      {
        id: "e-1",
        enrollmentId: "NBT-2026-10021",
        fullName: "Harish Kumar",
        phone: "9876543211",
        email: "harish@gmail.com",
        college: "RV College of Engineering",
        branch: "Computer Science",
        semester: "6th Semester",
        city: "Bengaluru",
        courseTitle: "Python Django & React",
        preferredBatch: "Morning Weekday",
        message: "Looking forward to starting classes next week.",
        type: "training",
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    customers: [
      {
        id: "cust-1",
        customerId: "CUST-001",
        name: "Ramesh Kumar",
        phone: "9876543210",
        email: "customer@nexbyte.com",
        address: "Padmanabhanagar, Bengaluru",
        city: "Bengaluru",
        totalBookings: 2,
        reviewsCount: 1,
        certificatesCount: 0,
        productsPurchased: "1x Dell Latitude 7490",
        servicesTaken: "Laptop Keyboard & Trackpad Repair",
        created_at: new Date().toISOString()
      }
    ],
    media: [
      {
        id: "m-1",
        title: "Logo Horizontal",
        url: "/images/logo-horizontal.png",
        fileType: "image/png",
        created_at: new Date().toISOString()
      }
    ],
    inventory: [],
    activity_logs: []
  };
}

const getMockData = (key: string): any[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`nexbyte_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
    // Seed and return
    localStorage.setItem(`nexbyte_${key}`, JSON.stringify(globalRef.__nexbyteMockDb[key]));
  }
  return globalRef.__nexbyteMockDb[key];
};

const saveMockData = (key: string, data: any[] | Record<string, any>) => {
  globalRef.__nexbyteMockDb[key] = data;
  if (typeof window !== "undefined") {
    localStorage.setItem(`nexbyte_${key}`, JSON.stringify(data));
  }
};

const getMockObject = (key: string): Record<string, any> => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`nexbyte_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem(`nexbyte_${key}`, JSON.stringify(globalRef.__nexbyteMockDb[key]));
  }
  return globalRef.__nexbyteMockDb[key];
};

// Central Database Abstraction Helper
export const dbHelper = {
  // --- ACTIVITY LOGS SECTION ---
  activityLogs: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("activity_logs");
    },
    async create(log: any) {
      const payload = {
        id: `act-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...log,
      };
      if (supabase) {
        const { data } = await supabase.from("activity_logs").insert([payload]).select().single();
        notifyDataChange("activity_logs", "insert", data);
        return data;
      }
      const list = getMockData("activity_logs");
      saveMockData("activity_logs", [payload, ...list]);
      notifyDataChange("activity_logs", "insert", payload);
      return payload;
    }
  },

  // --- USERS SECTION ---
  users: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("users").select("*");
        return data || [];
      }
      return getMockData("users");
    },
    async getByEmail(email: string) {
      if (supabase) {
        const { data } = await supabase.from("users").select("*").eq("email", email).single();
        return data || null;
      }
      const list = getMockData("users");
      return list.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async create(user: any) {
      if (supabase) {
        const { data } = await supabase.from("users").insert([user]).select().single();
        return data;
      }
      const list = getMockData("users");
      const newUser = { id: `cust-${Date.now()}`, role: "customer", ...user };
      saveMockData("users", [...list, newUser]);
      notifyDataChange("users", "insert", newUser);
      return newUser;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("users").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("users");
      const updated = list.map((u) => (u.id === id ? { ...u, ...updates } : u));
      saveMockData("users", updated);
      notifyDataChange("users", "update", updated.find((u) => u.id === id));
      return updated.find((u) => u.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("users").delete().eq("id", id);
        return true;
      }
      const list = getMockData("users");
      saveMockData("users", list.filter((u) => u.id !== id));
      notifyDataChange("users", "delete", { id });
      return true;
    }
  },

  // --- BOOKINGS SECTION ---
  bookings: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("bookings").select("*").order("createdAt", { ascending: false });
        return data || [];
      }
      return getMockData("bookings");
    },
    async getByCustomer(customerId: string) {
      if (supabase) {
        const { data } = await supabase.from("bookings").select("*").eq("customer_id", customerId).order("createdAt", { ascending: false });
        return data || [];
      }
      const list = getMockData("bookings");
      return list.filter((b) => b.customer_id === customerId);
    },
    async getByPhoneAndId(phone: string, bookingId: string) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (supabase) {
        // Fetch all and filter client side to handle phone formatting variations
        const { data } = await supabase.from("bookings").select("*");
        if (!data) return null;
        return data.find((b: any) => {
          const bp = (b.phone || "").replace(/\D/g, "");
          return bp.includes(cleanPhone) && b.bookingId?.toLowerCase() === bookingId.trim().toLowerCase();
        }) || null;
      }
      const list = getMockData("bookings");
      return list.find((b) => {
        const bp = (b.phone || "").replace(/\D/g, "");
        return bp.includes(cleanPhone) && b.bookingId?.toLowerCase() === bookingId.trim().toLowerCase();
      }) || null;
    },
    async create(booking: any) {
      // 1. Duplicate Booking Protection (same phone and interested product within 15 minutes)
      const list = await this.list();
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const cleanNewPhone = (booking.phone || "").replace(/\D/g, "");
      
      const isDuplicate = list.some((b) => {
        const bp = (b.phone || "").replace(/\D/g, "");
        const bookingTime = new Date(b.createdAt || b.created_at || 0).getTime();
        return (
          bp === cleanNewPhone &&
          b.productId === booking.productId &&
          bookingTime > fifteenMinsAgo
        );
      });

      if (isDuplicate) {
        throw new Error("Duplicate booking: You have already submitted an enquiry for this item recently. Please check My Bookings or wait a few minutes.");
      }

      // 2. Generate Booking ID (Reference ID sequential NB-2026-XXXXXX)
      const count = list.length + 1;
      const refId = booking.bookingId || `NB-2026-${String(count).padStart(6, "0")}`;

      const now = new Date().toISOString();
      const newBooking = {
        id: booking.id || `b-${Date.now()}`,
        bookingId: refId,
        customerName: booking.customerName || booking.customer_name || "Customer",
        phone: booking.phone || "",
        email: booking.email || "",
        address: booking.address || "",
        city: booking.city || "Bengaluru",
        state: booking.state || "Karnataka",
        pincode: booking.pincode || "560001",
        productId: booking.productId || "",
        productName: booking.productName || booking.service_name || "Hardware Booking",
        productCategory: booking.productCategory || "other",
        configuration: booking.configuration || booking.config || "Standard",
        budget: booking.budget || "N/A",
        message: booking.message || booking.remarks || "",
        bookingType: booking.bookingType || "product",
        status: booking.status || "submitted",
        assignedTo: booking.assignedTo || "",
        technician: booking.assignedTo || booking.technician || "",
        notes: booking.notes || "",
        replyMessage: booking.replyMessage || null,
        replyDate: booking.replyDate || null,
        replyBy: booking.replyBy || null,
        quantity: Number(booking.quantity || 1),
        preferredContact: booking.preferredContact || "WhatsApp",
        preferredDate: booking.preferredDate || now.split("T")[0],
        preferredTime: booking.preferredTime || "10:30 AM",
        device: "Web Client",
        browser: "Chrome / Web",
        ip: booking.ip || "Client IP",
        createdAt: now,
        updatedAt: now,
        timeline: booking.timeline || [
          { status: "submitted", timestamp: now, message: "Booking request submitted by customer", by: "Customer" }
        ],
        // Compatibility Mappings
        customer_name: booking.customerName || booking.customer_name || "Customer",
        service_name: booking.productName || booking.service_name || "Hardware Booking",
        created_at: now,
        booking_date: booking.preferredDate || now.split("T")[0],
        booking_time: booking.preferredTime || "10:30 AM"
      };

      if (supabase) {
        const { data, error } = await supabase.from("bookings").insert([newBooking]).select().single();
        if (error) throw error;
        
        await dbHelper.customers.autoCreateOrUpdate(newBooking.phone, {
          name: newBooking.customerName,
          email: newBooking.email,
          city: newBooking.city,
          actionType: "booking",
          actionItem: newBooking.productName,
        });
        
        await dbHelper.notifications.create({
          title: "🆕 New Product Booking",
          message: `${newBooking.customerName} booked ${newBooking.productName} (${newBooking.bookingId})`,
          type: "booking",
          meta: { booking_id: newBooking.id, bookingId: newBooking.bookingId }
        });

        await dbHelper.activityLogs.create({
          user_name: newBooking.customerName,
          role: "customer",
          action: "Customer Booked Product/Service",
          details: `Booking ID: ${newBooking.bookingId} | Item: ${newBooking.productName}`,
          ip: "Client IP"
        });

        notifyDataChange("bookings", "insert", data);
        return data;
      }

      const updatedList = [newBooking, ...list];
      saveMockData("bookings", updatedList);

      await dbHelper.customers.autoCreateOrUpdate(newBooking.phone, {
        name: newBooking.customerName,
        email: newBooking.email,
        city: newBooking.city,
        actionType: "booking",
        actionItem: newBooking.productName,
      });

      // Add corresponding notification & activity log
      await dbHelper.notifications.create({
        title: "🆕 New Product Booking",
        message: `${newBooking.customerName} booked ${newBooking.productName} (${newBooking.bookingId})`,
        type: "booking",
        meta: { booking_id: newBooking.id, bookingId: newBooking.bookingId }
      });

      await dbHelper.activityLogs.create({
        user_name: newBooking.customerName,
        role: "customer",
        action: "Customer Booked Product/Service",
        details: `Booking ID: ${newBooking.bookingId} | Item: ${newBooking.productName}`,
        ip: "Client IP"
      });

      notifyDataChange("bookings", "insert", newBooking);
      return newBooking;
    },
    async update(id: string, updates: any) {
      const list = await this.list();
      const existing = list.find((b) => b.id === id);
      if (!existing) throw new Error("Booking not found");

      const now = new Date().toISOString();
      const updatedTimeline = updates.timeline ? [...updates.timeline] : [...(existing.timeline || [])];
      
      // If status has changed, append to timeline
      if (updates.status && updates.status !== existing.status) {
        updatedTimeline.push({
          status: updates.status,
          timestamp: now,
          message: `Status updated to ${updates.status.toUpperCase()}`,
          by: updates.updatedBy || "Admin"
        });
      }

      // If reply is saved
      if (updates.replyMessage && updates.replyMessage !== existing.replyMessage) {
        updatedTimeline.push({
          status: existing.status,
          timestamp: now,
          message: `Admin reply: "${(updates.replyMessage || "").substring(0, 35)}..."`,
          by: updates.replyBy || "Admin"
        });
      }

      const merged = {
        ...existing,
        ...updates,
        updatedAt: now,
        timeline: updatedTimeline,
        // Compatibility mappings
        customer_name: updates.customerName || updates.customer_name || existing.customerName,
        service_name: updates.productName || updates.service_name || existing.productName,
        technician: updates.assignedTo || updates.technician || existing.assignedTo || existing.technician
      };

      // Create customer notification & activity log
      if (updates.status && updates.status !== existing.status) {
        await dbHelper.activityLogs.create({
          user_name: updates.updatedBy || "Admin Officer",
          role: "admin",
          action: "Admin Updated Booking",
          details: `Booking ${existing.bookingId || id} status changed to ${updates.status}`,
          ip: "Client IP"
        });

        await dbHelper.notifications.create({
          title: "📌 Booking Status Update",
          message: `Your booking (${existing.bookingId || id}) status is now: ${updates.status.toUpperCase()}`,
          type: "booking_update",
          customer_email: existing.email
        });
      }

      if (supabase) {
        const { data, error } = await supabase.from("bookings").update(merged).eq("id", id).select().single();
        if (error) throw error;
        notifyDataChange("bookings", "update", data);
        return data;
      }

      const updatedList = list.map((b) => (b.id === id ? merged : b));
      saveMockData("bookings", updatedList);
      notifyDataChange("bookings", "update", merged);
      return merged;
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("bookings").delete().eq("id", id);
        return true;
      }
      const list = getMockData("bookings");
      saveMockData("bookings", list.filter((b) => b.id !== id));
      notifyDataChange("bookings", "delete", { id });
      return true;
    }
  },

  // --- PRODUCTS SECTION ---
  products: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("products");
    },
    async create(prod: any) {
      let savedData: any;
      const payload = {
        status: "show",
        stock: prod.stock ?? 10,
        discount: prod.discount ?? 0,
        condition: prod.condition || "new",
        featured: prod.featured || false,
        created_at: new Date().toISOString(),
        ...prod,
      };

      if (supabase) {
        const { data } = await supabase.from("products").insert([payload]).select().single();
        savedData = data;
      } else {
        const list = getMockData("products");
        savedData = { id: `p-${Date.now()}`, ...payload };
        saveMockData("products", [savedData, ...list]);
      }
      
      // Activity Log & Stock Alert Logic
      await dbHelper.activityLogs.create({
        user_name: "Admin Officer",
        role: "admin",
        action: "Product Created",
        details: `Created product "${savedData.title}" (Price: ₹${savedData.price}, Stock: ${savedData.stock})`,
        ip: "Client IP"
      });

      if (savedData && savedData.stock !== undefined) {
        if (savedData.stock === 0) {
          await dbHelper.notifications.create({
            title: "Out of Stock Alert",
            message: `${savedData.title} is now out of stock!`,
            type: "inventory"
          });
        } else if (savedData.stock <= 5) {
          await dbHelper.notifications.create({
            title: "Low Stock Alert",
            message: `${savedData.title} is running low (Only ${savedData.stock} left).`,
            type: "inventory"
          });
        }
      }

      notifyDataChange("products", "insert", savedData);
      return savedData;
    },
    async update(id: string, updates: any) {
      let savedData: any;
      if (supabase) {
        const { data } = await supabase.from("products").update(updates).eq("id", id).select().single();
        savedData = data;
      } else {
        const list = getMockData("products");
        const updated = list.map((p) => (p.id === id ? { ...p, ...updates } : p));
        saveMockData("products", updated);
        savedData = updated.find((p) => p.id === id);
      }

      // Log activity
      await dbHelper.activityLogs.create({
        user_name: "Admin Officer",
        role: "admin",
        action: "Product Updated",
        details: `Updated product "${savedData?.title || id}" specifications/price/stock`,
        ip: "Client IP"
      });

      // Stock Alert Logic
      if (savedData && updates.stock !== undefined) {
        if (savedData.stock === 0) {
          await dbHelper.notifications.create({
            title: "Out of Stock Alert",
            message: `${savedData.title} is now out of stock!`,
            type: "inventory"
          });
        } else if (savedData.stock <= 5) {
          await dbHelper.notifications.create({
            title: "Low Stock Alert",
            message: `${savedData.title} is running low (Only ${savedData.stock} left).`,
            type: "inventory"
          });
        }
      }

      notifyDataChange("products", "update", savedData);
      return savedData;
    },
    async delete(id: string) {
      // Soft delete: move to trash / status deleted
      const updated = await this.update(id, { status: "deleted" });
      await dbHelper.activityLogs.create({
        user_name: "Admin Officer",
        role: "admin",
        action: "Product Trashed",
        details: `Moved product ${id} to Trash`,
        ip: "Client IP"
      });
      notifyDataChange("products", "delete", { id, status: "deleted" });
      return updated;
    },
    async restore(id: string) {
      // Restore from trash: status show
      const updated = await this.update(id, { status: "show" });
      await dbHelper.activityLogs.create({
        user_name: "Admin Officer",
        role: "admin",
        action: "Product Restored",
        details: `Restored product ${id} from Trash`,
        ip: "Client IP"
      });
      notifyDataChange("products", "update", updated);
      return updated;
    }
  },

  // --- SERVICES SECTION ---
  services: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("services");
    },
    async create(srv: any) {
      if (supabase) {
        const { data } = await supabase.from("services").insert([srv]).select().single();
        return data;
      }
      const list = getMockData("services");
      const newSrv = { id: `s-${Date.now()}`, created_at: new Date().toISOString(), ...srv };
      saveMockData("services", [newSrv, ...list]);
      notifyDataChange("services", "insert", newSrv);
      return newSrv;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("services").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("services");
      const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveMockData("services", updated);
      notifyDataChange("services", "update", updated.find((s) => s.id === id));
      return updated.find((s) => s.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("services").delete().eq("id", id);
        return true;
      }
      const list = getMockData("services");
      saveMockData("services", list.filter((s) => s.id !== id));
      notifyDataChange("services", "delete", { id });
      return true;
    }
  },

  // --- INTERNSHIPS SECTION ---
  internships: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("internships");
    },
    async create(internship: any) {
      if (supabase) {
        const { data, error } = await supabase.from("internships").insert([internship]).select().single();
        if (error) throw error;
        await dbHelper.notifications.create({
          title: "New Internship Application",
          message: `${internship.student_name} applied for: ${internship.domain}`,
          type: "internship"
        });
        return data;
      }
      const list = getMockData("internships");
      const newInternship = { id: `int-${Date.now()}`, status: "pending", created_at: new Date().toISOString(), ...internship };
      saveMockData("internships", [newInternship, ...list]);

      await dbHelper.notifications.create({
        title: "New Internship Application",
        message: `${internship.student_name} applied for: ${internship.domain}`,
        type: "internship"
      });

      notifyDataChange("internships", "insert", newInternship);
      return newInternship;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("internships").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("internships");
      const updated = list.map((i) => (i.id === id ? { ...i, ...updates } : i));
      saveMockData("internships", updated);
      notifyDataChange("internships", "update", updated.find((i) => i.id === id));
      return updated.find((i) => i.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("internships").delete().eq("id", id);
        return true;
      }
      const list = getMockData("internships");
      saveMockData("internships", list.filter((i) => i.id !== id));
      notifyDataChange("internships", "delete", { id });
      return true;
    }
  },

  // --- TRAINING SECTION ---
  training: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("training").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("training");
    },
    async create(train: any) {
      if (supabase) {
        const { data, error } = await supabase.from("training").insert([train]).select().single();
        if (error) throw error;
        await dbHelper.notifications.create({
          title: "New Training Enrollment",
          message: `${train.student_name} registered for Course: ${train.course_title}`,
          type: "training"
        });
        return data;
      }
      const list = getMockData("training");
      const newTrain = { id: `tr-${Date.now()}`, attendance_status: "present", created_at: new Date().toISOString(), ...train };
      saveMockData("training", [newTrain, ...list]);

      await dbHelper.notifications.create({
        title: "New Training Enrollment",
        message: `${train.student_name} registered for Course: ${train.course_title}`,
        type: "training"
      });

      notifyDataChange("training", "insert", newTrain);
      return newTrain;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("training").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("training");
      const updated = list.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveMockData("training", updated);
      notifyDataChange("training", "update", updated.find((t) => t.id === id));
      return updated.find((t) => t.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("training").delete().eq("id", id);
        return true;
      }
      const list = getMockData("training");
      saveMockData("training", list.filter((t) => t.id !== id));
      notifyDataChange("training", "delete", { id });
      return true;
    }
  },

  // --- NOTIFICATIONS SECTION ---
  notifications: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("notifications");
    },
    async create(notify: any) {
      if (supabase) {
        const { data } = await supabase.from("notifications").insert([notify]).select().single();
        return data;
      }
      const list = getMockData("notifications");
      const newNotify = { id: `n-${Date.now()}`, status: "unread", created_at: new Date().toISOString(), ...notify };
      saveMockData("notifications", [newNotify, ...list]);
      notifyDataChange("notifications", "insert", newNotify);
      return newNotify;
    },
    async markAllRead() {
      if (supabase) {
        await supabase.from("notifications").update({ status: "read" }).eq("status", "unread");
        return true;
      }
      const list = getMockData("notifications");
      const updated = list.map((n) => ({ ...n, status: "read" }));
      saveMockData("notifications", updated);
      notifyDataChange("notifications", "update", {});
      return true;
    },
    async markRead(id: string) {
      if (supabase) {
        await supabase.from("notifications").update({ status: "read" }).eq("id", id);
        return true;
      }
      const list = getMockData("notifications");
      const updated = list.map((n) => (n.id === id ? { ...n, status: "read" } : n));
      saveMockData("notifications", updated);
      return true;
    }
  },

  // --- CONTACTS SECTION ---
  contacts: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("contacts");
    },
    async create(contact: any) {
      let savedData;
      if (supabase) {
        const { data, error } = await supabase.from("contacts").insert([contact]).select().single();
        if (error) throw error;
        savedData = data;
      } else {
        const list = getMockData("contacts");
        savedData = { id: `ct-${Date.now()}`, status: "unread", admin_reply: null, admin_reply_at: null, created_at: new Date().toISOString(), ...contact };
        saveMockData("contacts", [savedData, ...list]);
      }

      await dbHelper.customers.autoCreateOrUpdate(contact.phone || "0000000000", {
        name: contact.name,
        email: contact.email,
        actionType: "enquiry",
        actionItem: contact.subject || "General Contact",
      });

      await dbHelper.notifications.create({
        title: "New Contact Enquiry",
        message: `${contact.name} sent a message: "${(contact.subject || contact.message || "").substring(0, 50)}..."`,
        type: "contact"
      });

      notifyDataChange("contacts", "insert", savedData);
      return savedData;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("contacts").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("contacts");
      const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveMockData("contacts", updated);
      notifyDataChange("contacts", "update", updated.find((c) => c.id === id));
      return updated.find((c) => c.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("contacts").delete().eq("id", id);
        return true;
      }
      const list = getMockData("contacts");
      saveMockData("contacts", list.filter((c) => c.id !== id));
      notifyDataChange("contacts", "delete", { id });
      return true;
    },
    async reply(id: string, replyMessage: string) {
      const updates = {
        admin_reply: replyMessage,
        admin_reply_at: new Date().toISOString(),
        status: "replied"
      };
      return this.update(id, updates);
    }
  },

  // --- LAPTOP ENQUIRIES SECTION ---
  laptopEnquiries: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("laptop_enquiries").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("laptop_enquiries");
    },
    async create(enquiry: any) {
      let savedData;
      if (supabase) {
        const { data, error } = await supabase.from("laptop_enquiries").insert([enquiry]).select().single();
        if (error) throw error;
        savedData = data;
      } else {
        const list = getMockData("laptop_enquiries");
        savedData = { id: `lp-${Date.now()}`, status: "new", admin_notes: "", created_at: new Date().toISOString(), ...enquiry };
        saveMockData("laptop_enquiries", [savedData, ...list]);
      }

      await dbHelper.customers.autoCreateOrUpdate(enquiry.phone, {
        name: enquiry.customer_name,
        actionType: "enquiry",
        actionItem: enquiry.laptop_type,
      });

      await dbHelper.notifications.create({
        title: "New Laptop Enquiry",
        message: `${enquiry.customer_name} is looking for: ${enquiry.laptop_type} (Budget: ${enquiry.budget})`,
        type: "laptop_enquiry"
      });

      notifyDataChange("laptop_enquiries", "insert", savedData);
      return savedData;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("laptop_enquiries").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("laptop_enquiries");
      const updated = list.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveMockData("laptop_enquiries", updated);
      notifyDataChange("laptop_enquiries", "update", updated.find((e) => e.id === id));
      return updated.find((e) => e.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("laptop_enquiries").delete().eq("id", id);
        return true;
      }
      const list = getMockData("laptop_enquiries");
      saveMockData("laptop_enquiries", list.filter((e) => e.id !== id));
      notifyDataChange("laptop_enquiries", "delete", { id });
      return true;
    }
  },

  // --- REVIEWS EXTENDED ---
  reviews: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("reviews");
    },
    async create(review: any) {
      let savedData;
      const reviewId = review.id || `rev-${Date.now()}`;
      const payload = {
        id: reviewId,
        status: "pending",
        verified: false,
        featured: false,
        likes_count: 0,
        helpful_count: 0,
        admin_reply: null,
        admin_reply_at: null,
        created_at: new Date().toISOString(),
        ...review,
      };

      if (supabase) {
        const { data, error } = await supabase.from("reviews").insert([payload]).select().single();
        if (error) throw error;
        savedData = data;
      } else {
        const list = getMockData("reviews");
        savedData = payload;
        saveMockData("reviews", [savedData, ...list]);
      }

      // 1. Create Admin Notification
      await dbHelper.notifications.create({
        title: "⭐ New Customer Review",
        message: `${savedData.customer_name || "Customer"} left a ${savedData.rating}★ review for ${savedData.service_used || savedData.product_purchased || "NexByte Services"}`,
        type: "review",
        meta: { review_id: savedData.id }
      });

      // 2. Log Activity
      await dbHelper.activityLogs.create({
        user_name: savedData.customer_name || "Customer",
        role: "customer",
        action: "Customer Submitted Review",
        details: `Rating: ${savedData.rating}★ | Message: "${(savedData.review_message || "").substring(0, 40)}..."`,
        ip: "Client IP"
      });

      // 3. Emit Realtime Notification Event
      notifyDataChange("reviews", "insert", savedData);
      return savedData;
    },
    async update(id: string, updates: any) {
      let savedData: any;
      if (supabase) {
        const { data, error } = await supabase.from("reviews").update(updates).eq("id", id).select().single();
        if (error) throw error;
        savedData = data;
      } else {
        const list = getMockData("reviews");
        const existing = list.find((r) => r.id === id) || {};
        savedData = { ...existing, ...updates };
        const updatedList = list.map((r) => (r.id === id ? savedData : r));
        saveMockData("reviews", updatedList);
      }

      // Log activity and create customer notifications based on update type
      if (updates.status === "approved") {
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: "Admin Approved Review",
          details: `Approved review ${id} by ${savedData.customer_name}`,
          ip: "Client IP"
        });
        await dbHelper.notifications.create({
          title: "✅ Review Approved!",
          message: "Your review has been approved and is now publicly visible on NexByte.",
          type: "review_update",
          customer_email: savedData.email
        });
      } else if (updates.status === "rejected") {
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: "Admin Rejected Review",
          details: `Rejected review ${id}. Reason: ${updates.rejection_reason || "None specified"}`,
          ip: "Client IP"
        });
        await dbHelper.notifications.create({
          title: "❌ Review Update",
          message: `Your review was rejected. Reason: ${updates.rejection_reason || "Does not meet guidelines."}`,
          type: "review_update",
          customer_email: savedData.email
        });
      } else if (updates.status === "need_modification") {
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: "Admin Requested Modification",
          details: `Requested modification on review ${id}. Note: ${updates.modification_reason || "Please update details"}`,
          ip: "Client IP"
        });
        await dbHelper.notifications.create({
          title: "📝 Action Required: Update Your Review",
          message: `Please update your review. Reason: ${updates.modification_reason || "Please clarify your experience."}`,
          type: "review_update",
          customer_email: savedData.email
        });
      } else if (updates.admin_reply !== undefined) {
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: "Admin Replied to Review",
          details: `Replied to review ${id}: "${(updates.admin_reply || "").substring(0, 30)}..."`,
          ip: "Client IP"
        });
        if (updates.admin_reply) {
          await dbHelper.notifications.create({
            title: "💬 Admin Replied to Your Review",
            message: `NexByte Team replied: "${updates.admin_reply}"`,
            type: "review_reply",
            customer_email: savedData.email
          });
        }
      } else if (updates.featured !== undefined) {
        await dbHelper.activityLogs.create({
          user_name: "Admin Officer",
          role: "admin",
          action: updates.featured ? "Admin Featured Review" : "Admin Unfeatured Review",
          details: `Set review ${id} featured = ${updates.featured}`,
          ip: "Client IP"
        });
      }

      notifyDataChange("reviews", "update", savedData);
      return savedData;
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("reviews").delete().eq("id", id);
        return true;
      }
      const list = getMockData("reviews");
      saveMockData("reviews", list.filter((r) => r.id !== id));
      notifyDataChange("reviews", "delete", { id });
      return true;
    }
  },

  // --- GALLERY SECTION ---
  gallery: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("gallery");
    },
    async create(item: any) {
      if (supabase) {
        const { data } = await supabase.from("gallery").insert([item]).select().single();
        return data;
      }
      const list = getMockData("gallery");
      const newItem = { id: `gal-${Date.now()}`, visible: true, created_at: new Date().toISOString(), ...item };
      saveMockData("gallery", [newItem, ...list]);
      notifyDataChange("gallery", "insert", newItem);
      return newItem;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data } = await supabase.from("gallery").update(updates).eq("id", id).select().single();
        return data;
      }
      const list = getMockData("gallery");
      const updated = list.map((g) => (g.id === id ? { ...g, ...updates } : g));
      saveMockData("gallery", updated);
      return updated.find((g) => g.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("gallery").delete().eq("id", id);
        return true;
      }
      const list = getMockData("gallery");
      saveMockData("gallery", list.filter((g) => g.id !== id));
      notifyDataChange("gallery", "delete", { id });
      return true;
    }
  },

  // --- CMS CONTENT SECTION ---
  cmsContent: {
    async get(section?: string) {
      if (supabase) {
        if (section) {
          const { data } = await supabase.from("cms_content").select("*").eq("section", section).single();
          return data?.content || {};
        }
        const { data } = await supabase.from("cms_content").select("*");
        if (!data) return {};
        return data.reduce((acc: any, row: any) => ({ ...acc, [row.section]: row.content }), {});
      }
      const cms = getMockObject("cms_content");
      if (section) return cms[section] || {};
      return cms;
    },
    async update(section: string, content: any) {
      if (supabase) {
        await supabase.from("cms_content").upsert({ section, content, updated_at: new Date().toISOString() });
        return true;
      }
      const cms = getMockObject("cms_content");
      cms[section] = content;
      cms.updated_at = new Date().toISOString();
      saveMockData("cms_content", cms);
      notifyDataChange("cms_content", "update", { section, content });
      return true;
    }
  },
  
  // --- CERTIFICATES SECTION ---
  certificates: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("certificates");
    },
    async getByRegId(regId: string) {
      const list = await this.list();
      return list.find((c) => c.registrationId?.toLowerCase() === regId?.toLowerCase()) || null;
    },
    async create(cert: any) {
      const qrData = `https://nexbytetechnologies.com/verify?regid=${cert.registrationId}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
      const newCert = {
        id: cert.id || `c-${Date.now()}`,
        status: "verified",
        qrCodeUrl: qrUrl,
        created_at: new Date().toISOString(),
        ...cert,
      };

      if (supabase) {
        const { data, error } = await supabase.from("certificates").insert([newCert]).select().single();
        if (error) throw error;
        // Auto update customer certificatesCount
        if (newCert.phoneNumber) {
          await dbHelper.customers.autoCreateOrUpdate(newCert.phoneNumber, {
            name: newCert.studentName,
            email: newCert.email,
            actionType: "certificate",
            actionItem: newCert.courseTitle || newCert.projectTitle,
          });
        }
        return data;
      }

      const list = getMockData("certificates");
      saveMockData("certificates", [newCert, ...list]);
      notifyDataChange("certificates", "insert", newCert);

      // Auto update customer
      if (newCert.phoneNumber) {
        await dbHelper.customers.autoCreateOrUpdate(newCert.phoneNumber, {
          name: newCert.studentName,
          email: newCert.email,
          actionType: "certificate",
          actionItem: newCert.courseTitle || newCert.projectTitle,
        });
      }

      return newCert;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data, error } = await supabase.from("certificates").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getMockData("certificates");
      const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveMockData("certificates", updated);
      notifyDataChange("certificates", "update", updated.find((c) => c.id === id));
      return updated.find((c) => c.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("certificates").delete().eq("id", id);
        return true;
      }
      const list = getMockData("certificates");
      saveMockData("certificates", list.filter((c) => c.id !== id));
      notifyDataChange("certificates", "delete", { id });
      return true;
    }
  },

  // --- ENROLLMENTS SECTION ---
  enrollments: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("enrollments").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("enrollments");
    },
    async create(enrollment: any) {
      const enrollId = `NBT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newEnroll = {
        id: `e-${Date.now()}`,
        enrollmentId: enrollId,
        status: "pending",
        created_at: new Date().toISOString(),
        ...enrollment,
      };

      if (supabase) {
        const { data, error } = await supabase.from("enrollments").insert([newEnroll]).select().single();
        if (error) throw error;
        // Auto update customer profile
        await dbHelper.customers.autoCreateOrUpdate(newEnroll.phone, {
          name: newEnroll.fullName,
          email: newEnroll.email,
          city: newEnroll.city,
          actionType: newEnroll.type || "enrollment",
          actionItem: newEnroll.courseTitle || newEnroll.projectType || "Enrollment",
        });

        // Add admin notification
        await dbHelper.notifications.create({
          title: newEnroll.type === "internship" ? "New Internship Application 🎓" : "New Training Enrollment 📚",
          message: `${newEnroll.fullName} registered for ${newEnroll.courseTitle || newEnroll.projectType}`,
          type: newEnroll.type || "training",
        });

        console.log("Insert Success", data);
        notifyDataChange("enrollments", "insert", data);
        return data;
      }

      const list = getMockData("enrollments");
      saveMockData("enrollments", [newEnroll, ...list]);
      console.log("Insert Success", newEnroll);
      notifyDataChange("enrollments", "insert", newEnroll);

      // Auto update customer profile
      await dbHelper.customers.autoCreateOrUpdate(newEnroll.phone, {
        name: newEnroll.fullName,
        email: newEnroll.email,
        city: newEnroll.city,
        actionType: newEnroll.type || "enrollment",
        actionItem: newEnroll.courseTitle || newEnroll.projectType || "Enrollment",
      });

      // Add admin notification
      await dbHelper.notifications.create({
        title: newEnroll.type === "internship" ? "New Internship Application 🎓" : "New Training Enrollment 📚",
        message: `${newEnroll.fullName} registered for ${newEnroll.courseTitle || newEnroll.projectType}`,
        type: newEnroll.type || "training",
      });

      return newEnroll;
    },
    async updateStatus(id: string, status: string) {
      if (supabase) {
        const { data, error } = await supabase.from("enrollments").update({ status }).eq("id", id).select().single();
        if (error) throw error;
        console.log("Update Success", data);
        notifyDataChange("enrollments", "update", data);
        return data;
      }
      const list = getMockData("enrollments");
      const updated = list.map((e) => (e.id === id ? { ...e, status } : e));
      saveMockData("enrollments", updated);
      notifyDataChange("enrollments", "update", updated.find((e) => e.id === id));
      return updated.find((e) => e.id === id);
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("enrollments").delete().eq("id", id);
        return true;
      }
      const list = getMockData("enrollments");
      saveMockData("enrollments", list.filter((e) => e.id !== id));
      notifyDataChange("enrollments", "delete", { id });
      return true;
    }
  },

  // --- CUSTOMERS DATABASE SECTION ---
  customers: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("customers");
    },
    async getByPhone(phone: string) {
      const list = await this.list();
      return list.find((c) => c.phone === phone) || null;
    },
    async create(cust: any) {
      const custId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCust = {
        id: `cust-${Date.now()}`,
        customerId: custId,
        totalBookings: 0,
        reviewsCount: 0,
        certificatesCount: 0,
        productsPurchased: "",
        servicesTaken: "",
        created_at: new Date().toISOString(),
        ...cust,
      };
      if (supabase) {
        const { data, error } = await supabase.from("customers").insert([newCust]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getMockData("customers");
      saveMockData("customers", [newCust, ...list]);
      notifyDataChange("customers", "insert", newCust);
      return newCust;
    },
    async update(id: string, updates: any) {
      if (supabase) {
        const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getMockData("customers");
      const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveMockData("customers", updated);
      notifyDataChange("customers", "update", updated.find((c) => c.id === id));
      return updated.find((c) => c.id === id);
    },
    async autoCreateOrUpdate(phone: string, details: { name: string; email?: string; city?: string; address?: string; actionType: string; actionItem: string }) {
      const existing = await this.getByPhone(phone);
      if (existing) {
        const updates: any = {};
        if (details.actionType === "booking") {
          updates.totalBookings = (existing.totalBookings || 0) + 1;
          updates.servicesTaken = existing.servicesTaken 
            ? `${existing.servicesTaken}, ${details.actionItem}` 
            : details.actionItem;
        } else if (details.actionType === "enquiry") {
          updates.productsPurchased = existing.productsPurchased 
            ? `${existing.productsPurchased}, ${details.actionItem}` 
            : details.actionItem;
        } else if (details.actionType === "review") {
          updates.reviewsCount = (existing.reviewsCount || 0) + 1;
        } else if (details.actionType === "certificate") {
          updates.certificatesCount = (existing.certificatesCount || 0) + 1;
        } else if (details.actionType === "training" || details.actionType === "internship") {
          updates.servicesTaken = existing.servicesTaken 
            ? `${existing.servicesTaken}, ${details.actionItem}` 
            : details.actionItem;
        }
        if (details.email && !existing.email) updates.email = details.email;
        if (details.city && !existing.city) updates.city = details.city;
        return this.update(existing.id, updates);
      } else {
        const newCust: any = {
          name: details.name,
          phone,
          email: details.email || "",
          city: details.city || "Bengaluru",
          address: details.address || "",
          totalBookings: details.actionType === "booking" ? 1 : 0,
          reviewsCount: details.actionType === "review" ? 1 : 0,
          certificatesCount: details.actionType === "certificate" ? 1 : 0,
          productsPurchased: details.actionType === "enquiry" ? details.actionItem : "",
          servicesTaken: (details.actionType === "booking" || details.actionType === "training" || details.actionType === "internship") ? details.actionItem : "",
        };
        return this.create(newCust);
      }
    }
  },

  // --- MEDIA LIBRARY SECTION ---
  media: {
    async list() {
      if (supabase) {
        const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
        return data || [];
      }
      return getMockData("media");
    },
    async create(mediaItem: any) {
      const newMedia = {
        id: `med-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...mediaItem,
      };
      if (supabase) {
        const { data, error } = await supabase.from("media").insert([newMedia]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getMockData("media");
      saveMockData("media", [newMedia, ...list]);
      notifyDataChange("media", "insert", newMedia);
      return newMedia;
    },
    async delete(id: string) {
      if (supabase) {
        await supabase.from("media").delete().eq("id", id);
        return true;
      }
      const list = getMockData("media");
      saveMockData("media", list.filter((m) => m.id !== id));
      notifyDataChange("media", "delete", { id });
      return true;
    }
  }
};
