"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, RefreshCw, Target, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useToast } from "@/components/ui/toast";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function GrowthPlanPage() {
  const [loading, setLoading] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const { growthPlan, setGrowthPlan } = useDashboardStore();
  const { toast } = useToast();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/growth-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ forceRefresh: force }) });
      const data = await res.json();
      
      if (res.ok) { 
        setGrowthPlan(data.data); 
        if (force) toast.success("Growth plan successfully refreshed!");
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
          <h1 className="text-3xl font-bold flex items-center gap-3"><Map className="w-8 h-8 text-accent-pink" />30-Day Growth Plan</h1>
          <p className="text-text-secondary mt-1">Your personalized roadmap to Instagram growth.</p>
        </div>
        <button onClick={() => generateReport(!growthPlan)} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating..." : growthPlan ? "Refresh" : "Generate Plan"}
        </button>
      </motion.div>

      {loading && !growthPlan && <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 shimmer rounded-2xl" />)}</div>}

      {growthPlan && (
        <>
          {growthPlan.summary && (
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <p className="text-text-secondary">{growthPlan.summary}</p>
            </motion.div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            {growthPlan.weeks.map((week) => {
              const isExpanded = expandedWeek === week.weekNumber;
              const weekColors = ["gradient-bg", "bg-accent-cyan", "bg-accent-emerald", "bg-accent-pink"];

              return (
                <motion.div key={week.weekNumber} variants={fadeInUp} className="glass rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-surface-200/30 transition-colors">
                    <div className={`w-12 h-12 rounded-xl ${weekColors[(week.weekNumber - 1) % 4]} flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">W{week.weekNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Week {week.weekNumber}</div>
                      <div className="text-text-secondary text-sm">{week.focus}</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-6">
                      {/* Goals */}
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-brand-400" /> Goals
                        </h4>
                        <ul className="space-y-2">
                          {week.goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-accent-emerald mt-0.5 flex-shrink-0" />
                              <span className="text-text-secondary">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="font-medium text-sm mb-3">Daily Actions</h4>
                        <div className="space-y-2">
                          {week.actions.map((action, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-100/50">
                              {action.day && <span className="text-xs font-mono text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded">{action.day}</span>}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{action.action}</div>
                                <div className="text-text-muted text-xs mt-0.5">{action.details}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!growthPlan && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <Map className="w-16 h-16 text-accent-pink/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Plan Generated Yet</h3>
          <p className="text-text-secondary text-sm">Click &ldquo;Generate Plan&rdquo; to get your 30-day growth roadmap.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
