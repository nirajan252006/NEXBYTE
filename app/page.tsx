import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Gallery = dynamic(() => import("@/components/Gallery"));
const QRSection = dynamic(() => import("@/components/QRSection"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const FAQ = dynamic(() => import("@/components/FAQ"));
import { supabase } from "@/lib/supabase";
import { testimonials } from "@/lib/data";
import ReviewsStatsStrip from "@/components/ReviewsStatsStrip";

export const metadata: Metadata = {
  title: "NexByte Technologies | Premium Computers, Laptops & IT Services in Bengaluru",
};

async function getReviewsSummary() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { count: testimonials.length, average: 5.0 };
  }
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("status", "approved");

    if (error) throw error;
    const count = data?.length || 0;
    const average = count > 0 
      ? parseFloat((data.reduce((acc: number, curr: any) => acc + curr.rating, 0) / count).toFixed(1))
      : 5.0;
    return { count, average };
  } catch (e) {
    return { count: testimonials.length, average: 5.0 };
  }
}

export default async function HomePage() {
  const { count, average } = await getReviewsSummary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "NexByte Technologies Computer Sales & Repair Services",
    "image": "https://nexbytetechnologies.com/images/logo-horizontal.png",
    "description": "Bengaluru's trusted destination for premium computers, laptops, CCTV systems, and IT services.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": average,
      "reviewCount": count,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <ReviewsStatsStrip averageRating={average} totalCount={count} />
        <ProductShowcase />
        <Services />
        <WhyChooseUs />
        <Gallery />
        <QRSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
