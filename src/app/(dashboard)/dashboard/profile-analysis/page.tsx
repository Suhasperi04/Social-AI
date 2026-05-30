"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, RefreshCw, Star } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { ProfileAnalysisData, RatingItem } from "@/types";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function RatingBar({ item, label }: { item: RatingItem; label: string }) {
  const statusColors = { good: "text-accent-emerald bg-accent-emerald", needs_improvement: "text-accent-amber bg-accent-amber", bad: "text-accent-red bg-accent-red" };
  const color = statusColors[item.status] || statusColors.needs_improvement;

  return (
    <div className="p-4 rounded-xl bg-surface-100/50 border border-border-default">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color.split(" ")[0]} ${color.split(" ")[1]}/10`}>
          {item.rating}/10
        </span>
      </div>
      <div className="h-2 bg-surface-200 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(item.rating / 10) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color.split(" ")[1]}`}
        />
      </div>
      <p className="text-text-secondary text-xs">{item.feedback}</p>
    </div>
  );
}

export default function ProfileAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const { profileAnalysis, setProfileAnalysis } = useDashboardStore();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/profile-analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      if (res.ok) { const { data } = await res.json(); setProfileAnalysis(data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><UserCircle className="w-8 h-8 text-accent-cyan" />Profile Analysis</h1>
          <p className="text-text-secondary mt-1">Detailed review of your profile optimization.</p>
        </div>
        <button onClick={() => generateReport(!profileAnalysis)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 transition-opacity disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : profileAnalysis ? "Refresh" : "Generate Report"}
        </button>
      </motion.div>

      {loading && !profileAnalysis && (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      )}

      {profileAnalysis && (
        <>
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-accent-amber fill-accent-amber" />
              <span className="text-4xl font-bold">{profileAnalysis.overallRating}</span>
              <span className="text-text-muted text-lg">/10</span>
            </div>
            <p className="text-text-secondary text-sm">Overall Profile Rating</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={fadeInUp}><RatingBar item={profileAnalysis.username} label="Username" /></motion.div>
            <motion.div variants={fadeInUp}><RatingBar item={profileAnalysis.bio} label="Bio" /></motion.div>
            <motion.div variants={fadeInUp}><RatingBar item={profileAnalysis.cta} label="Call to Action" /></motion.div>
            <motion.div variants={fadeInUp}><RatingBar item={profileAnalysis.positioning} label="Positioning" /></motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-2"><RatingBar item={profileAnalysis.profileStructure} label="Profile Structure" /></motion.div>
          </div>

          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Recommendations</h3>
            <div className="space-y-3">
              {profileAnalysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface-100/50 border border-border-default">
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold ${rec.priority === "high" ? "bg-accent-red/10 text-accent-red" : rec.priority === "medium" ? "bg-accent-amber/10 text-accent-amber" : "bg-accent-emerald/10 text-accent-emerald"}`}>{rec.priority.toUpperCase()}</div>
                  <div><div className="font-medium text-sm">{rec.title}</div><div className="text-text-secondary text-sm mt-1">{rec.description}</div></div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {!profileAnalysis && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <UserCircle className="w-16 h-16 text-accent-cyan/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Report&rdquo; to analyze your profile.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
