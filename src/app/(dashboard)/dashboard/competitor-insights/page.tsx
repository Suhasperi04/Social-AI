"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, RefreshCw, Search, ArrowRight, Shield, Target } from "lucide-react";
import { CompetitorAnalysisData } from "@/types";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function CompetitorInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [analysis, setAnalysis] = useState<CompetitorAnalysisData | null>(null);
  const [error, setError] = useState("");

  async function analyzeCompetitor() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().replace("@", "") }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setAnalysis(data);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to analyze competitor");
      }
    } catch (e) { setError("Network error"); } finally { setLoading(false); }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Users className="w-8 h-8 text-accent-amber" />Competitor Insights</h1>
        <p className="text-text-secondary mt-1">Analyze competitors and find growth opportunities.</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter competitor username (e.g. garyvee)"
              onKeyDown={(e) => e.key === "Enter" && analyzeCompetitor()}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-100 border border-border-default text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
          <button onClick={analyzeCompetitor} disabled={loading || !username.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && <p className="text-accent-red text-sm mt-3">{error}</p>}
      </motion.div>

      {loading && !analysis && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div>}

      {analysis && (
        <>
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">You vs @{username}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Followers", yours: analysis.comparison.yourFollowers, theirs: analysis.comparison.competitorFollowers },
                { label: "Engagement", yours: `${analysis.comparison.yourEngagement}%`, theirs: `${analysis.comparison.competitorEngagement}%` },
                { label: "Posting", yours: analysis.comparison.yourPostingFrequency, theirs: analysis.comparison.competitorPostingFrequency },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl bg-surface-100/50">
                  <div className="text-text-muted text-xs mb-3">{item.label}</div>
                  <div className="flex items-center justify-center gap-4">
                    <div><div className="text-lg font-bold text-brand-400">{item.yours}</div><div className="text-xs text-text-muted">You</div></div>
                    <div className="text-text-muted">vs</div>
                    <div><div className="text-lg font-bold text-accent-cyan">{item.theirs}</div><div className="text-xs text-text-muted">Them</div></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-accent-cyan" />Their Strengths</h3>
              <ul className="space-y-2">
                {analysis.competitorStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary"><div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2 flex-shrink-0" />{s}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-accent-emerald" />Opportunities for You</h3>
              <ul className="space-y-2">
                {analysis.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary"><div className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-2 flex-shrink-0" />{o}</li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Recommendations</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface-100/50 border border-border-default">
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold ${rec.priority === "high" ? "bg-accent-red/10 text-accent-red" : rec.priority === "medium" ? "bg-accent-amber/10 text-accent-amber" : "bg-accent-emerald/10 text-accent-emerald"}`}>{rec.priority.toUpperCase()}</div>
                  <div><div className="font-medium text-sm">{rec.title}</div><div className="text-text-secondary text-sm mt-1">{rec.description}</div></div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {!analysis && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-accent-amber/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Enter a Competitor Username</h3>
          <p className="text-text-secondary text-sm">Search for a competitor above to see a detailed comparison.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
