"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { business } from "@/lib/data";
import { dbHelper } from "@/lib/dbHelper";
import {
  Laptop,
  Cpu,
  Monitor,
  Terminal,
  Layers,
  Wifi,
  ClipboardCheck,
  Printer,
  HardDrive,
  Code,
  Smartphone,
  Gamepad2,
  ArrowUpCircle,
  Headphones,
  Cloud,
  ChevronRight,
  MessageSquare,
  Calendar,
} from "lucide-react";

// Map data iconName strings to Lucide icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  Laptop: Laptop,
  Cpu: Cpu,
  MonitorDot: Monitor,
  Terminal: Terminal,
  Layers: Layers,
  Wifi: Wifi,
  ClipboardCheck: ClipboardCheck,
  Printer: Printer,
  HardDrive: HardDrive,
  Code: Code,
  Smartphone: Smartphone,
  Gamepad2: Gamepad2,
  ArrowUpCircle: ArrowUpCircle,
  Headphones: Headphones,
  Cloud: Cloud,
};

export default function ServicesPage() {
  const [servicesData, setServicesData] = useState<any[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      const data = await dbHelper.services.list();
      setServicesData(data.filter((s: any) => !s.status || s.status === "enabled"));
    };
    loadServices();
    window.addEventListener("nexbyte-realtime", loadServices);
    return () => window.removeEventListener("nexbyte-realtime", loadServices);
  }, []);

  const handleBookService = (serviceName?: string) => {
    window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", {
      detail: { type: "service", item: serviceName }
    }));
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-nex-black pt-28 pb-16 overflow-hidden">
        {/* Glowing backgrounds */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-nex-blue/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-nex-blueLight/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
              Complete IT Solutions
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Professional <span className="text-gradient-blue">Services.</span>
            </h1>
            <p className="mt-4 text-base text-nex-mist leading-relaxed">
              From board-level laptop repairs and secure corporate networking setup to custom software development and annual maintenance contracts — NexByte is your trusted IT partner.
            </p>
            <div className="mt-8 flex justify-center">
              <button onClick={() => handleBookService()} className="btn-primary flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Book Service Instantly
              </button>
            </div>
          </div>

          {/* Grid of 15 Services */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesData.map((srv) => {
              const IconComponent = iconMap[srv.iconName] || Laptop;
              return (
                <div
                  key={srv.id}
                  className="glass-card p-6 bg-nex-ink border border-white/5 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div>
                    {/* Header: Icon + Title */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-nex-blue/15 text-nex-blueLight flex items-center justify-center group-hover:bg-nex-blue group-hover:text-white transition-colors duration-300">
                        <IconComponent className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-nex-blueLight transition-colors">
                        {srv.title}
                      </h3>
                    </div>
                    {/* Description */}
                    <p className="text-xs text-nex-mist leading-relaxed min-h-[50px]">
                      {srv.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center gap-3">
                    <button
                      onClick={() => handleBookService(srv.title)}
                      className="btn-primary !py-2 !px-4 text-[10px] flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Before & After Repair Gallery Section */}
          <div className="mt-28">
            <div className="mb-12 text-center">
              <span className="section-eyebrow">Quality in Action</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Before &amp; After <span className="text-gradient-blue">Repair Gallery</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                Real board-level servicing examples performed at our repair center.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Case 1 */}
              <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl">
                <h4 className="font-display text-sm font-bold text-white mb-4">Case #1: Liquid Damaged Motherboard</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-40 rounded-xl overflow-hidden border border-red-500/20 bg-red-950/10 flex flex-col justify-end p-3">
                    <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Corroded</span>
                    <p className="text-[10px] text-red-200 font-semibold relative z-10">Short circuits & oxide layers</p>
                  </div>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-green-500/20 bg-green-950/10 flex flex-col justify-end p-3">
                    <span className="absolute top-3 left-3 bg-green-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Restored</span>
                    <p className="text-[10px] text-green-200 font-semibold relative z-10">Ultrasonic cleaned & re-soldered</p>
                  </div>
                </div>
              </div>

              {/* Case 2 */}
              <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl">
                <h4 className="font-display text-sm font-bold text-white mb-4">Case #2: Broken Laptop Hinge & Housing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-40 rounded-xl overflow-hidden border border-red-500/20 bg-red-950/10 flex flex-col justify-end p-3">
                    <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Shattered</span>
                    <p className="text-[10px] text-red-200 font-semibold relative z-10">Hinges ripped from panel backing</p>
                  </div>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-green-500/20 bg-green-950/10 flex flex-col justify-end p-3">
                    <span className="absolute top-3 left-3 bg-green-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Reconstructed</span>
                    <p className="text-[10px] text-green-200 font-semibold relative z-10">Reinforced epoxy & new hinges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Info Footer */}
          <div className="text-center glass-panel p-10 rounded-3xl border border-white/5 bg-nex-ink max-w-2xl mx-auto mt-24">
            <h3 className="font-display text-2xl font-bold text-white">Require Immediate Remote Support?</h3>
            <p className="mt-3 text-xs text-nex-mist leading-relaxed">
              We offer remote software installation and diagnostics services. Connect with our hardware engineer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleBookService("Remote Technical Support")}
                className="btn-primary flex items-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4" /> Book Remote Session
              </button>
              <a href="tel:+918088979706" className="btn-secondary">
                Call Support Desk
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
