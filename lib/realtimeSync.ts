"use client";

import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

type RealtimeEvent = {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

type RealtimeCallback = (event: RealtimeEvent) => void;

const WATCHED_TABLES = [
  "bookings",
  "reviews",
  "contacts",
  "laptop_enquiries",
  "internships",
  "training",
  "notifications",
  "products",
  "services",
  "users",
  "certificates",
  "enrollments",
  "customers",
  "media",
];

class RealtimeSyncManager {
  private supabase: SupabaseClient | null = null;
  private channels: RealtimeChannel[] = [];
  private listeners: Map<string, Set<RealtimeCallback>> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      this.supabase = createClient(url, key);
      // We will still subscribe to Supabase Realtime as a backup, 
      // but primarily rely on our own robust SSE pipeline below.
      this.subscribeToTables();
    }
    
    // ALWAYS start our custom SSE pipeline to guarantee events 
    // are broadcasted from local dbHelper mutations and API routes.
    this.startPolling();
  }

  private subscribeToTables() {
    if (!this.supabase) return;

    WATCHED_TABLES.forEach((table) => {
      const channel = this.supabase!.channel(`realtime-${table}`)
        .on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table },
          (payload: any) => {
            const event: RealtimeEvent = {
              table,
              eventType: payload.eventType,
              new: payload.new || {},
              old: payload.old || {},
            };

            console.log("Realtime Event Received", event);
            this.emit(table, event);
            this.emit("*", event); // wildcard listeners

            // Dispatch browser CustomEvent for components
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("nexbyte-realtime", { detail: event })
              );
            }
          }
        )
        .subscribe();

      this.channels.push(channel);
    });
  }

  private startPolling() {
    if (typeof window === "undefined") return;

    // Setup BroadcastChannel for cross-tab communication (replaces SSE to prevent dev server hangs)
    const bc = new BroadcastChannel("nexbyte-sync-channel");
    
    // When this tab receives a local data change from dbHelper, broadcast it to other tabs!
    window.addEventListener("nexbyte-data-changed", ((e: CustomEvent) => {
      const { table, action, data } = e.detail || {};
      if (table) {
        const event: RealtimeEvent = {
          table,
          eventType: action === "delete" ? "DELETE" : action === "update" ? "UPDATE" : "INSERT",
          new: data || {},
          old: {},
        };
        console.log("Realtime Event Received locally, broadcasting...", event);
        this.emit(table, event);
        this.emit("*", event);
        window.dispatchEvent(new CustomEvent("nexbyte-realtime", { detail: event }));
        
        // Broadcast to other tabs
        bc.postMessage(event);
      }
    }) as EventListener);

    // Listen for broadcasts from OTHER tabs
    bc.onmessage = (e) => {
      const eventData = e.data;
      if (eventData && eventData.table) {
        console.log("[CLIENT] BroadcastChannel message received:", eventData);
        const event: RealtimeEvent = {
          table: eventData.table,
          eventType: eventData.eventType,
          new: eventData.new || {},
          old: eventData.old || {},
        };
        this.emit(eventData.table, event);
        this.emit("*", event);
        window.dispatchEvent(new CustomEvent("nexbyte-realtime", { detail: event }));
      }
    };
  }

  on(table: string, callback: RealtimeCallback) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set());
    }
    this.listeners.get(table)!.add(callback);

    return () => {
      this.listeners.get(table)?.delete(callback);
    };
  }

  private emit(table: string, event: RealtimeEvent) {
    this.listeners.get(table)?.forEach((cb) => cb(event));
  }

  cleanup() {
    this.channels.forEach((ch) => ch.unsubscribe());
    this.channels = [];
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.initialized = false;
  }
}

// Singleton instance
export const realtimeSync = new RealtimeSyncManager();

// Helper to dispatch data change events from dbHelper (mock mode)
export function notifyDataChange(table: string, action: string, data?: any) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("nexbyte-data-changed", {
        detail: { table, action, data },
      })
    );
  }
}
