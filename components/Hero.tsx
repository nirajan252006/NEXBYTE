"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { business } from "@/lib/data";

const PARTICLE_COUNT = 28;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [particles, setParticles] = useState<{size: number, left: number, top: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        size: 2 + Math.random() * 3,
        left: Math.random() * 100,
        top: 20 + Math.random() * 60,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 10
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-premium-mesh pt-32 pb-20"
    >
      <div className="pointer-events-none absolute inset-0 radial-glow-cyan opacity-20" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-nex-blue/15 blur-[160px]" />

      {/* Floating particles — Rendered purely from state to avoid hydration mismatch */}
      <div id="hero-particles" className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-nex-blueLight/60 animate-float"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: "0 0 8px rgba(74,140,255,0.8)"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 sm:px-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="section-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-[0_0_8px_rgba(74,140,255,0.6)]" />
            Bengaluru · Tumkur · Hiriyur (soon)
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-[3rem] leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-[4.5rem]"
          >
            Premium Technology,
            <br />
            <span className="text-gradient-blue tracking-tighter">Engineered for Business.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-xl text-[1.1rem] leading-relaxed text-white/60 sm:text-lg"
          >
            {business.description}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", { detail: { type: "service" } }));
              }}
              className="btn-primary group py-3.5 px-8"
            >
              Book a Service
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", { detail: { type: "product" } }));
              }}
              className="btn-secondary group py-3.5 px-8"
            >
              View Products
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] font-medium text-white/40 uppercase tracking-wide"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nex-blueLight" /> Genuine Products
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nex-blueLight" /> Warranty Included
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nex-blueLight" /> Doorstep Support
            </span>
          </motion.div>
        </motion.div>

        {/* Glowing logo column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="relative mx-auto flex items-center justify-center"
        >
          <div className="absolute h-72 w-72 rounded-full bg-nex-blue/30 blur-[90px] animate-pulse-glow sm:h-96 sm:w-96" />
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
          >
            <Image
              src="/images/logo-icon-transparent.png"
              alt="NexByte Technologies"
              fill
              sizes="(max-width: 768px) 256px, 384px"
              className="object-contain drop-shadow-[0_0_60px_rgba(30,94,255,0.5)]"
              priority
            />
          </motion.div>
          {/* Orbiting ring accent */}
          <div className="absolute h-[110%] w-[110%] rounded-full border border-nex-blue/20" />
          <div className="absolute h-[125%] w-[125%] rounded-full border border-dashed border-nex-blue/10" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-nex-blueLight"
          />
        </div>
      </motion.div>
    </section>
  );
}
