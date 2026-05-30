"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, Sun, Moon, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function BestTimePage() {
  const [loading, setLoading] = useState(false);
  const { bestTime, setBestTime } = useDashboardStore();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/best-time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      if (res.ok) { const { data } = await res.json(); setBestTime(data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Clock className="w-8 h-8 text-accent-cyan" />Best Time to Post</h1>
          <p className="text-text-secondary mt-1">Optimize your posting schedule for maximum engagement.</p>
        </div>
        <button onClick={() => generateReport(!bestTime)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : bestTime ? "Refresh" : "Generate Report"}
        </button>
      </motion.div>

      {loading && !bestTime && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div>}

      {bestTime && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-5 text-center">
              <Sun className="w-8 h-8 text-accent-emerald mx-auto mb-2" />
              <div className="text-xs text-text-muted mb-1">Best Day</div>
              <div className="text-xl font-bold text-accent-emerald">{bestTime.bestDay}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-5 text-center">
              <TrendingUp className="w-8 h-8 text-brand-400 mx-auto mb-2" />
              <div className="text-xs text-text-muted mb-1">Best Time</div>
              <div className="text-xl font-bold text-brand-400">{bestTime.bestTime}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-5 text-center">
              <Moon className="w-8 h-8 text-accent-red mx-auto mb-2" />
              <div className="text-xs text-text-muted mb-1">Worst Day</div>
              <div className="text-xl font-bold text-accent-red">{bestTime.worstDay}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-5 text-center">
              <TrendingDown className="w-8 h-8 text-accent-amber mx-auto mb-2" />
              <div className="text-xs text-text-muted mb-1">Worst Time</div>
              <div className="text-xl font-bold text-accent-amber">{bestTime.worstTime}</div>
            </motion.div>
          </div>

          {/* Daily Breakdown */}
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Daily Breakdown</h3>
            <div className="space-y-3">
              {bestTime.dailyBreakdown.map((day) => {
                const maxEng = Math.max(...bestTime.dailyBreakdown.map((d) => d.avgEngagement), 1);
                const pct = (day.avgEngagement / maxEng) * 100;
                return (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary w-24">{day.day}</span>
                    <div className="flex-1 h-6 bg-surface-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full gradient-bg" />
                    </div>
                    <span className="text-xs text-text-muted w-16 text-right">{day.avgEngagement.toFixed(0)} avg</span>
                    <span className="text-xs text-text-muted w-12 text-right">{day.postCount}p</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Hourly Breakdown */}
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Hourly Breakdown</h3>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {bestTime.hourlyBreakdown.map((slot) => {
                const maxEng = Math.max(...bestTime.hourlyBreakdown.map((h) => h.avgEngagement), 1);
                const intensity = slot.avgEngagement / maxEng;
                return (
                  <div key={slot.hour} className="text-center">
                    <div
                      className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${0.1 + intensity * 0.6})`,
                        color: intensity > 0.5 ? "white" : "rgb(156, 163, 175)",
                      }}
                    >
                      {slot.hour}
                    </div>
                    <span className="text-[10px] text-text-muted">{slot.hour}:00</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {!bestTime && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <Clock className="w-16 h-16 text-accent-cyan/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Report&rdquo; to find your best posting times.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
