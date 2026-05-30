"use client";

import { motion } from "framer-motion";
import { Settings, Crown, Instagram, LogOut, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { PLAN_LIMITS } from "@/types";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function SettingsPage() {
  const { account, usage, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div>;
  }

  const plan = (account?.plan || "free") as "free" | "pro";
  const limits = PLAN_LIMITS[plan];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="w-8 h-8 text-text-muted" />Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and subscription.</p>
      </motion.div>

      {/* Connected Account */}
      <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Instagram className="w-5 h-5 text-brand-400" />Connected Account</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-xl font-bold text-white">
            {account?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-semibold text-lg">@{account?.username || "unknown"}</div>
            <div className="text-text-muted text-sm">{account?.full_name || ""}</div>
            <div className="text-text-muted text-xs mt-1">ID: {account?.instagram_id}</div>
          </div>
        </div>
      </motion.div>

      {/* Plan Info */}
      <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-accent-amber" />Plan</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`text-lg font-bold ${plan === "pro" ? "text-brand-400" : "text-text-primary"}`}>
              {plan === "pro" ? "Pro Plan" : "Free Plan"}
            </span>
            <span className="text-text-muted text-sm ml-2">
              {plan === "pro" ? "₹199/month" : "Limited access"}
            </span>
          </div>
          {plan === "free" && (
            <button className="px-5 py-2 rounded-xl font-medium text-sm gradient-bg text-white hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          )}
        </div>
      </motion.div>

      {/* Usage Stats */}
      <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-accent-cyan" />Usage</h3>
        <div className="space-y-4">
          {[
            { label: "AI Reports", used: usage?.reports_used || 0, limit: limits.reports },
            { label: "Competitor Analyses", used: usage?.competitor_analyses_used || 0, limit: limits.competitorAnalyses },
            { label: "Content Ideas", used: usage?.ideas_used || 0, limit: limits.ideas },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium">{item.used} / {item.limit === Infinity ? "∞" : item.limit}</span>
              </div>
              <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                <div className="h-full gradient-bg rounded-full transition-all duration-500"
                  style={{ width: `${item.limit === Infinity ? 5 : Math.min((item.used / item.limit) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Disconnect */}
      <motion.div variants={fadeInUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><LogOut className="w-5 h-5 text-accent-red" />Disconnect</h3>
        <p className="text-text-secondary text-sm mb-4">Disconnect your Instagram account. Your data will be preserved.</p>
        <a href="/api/auth/logout"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Disconnect Account
        </a>
      </motion.div>
    </motion.div>
  );
}
