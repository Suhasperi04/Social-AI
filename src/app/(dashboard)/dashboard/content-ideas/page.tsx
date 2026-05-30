"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, RefreshCw, Film, LayoutGrid, MessageCircle, Sparkles } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { ContentIdea } from "@/types";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const tabs = [
  { key: "reelIdeas", label: "Reel Ideas", icon: Film },
  { key: "carouselIdeas", label: "Carousel Ideas", icon: LayoutGrid },
  { key: "storyIdeas", label: "Story Ideas", icon: MessageCircle },
] as const;

function IdeaCard({ idea }: { idea: ContentIdea }) {
  const diffColors = { easy: "bg-accent-emerald/10 text-accent-emerald", medium: "bg-accent-amber/10 text-accent-amber", hard: "bg-accent-red/10 text-accent-red" };
  const potColors = { high: "text-accent-emerald", medium: "text-accent-amber", low: "text-accent-red" };

  return (
    <motion.div variants={fadeInUp} className="glass rounded-xl p-5 hover:border-brand-500/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-semibold text-sm flex-1">{idea.idea}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[idea.difficulty]}`}>
          {idea.difficulty}
        </span>
      </div>
      <p className="text-text-secondary text-xs mb-3">{idea.whyItWorks}</p>
      <div className="flex items-center gap-2">
        <Sparkles className={`w-3.5 h-3.5 ${potColors[idea.growthPotential]}`} />
        <span className={`text-xs font-medium ${potColors[idea.growthPotential]}`}>
          {idea.growthPotential} growth potential
        </span>
      </div>
    </motion.div>
  );
}

export default function ContentIdeasPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("reelIdeas");
  const { contentIdeas, setContentIdeas } = useDashboardStore();

  async function generateIdeas(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/content-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      if (res.ok) { const { data } = await res.json(); setContentIdeas(data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const currentIdeas = contentIdeas?.[activeTab] || [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Lightbulb className="w-8 h-8 text-brand-300" />Content Ideas</h1>
          <p className="text-text-secondary mt-1">AI-generated content ideas tailored to your niche.</p>
        </div>
        <button onClick={() => generateIdeas(!contentIdeas)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating..." : contentIdeas ? "Generate More" : "Generate Ideas"}
        </button>
      </motion.div>

      {contentIdeas && (
        <motion.div variants={fadeInUp} className="flex gap-2 p-1 bg-surface-100 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-brand-500/20 text-brand-400" : "text-text-muted hover:text-text-primary"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>
      )}

      {loading && !contentIdeas && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 shimmer rounded-xl" />)}</div>}

      {contentIdeas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentIdeas.map((idea, i) => <IdeaCard key={i} idea={idea} />)}
        </div>
      )}

      {!contentIdeas && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <Lightbulb className="w-16 h-16 text-brand-300/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Ideas Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Ideas&rdquo; to get AI-powered content ideas.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
