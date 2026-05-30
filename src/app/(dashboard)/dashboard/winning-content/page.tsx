"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useToast } from "@/components/ui/toast";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function WinningContentPage() {
  const [loading, setLoading] = useState(false);
  const { winningContent, setWinningContent } = useDashboardStore();
  const toast = useToast();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/winning-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      const data = await res.json();
      
      if (res.ok) { 
        setWinningContent(data.data); 
        if (force) toast.success("Winning content successfully refreshed!");
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    } catch (e) { 
      console.error(e); 
      toast.error("Network error. Please try again.");
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Trophy className="w-8 h-8 text-accent-emerald" />Winning Content</h1>
          <p className="text-text-secondary mt-1">Discover what content performs best and why.</p>
        </div>
        <button onClick={() => generateReport(!winningContent)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : winningContent ? "Refresh" : "Generate Report"}
        </button>
      </motion.div>

      {loading && !winningContent && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div>}

      {winningContent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-accent-emerald" />Winning Factors</h3>
              <ul className="space-y-3">
                {winningContent.winningFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-2 flex-shrink-0" /><span className="text-text-secondary">{f}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ThumbsDown className="w-5 h-5 text-accent-red" />Losing Factors</h3>
              <ul className="space-y-3">
                {winningContent.losingFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-accent-red mt-2 flex-shrink-0" /><span className="text-text-secondary">{f}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Best Themes</h3>
              <div className="space-y-3">
                {winningContent.bestThemes.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-100/50">
                    <span className="text-sm font-medium">{t.theme}</span>
                    <span className="text-xs text-accent-emerald">{t.postCount} posts</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Best Formats</h3>
              <div className="space-y-3">
                {winningContent.bestFormats.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-100/50">
                    <span className="text-sm font-medium">{f.format}</span>
                    <span className="text-xs text-brand-400">{f.postCount} posts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {winningContent.timingPatterns && (
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-3">Timing Patterns</h3>
              <p className="text-text-secondary text-sm">{winningContent.timingPatterns}</p>
            </motion.div>
          )}
        </>
      )}

      {!winningContent && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <Trophy className="w-16 h-16 text-accent-emerald/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Report&rdquo; to discover your winning content.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
