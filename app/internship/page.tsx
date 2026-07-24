"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Code2,
  Terminal,
  Smartphone,
  Cpu,
  Globe,
  Database,
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  FileText,
  UserCheck,
  ChevronRight,
  BookOpen,
  Trophy,
} from "lucide-react";

const INTERNSHIP_DOMAINS = [
  {
    id: "embedded",
    title: "Embedded & IoT Systems",
    icon: Cpu,
    tech: ["Arduino", "Raspberry Pi", "ESP32", "Sensors", "IEEE Project Architecture"],
    description: "Learn board assembly, serial programming, firmware builds, and sensor configurations. Great for electronics and electrical engineering curricula.",
  },
  {
    id: "web",
    title: "Full-Stack Web Dev",
    icon: Globe,
    tech: ["React.js", "Node.js", "Express", "MongoDB", "REST APIs"],
    description: "Build premium modern web applications from scratch, deploying databases, handling secure API authorization, and styling glassmorphic frontends.",
  },
  {
    id: "python",
    title: "Python Programming",
    icon: Terminal,
    tech: ["Python Core", "Django", "Flask", "Data Analytics", "API integrations"],
    description: "Master backend logic script compilation, scraping utilities, structural clean syntax, and databases integrations.",
  },
  {
    id: "android",
    title: "Android App Dev",
    icon: Smartphone,
    tech: ["Java", "Kotlin", "Android Studio", "Firebase", "SQLite"],
    description: "Design custom mobile layouts, register user authentication, setup databases, and learn Google Play deployment methodologies.",
  },
];

const STUDENT_SUCCESS = [
  {
    name: "Vikram R.",
    college: "SIT Tumkur",
    project: "IoT Smart Agriculture Irrigation System",
    result: "Scored 100% in Final Project Viva",
    placement: "Placed at TCS as Systems Engineer",
  },
  {
    name: "Pooja Hegde",
    college: "RVCE Bengaluru",
    project: "E-Commerce App with React & Node",
    result: "Selected for Best IEEE Project Award",
    placement: "Placed at Capgemini as Developer",
  },
  {
    name: "Sanjay Gowda",
    college: "PESIT Bengaluru",
    project: "Embedded Anti-Theft GPS Tracker",
    result: "Abstract published in College Journal",
    placement: "Placed at Wipro as IoT Associate",
  },
];

export default function InternshipPage() {
  const [activeDomain, setActiveDomain] = useState("embedded");

  const handleEnrollClick = () => {
    window.dispatchEvent(new CustomEvent("nexbyte-open-enrollment-modal", {
      detail: { type: "internship", item: "Embedded & IoT Systems" }
    }));
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-nex-black pt-28 pb-16 overflow-hidden">
        {/* Ambient background lights */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-nex-blue/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-nex-blueLight/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
              NexByte Academy
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Internships & <span className="text-gradient-blue">Projects.</span>
            </h1>
            <p className="mt-4 text-base text-nex-mist leading-relaxed">
              Complete your academic requirements with industry-aligned internships. We provide complete IEEE project support from abstract design and circuit assembly to code execution and documentation.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={handleEnrollClick} className="btn-primary">
                Enroll Now
              </button>
              <a href="#domains" className="btn-secondary">
                View Domains
              </a>
            </div>
          </div>

          {/* Project Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <div className="glass-card p-8 bg-nex-ink border border-white/5 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-xl bg-nex-blue/10 text-nex-blueLight flex items-center justify-center mb-5">
                <BookmarkCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">IEEE Project Support</h3>
              <p className="text-xs text-nex-mist mt-2 leading-relaxed">
                Complete guidance for IEEE papers, covering embedded hardware circuits, microcontrollers, and modern software architectures.
              </p>
            </div>

            <div className="glass-card p-8 bg-nex-ink border border-white/5 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-xl bg-nex-blue/10 text-nex-blueLight flex items-center justify-center mb-5">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Mini &amp; Major Projects</h3>
              <p className="text-xs text-nex-mist mt-2 leading-relaxed">
                Tailored project codes and document summaries for final year engineering, BCA, MCA, and diploma student modules.
              </p>
            </div>

            <div className="glass-card p-8 bg-nex-ink border border-white/5 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-xl bg-nex-blue/10 text-nex-blueLight flex items-center justify-center mb-5">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Industry Internships</h3>
              <p className="text-xs text-nex-mist mt-2 leading-relaxed">
                Hands-on internships certifying your technology competency. Learn workflow logic, APIs, databases, and structural coding.
              </p>
            </div>
          </div>

          {/* domains selection */}
          <div id="domains" className="mb-24 scroll-mt-24">
            <div className="mb-12 text-center">
              <span className="section-eyebrow">Project Categories</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Choose Your <span className="text-gradient-blue">Domain</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                Explore our standard training domains. Our team supports custom IEEE topic abstracts too!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Tab menu */}
              <div className="lg:col-span-4 flex flex-row flex-wrap lg:flex-col gap-2.5">
                {INTERNSHIP_DOMAINS.map((domain) => {
                  const Icon = domain.icon;
                  const isSelected = activeDomain === domain.id;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => setActiveDomain(domain.id)}
                      className={cn(
                        "flex items-center gap-3 w-auto lg:w-full px-4 py-3 rounded-xl text-left border transition-all text-xs font-semibold",
                        isSelected
                          ? "bg-nex-blue border-nex-blue text-white shadow-glow-blue"
                          : "glass-panel text-white/70 border-transparent hover:border-white/10 hover:bg-white/[0.06]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-nex-blueLight" />
                      <span>{domain.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {INTERNSHIP_DOMAINS.map(
                    (domain) =>
                      domain.id === activeDomain && (
                        <motion.div
                          key={domain.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="glass-card p-8 bg-nex-ink border border-white/5 min-h-[300px] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-nex-blue/15 text-nex-blueLight flex items-center justify-center">
                                <domain.icon className="h-5 w-5" />
                              </div>
                              <h3 className="font-display text-lg font-bold text-white">{domain.title}</h3>
                            </div>
                            <p className="mt-5 text-sm text-nex-mist leading-relaxed">{domain.description}</p>
                            
                            <div className="mt-6">
                              <h4 className="text-xs font-semibold text-white/90 mb-3">Key Technologies:</h4>
                              <div className="flex flex-wrap gap-2">
                                {domain.tech.map((t) => (
                                  <span key={t} className="rounded bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] text-nex-blueLight font-semibold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 border-t border-white/5 pt-5 flex items-center justify-between text-xs text-nex-mist">
                            <span>Project Code + report template included</span>
                            <span className="font-semibold text-nex-blueLight">IEEE Standard Compliant</span>
                          </div>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Professional Development Modules */}
          <div className="mb-24">
            <div className="mb-12 text-center">
              <span className="section-eyebrow">Professional Toolkit</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                End-To-End <span className="text-gradient-blue">Career Support</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                We don&apos;t just write code. We prepare you for presentations, synopses reviews, and job interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Resume Building", icon: UserCheck, desc: "Craft developer-grade resumes emphasizing your practical project portfolio." },
                { title: "Career Coaching", icon: Briefcase, desc: "Personal mock interviews and guidance on current IT hiring standards." },
                { title: "Presentation Support", icon: BookOpen, desc: "Slide decks design and oral practice for defending your project viva." },
                { title: "Project Documentation", icon: FileText, desc: "Syllabus-compliant report models with block diagrams, schemas, and codes." },
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-6 border border-white/5 bg-nex-ink flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-nex-blue/10 text-nex-blueLight flex items-center justify-center mb-4">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-nex-mist mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline / Student Journey */}
          <div className="mb-24">
            <div className="mb-12 text-center">
              <span className="section-eyebrow">Internship Journey</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Student <span className="text-gradient-blue">Success Roadmap</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                A simple, clear workflow outlining how we take students from technology onboarding up to placement success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { step: "01", title: "Technology Setup", desc: "Select domain and set up development environments, libraries, and components." },
                { step: "02", title: "IEEE Abstract Review", desc: "Choose your topic and design project synopsis for academic approval." },
                { step: "03", title: "Coding & Hardware", desc: "Write cleanly commented codes and compile hardware circuit connections." },
                { step: "04", title: "Viva Preparation", desc: "Practice project presentations and compile formal documentation files." },
              ].map((step, idx) => (
                <div key={idx} className="glass-card p-6 border border-white/5 bg-nex-ink relative group">
                  <span className="absolute right-4 top-4 font-display text-3xl font-bold text-white/5 group-hover:text-nex-blue/20 transition-colors">
                    {step.step}
                  </span>
                  <h4 className="font-display text-sm font-bold text-white mt-4">{step.title}</h4>
                  <p className="text-[11px] text-nex-mist mt-2 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Success Stories */}
          <div className="mb-24">
            <div className="mb-12 text-center">
              <span className="section-eyebrow">Proven Results</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Student Success <span className="text-gradient-blue">Stories</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                See what former interns have accomplished during their time at NexByte Technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STUDENT_SUCCESS.map((student, idx) => (
                <div key={idx} className="glass-card p-6 border border-white/5 bg-nex-ink flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-nex-blueLight">{student.college}</span>
                    <h4 className="font-display text-sm font-bold text-white mt-1">{student.name}</h4>
                    <div className="h-px bg-white/5 my-3" />
                    <p className="text-xs text-white/90 italic font-medium">&ldquo;{student.project}&rdquo;</p>
                    <p className="text-[11px] text-nex-mist mt-2">{student.result}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
                    <ArrowRight className="h-3 w-3" />
                    {student.placement}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment CTA Card */}
          <div className="text-center glass-panel p-10 rounded-3xl border border-white/5 bg-nex-ink max-w-2xl mx-auto">
            <h3 className="font-display text-2xl font-bold text-white">Enroll in Project Batches</h3>
            <p className="mt-3 text-xs text-nex-mist leading-relaxed">
              Academic slots are filled early. Schedule an expert counselor meeting to select your IEEE project topic.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleEnrollClick} className="btn-primary">
                Enroll Now
              </button>
              <a href="tel:+918088979706" className="btn-secondary">
                Call Program Advisor
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
