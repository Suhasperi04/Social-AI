"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  HeartPulse,
  UserCircle,
  AlertTriangle,
  Trophy,
  Users,
  Lightbulb,
  Clock,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/account-health", label: "Account Health", icon: HeartPulse },
  { href: "/dashboard/profile-analysis", label: "Profile Analysis", icon: UserCircle },
  { href: "/dashboard/growth-blockers", label: "Growth Blockers", icon: AlertTriangle },
  { href: "/dashboard/winning-content", label: "Winning Content", icon: Trophy },
  { href: "/dashboard/competitor-insights", label: "Competitor Insights", icon: Users },
  { href: "/dashboard/content-ideas", label: "Content Ideas", icon: Lightbulb },
  { href: "/dashboard/best-time", label: "Best Time to Post", icon: Clock },
  { href: "/dashboard/growth-plan", label: "Growth Plan", icon: Map },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { account } = useAuthStore();

  return (
    <div className={`flex flex-col h-full ${mobile ? "" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border-default">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">GrowMyAccount</span>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Account Info */}
      {account && (
        <div className="px-4 py-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white">
              {account.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                @{account.username || "unknown"}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    account.plan === "pro"
                      ? "bg-brand-500/20 text-brand-400"
                      : "bg-surface-200 text-text-muted"
                  }`}
                >
                  {account.plan === "pro" ? "PRO" : "FREE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-200/50"
              }`}
            >
              <item.icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${
                  isActive ? "text-brand-400" : "text-text-muted group-hover:text-text-secondary"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner (free users) */}
      {account?.plan === "free" && (
        <div className="px-3 py-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-600/20 to-accent-cyan/10 border border-brand-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Get unlimited reports and insights.
            </p>
            <button className="w-full py-2 rounded-lg text-xs font-semibold gradient-bg text-white hover:opacity-90 transition-opacity">
              Upgrade — ₹199/mo
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 py-3 border-t border-border-default">
        <a
          href="/api/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-accent-red hover:bg-accent-red/5 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Disconnect Account</span>
        </a>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setAccount, setUsage, setLoading } = useAuthStore();

  // Fetch account data on mount
  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = await res.json();
          setAccount(data.account);
          setUsage(data.usage);
        }
      } catch (e) {
        console.error("Failed to load account:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [setAccount, setUsage, setLoading]);

  return (
    <div className="h-screen flex bg-surface-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border-default bg-surface-50/50">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-surface-50 z-50 border-r border-border-default"
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border-default flex items-center px-6 gap-4 bg-surface-50/30 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 hover:bg-surface-200 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
