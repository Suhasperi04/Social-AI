"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/toast";
import {
  HeartPulse,
  TrendingUp,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function ScoreCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: "up" | "down";
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="glass rounded-2xl p-6 hover:border-brand-500/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-accent-emerald" : "text-accent-red"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-text-muted text-sm">{label}</div>
    </motion.div>
  );
}

const quickActions = [
  {
    title: "Account Health",
    desc: "Get your overall score",
    href: "/dashboard/account-health",
    icon: HeartPulse,
    color: "text-brand-400",
  },
  {
    title: "Growth Blockers",
    desc: "Find what's holding you back",
    href: "/dashboard/growth-blockers",
    icon: Zap,
    color: "text-accent-pink",
  },
  {
    title: "Winning Content",
    desc: "Discover your best performers",
    href: "/dashboard/winning-content",
    icon: TrendingUp,
    color: "text-accent-emerald",
  },
  {
    title: "30-Day Growth Plan",
    desc: "Get your personalized roadmap",
    href: "/dashboard/growth-plan",
    icon: BarChart3,
    color: "text-accent-cyan",
  },
];

export default function DashboardHome() {
  const { account, usage, isLoading } = useAuthStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
        setCheckoutLoading(false);
      }
    } catch (e) {
      toast.error("Network error connecting to Stripe");
      setCheckoutLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold mb-1">
          Welcome back
          {account?.username ? `, @${account.username}` : ""}
        </h1>
        <p className="text-text-secondary">
          Here&apos;s an overview of your Instagram account.
        </p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          label="Followers"
          value={formatNumber(account?.followers_count || 0)}
          icon={HeartPulse}
          color="text-brand-400"
          bgColor="bg-brand-400/10"
          trend="up"
        />
        <ScoreCard
          label="Following"
          value={formatNumber(account?.following_count || 0)}
          icon={TrendingUp}
          color="text-accent-cyan"
          bgColor="bg-accent-cyan/10"
        />
        <ScoreCard
          label="Total Posts"
          value={formatNumber(account?.media_count || 0)}
          icon={BarChart3}
          color="text-accent-pink"
          bgColor="bg-accent-pink/10"
        />
        <ScoreCard
          label="Reports Used"
          value={`${usage?.reports_used || 0} / ${account?.plan === "pro" ? "∞" : "3"}`}
          icon={Zap}
          color="text-accent-emerald"
          bgColor="bg-accent-emerald/10"
        />
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group glass rounded-xl p-5 flex items-center gap-4 hover:border-brand-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-text-muted text-xs">{action.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Usage Overview */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-lg font-semibold mb-4">Usage Overview</h2>
        <div className="glass rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Reports", used: usage?.reports_used || 0, limit: account?.plan === "pro" ? "∞" : 3 },
              { label: "Competitor Analyses", used: usage?.competitor_analyses_used || 0, limit: account?.plan === "pro" ? "∞" : 3 },
              { label: "Content Ideas", used: usage?.ideas_used || 0, limit: account?.plan === "pro" ? "∞" : 10 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-medium">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{
                      width: `${typeof item.limit === "number" ? Math.min((item.used / item.limit) * 100, 100) : 5}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Upgrade Banner for Free Users */}
      {account?.plan === "free" && (
        <motion.div variants={fadeInUp}>
          <div className="relative overflow-hidden rounded-2xl gradient-bg p-8">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-lg">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="text-white/80 text-sm">
                  Get unlimited reports, competitor analyses, and content ideas.
                  Unlock your full growth potential.
                </p>
              </div>
              <button 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="px-6 py-3 bg-white text-surface-0 rounded-xl font-semibold hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-70 flex items-center justify-center min-w-[180px]"
              >
                {checkoutLoading ? (
                  <span className="w-5 h-5 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Upgrade — ₹199/mo"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
