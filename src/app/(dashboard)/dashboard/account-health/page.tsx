"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, RefreshCw, CheckCircle, AlertCircle, ArrowUp } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useToast } from "@/components/ui/toast";
import { AccountHealthData } from "@/types";
import { getScoreColor } from "@/lib/utils";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function CircularScore({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-200" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="6" strokeLinecap="round"
            stroke="url(#scoreGradient)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <span className="text-text-secondary text-sm mt-2">{label}</span>
    </div>
  );
}

export default function AccountHealthPage() {
  const [loading, setLoading] = useState(false);
  const { accountHealth, setAccountHealth } = useDashboardStore();
  const { toast } = useToast();

  async function generateReport(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/account-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh: force }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setAccountHealth(data.data);
        if (force) toast.success("Account health successfully refreshed!");
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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-brand-400" />
            Account Health
          </h1>
          <p className="text-text-secondary mt-1">Overall score and breakdown of your account performance.</p>
        </div>
        <button
          onClick={() => generateReport(!accountHealth)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : accountHealth ? "Refresh" : "Generate Report"}
        </button>
      </motion.div>

      {loading && !accountHealth && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
      )}

      {accountHealth && (
        <>
          {/* Scores */}
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-8">
            <div className="flex flex-wrap justify-center md:grid md:grid-cols-5 gap-6 md:gap-8 items-center">
              <CircularScore score={accountHealth.overallScore} label="Overall" size={140} />
              <CircularScore score={accountHealth.contentScore} label="Content" size={100} />
              <CircularScore score={accountHealth.engagementScore} label="Engagement" size={100} />
              <CircularScore score={accountHealth.consistencyScore} label="Consistency" size={100} />
              <CircularScore score={accountHealth.growthScore} label="Growth" size={100} />
            </div>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-emerald" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {accountHealth.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-2 flex-shrink-0" />
                    <span className="text-text-secondary">{s}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent-red" />
                Weaknesses
              </h3>
              <ul className="space-y-3">
                {accountHealth.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-red mt-2 flex-shrink-0" />
                    <span className="text-text-secondary">{w}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Recommendations */}
          <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-brand-400" />
              Recommendations
            </h3>
            <div className="space-y-4">
              {accountHealth.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-surface-100/50 border border-border-default"
                >
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    rec.priority === "high" ? "bg-accent-red/10 text-accent-red" :
                    rec.priority === "medium" ? "bg-accent-amber/10 text-accent-amber" :
                    "bg-accent-emerald/10 text-accent-emerald"
                  }`}>
                    {rec.priority.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-text-secondary text-sm mt-1">{rec.description}</div>
                    <div className="text-text-muted text-xs mt-2">Impact: {rec.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {!accountHealth && !loading && (
        <motion.div variants={fadeInUp} className="glass rounded-2xl p-12 text-center">
          <HeartPulse className="w-16 h-16 text-brand-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Generated Yet</h3>
          <p className="text-text-secondary text-sm mb-6">
            Click &ldquo;Generate Report&rdquo; to get your AI-powered account health analysis.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
