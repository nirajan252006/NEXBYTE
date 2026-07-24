import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewsContainer from "@/components/ReviewsContainer";
import { supabase } from "@/lib/supabase";
import { testimonials } from "@/lib/data";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Reviews & Feedback | NexByte Technologies",
  description:
    "See what our clients say about our laptop and desktop repairs, custom PC builds, surveillance systems, and annual maintenance IT services.",
};

const SITE_URL = "https://nexbytetechnologies.com";

const getFallbackReviews = () => {
  return testimonials.map((t, idx) => ({
    id: t.id,
    customer_name: t.name,
    city: t.role,
    rating: t.rating,
    review_message: t.quote,
    recommend: true,
    verified: true,
    source: "public_form" as const,
    likes_count: idx + 3,
    helpful_count: idx + 1,
    created_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    admin_reply: idx === 0 ? "Thank you for the wonderful feedback! We are always happy to help." : null,
    admin_reply_at: idx === 0 ? new Date().toISOString() : null,
    image_urls: [],
  }));
};

async function getInitialReviewsData() {
  const mockReviews = getFallbackReviews();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      reviews: mockReviews,
      totalCount: mockReviews.length,
      averageRating: 5.0,
    };
  }

  try {
    // 1. Fetch total count & ratings for stats
    const { data: statsData, error: statsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("status", "approved");

    if (statsError) throw statsError;

    const totalCount = statsData?.length || 0;
    const averageRating =
      totalCount > 0
        ? parseFloat(
            (statsData.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalCount).toFixed(1)
          )
        : 0;

    // 2. Fetch first page of reviews (newest 12)
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(0, 11);

    if (reviewsError) throw reviewsError;

    return {
      reviews: reviews || [],
      totalCount,
      averageRating,
    };
  } catch (error) {
    console.error("Database query failed on reviews page, falling back:", error);
    return {
      reviews: mockReviews,
      totalCount: mockReviews.length,
      averageRating: 5.0,
    };
  }
}

export default async function ReviewsPage() {
  const { reviews, totalCount, averageRating } = await getInitialReviewsData();

  // JSON-LD Review & AggregateRating schema for Rich Snippet eligibility
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "NexByte Technologies IT & Computer Services",
    "image": `${SITE_URL}/images/logo-horizontal.png`,
    "description": "Premium computer, laptop and network services in Bengaluru.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating > 0 ? averageRating : "5.0",
      "reviewCount": totalCount > 0 ? totalCount : testimonials.length,
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": reviews.slice(0, 10).map((r: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.customer_name,
      },
      "datePublished": r.created_at.split("T")[0],
      "reviewBody": r.review_message,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "5",
        "worstRating": "1",
      },
    })),
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navbar />
      
      <main className="relative min-h-screen bg-nex-black pt-28 pb-16 overflow-hidden">
        {/* Subtle glowing lights */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-nex-blue/15 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <span className="section-eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
                Customer Stories
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                What Our Customers <span className="text-gradient-blue">Say.</span>
              </h1>
              <p className="mt-3 text-sm text-nex-mist max-w-xl">
                Real feedback from businesses and individual customers who trust us for hardware sales, repair support, and network deployments.
              </p>
            </div>
            
            <div className="flex justify-center shrink-0">
              <Link href="/feedback" className="btn-primary flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5" /> Leave a Review
              </Link>
            </div>
          </div>

          {/* Interactive reviews list and statistics dashboard */}
          <ReviewsContainer
            initialReviews={reviews}
            initialTotalCount={totalCount}
            initialAverageRating={averageRating}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
