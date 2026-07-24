"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";
import { business } from "@/lib/data";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative border-t border-white/[0.04] bg-white/[0.01] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9">
                <Image
                  src="/images/logo-icon-transparent.png"
                  alt="NexByte Technologies"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold">
                NEX<span className="text-nex-blueLight">BYTE</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-nex-mist">
              {business.tagline}
            </p>
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs text-nex-mist hover:text-nex-blueLight"
            >
              <Instagram className="h-4 w-4" />
              {business.instagramHandle}
            </a>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-nex-mist">
              <li><Link href="/products" className="hover:text-nex-blueLight">Products</Link></li>
              <li><Link href="/services" className="hover:text-nex-blueLight">Services</Link></li>
              <li><Link href="/training" className="hover:text-nex-blueLight">Training Programs</Link></li>
              <li><Link href="/internship" className="hover:text-nex-blueLight">Internship Programs</Link></li>
              <li><Link href="/reviews" className="hover:text-nex-blueLight">Customer Reviews</Link></li>
              <li><Link href="/contact" className="hover:text-nex-blueLight">Contact &amp; Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-xs text-nex-mist">
              {business.phones.map((phone, i) => (
                <li key={phone}>
                  <a
                    href={`tel:${business.phoneLinks[i]}`}
                    className="inline-flex items-center gap-2 hover:text-nex-blueLight"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" /> {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 hover:text-nex-blueLight"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {business.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Our Branches</h4>
            <ul className="mt-4 flex flex-col gap-3 text-xs text-nex-mist">
              {business.branches.map((branch) => (
                <li key={branch.name} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="font-medium text-white/90">{branch.name}</span>
                    <br />
                    {branch.location}
                    {branch.status === "opening-soon" && (
                      <span className="ml-1 rounded-full bg-nex-blue/20 px-2 py-0.5 text-[10px] text-nex-blueLight">
                        Opening Soon
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-nex-mist sm:flex-row">
          <p>© {year || 2026} NexByte Technologies. All rights reserved.</p>
          <p>Trusted · Reliable · Affordable</p>
        </div>
      </div>
    </footer>
  );
}
