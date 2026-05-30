"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useToast } from "@/components/ui/toast";
import { getPriorityColor } from "@/lib/utils";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function GrowthBlockersPage() {
  const [loading, setLoading] = useState(false);
  const { growthBlockers, setGrowthBlockers } = useDashboardStore();

  const toast = useToast();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/growth-blockers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      const data = await res.json();
      
      if (res.ok) { 
        setGrowthBlockers(data.data); 
        if (force) toast.success("Report successfully refreshed!");
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
          <h1 className="text-3xl font-bold flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-accent-pink" />Growth Blockers</h1>
          <p className="text-text-secondary mt-1">Discover what&apos;s holding your account back.</p>
        </div>
        <button onClick={() => generateReport(!growthBlockers)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : growthBlockers ? "Refresh" : "Generate Report"}
        </button>
      </motion.div>

      {loading && !growthBlockers && <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}</div>}

      {growthBlockers && (
        <>
          {growthBlockers.summary && (
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <p className="text-text-secondary">{growthBlockers.summary}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {growthBlockers.blockers
              .sort((a, b) => b.priority - a.priority)
              .map((blocker, i) => (
                <motion.div key={i} variants={fadeInUp} className="glass rounded-2xl p-6 hover:border-brand-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl font-bold text-text-muted">#{i + 1}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        blocker.impact === "high" ? "bg-accent-red/10 text-accent-red" :
                        blocker.impact === "medium" ? "bg-accent-amber/10 text-accent-amber" :
                        "bg-accent-emerald/10 text-accent-emerald"
                      }`}>{blocker.impact.toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{blocker.issue}</h3>
                      <p className="text-text-secondary text-sm mb-3">{blocker.recommendation}</p>
                      <span className="text-xs text-text-muted bg-surface-200 px-2 py-1 rounded-md">{blocker.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </>
      )}

      {!growthBlockers && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-accent-pink/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Report&rdquo; to discover your growth blockers.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
