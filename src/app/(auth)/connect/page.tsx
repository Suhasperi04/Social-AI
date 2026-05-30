"use client";

import { motion } from "framer-motion";
import { Instagram, Activity, Shield, Eye, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-surface-0 flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-56 sm:w-80 h-56 sm:h-80 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">GrowMyAccount AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Connect Your Instagram</h1>
            <p className="text-text-secondary text-sm">
              Link your Business or Creator account to get AI-powered growth insights.
            </p>
          </div>

          {/* Connect Button */}
          <a
            href="/api/auth/connect"
            id="connect-instagram-btn"
            className="group w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white gradient-bg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300"
          >
            <Instagram className="w-5 h-5" />
            Connect with Instagram
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Legal Consent (Clickwrap) */}
          <p className="text-[11px] text-text-muted mt-4 text-center px-2 leading-relaxed">
            By connecting your Instagram, you agree to our <Link href="/terms" className="underline hover:text-text-primary transition-colors">Terms of Service</Link> and acknowledge that AI insights are for informational purposes only.
          </p>

          {/* Security badges */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Shield className="w-4 h-4 text-accent-emerald flex-shrink-0" />
              <span>We never store your Instagram password</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Eye className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              <span>Read-only access — we can&apos;t post or modify anything</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Activity className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Requires Business or Creator account</span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
