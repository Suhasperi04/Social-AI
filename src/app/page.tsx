"use client";

import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Users,
  Lightbulb,
  Clock,
  Target,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  Star,
  Check,
  ChevronDown,
  Instagram,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ============================================
// Animation Variants
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// ============================================
// Hero Section
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background — contained to prevent overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-brand-600/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-accent-cyan/15 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-accent-pink/10 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite_4s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-6 sm:mb-8">
            <div className="glass inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400" />
              <span className="text-text-secondary">AI-Powered Instagram Analytics</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6"
          >
            Know Exactly Why{" "}
            <span className="gradient-text">You&apos;re Not Growing</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            Connect your Instagram account and receive AI-powered growth insights,
            competitor analysis, and a personalized strategy to accelerate your growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link
              href="/api/auth/connect"
              id="hero-cta"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-white gradient-bg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
            >
              <Instagram className="w-5 h-5" />
              Analyze My Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-text-secondary border border-border-default hover:border-border-hover hover:text-text-primary transition-all duration-300"
            >
              See Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "8+", label: "Analysis Tools" },
              { value: "AI", label: "Powered Insights" },
              { value: "Free", label: "To Start" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — hidden on very small screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-border-default flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// Features Section
// ============================================
const features = [
  {
    icon: Activity,
    title: "Account Health Score",
    description: "Get an overall 0-100 score with content, engagement, consistency, and growth breakdowns.",
    color: "text-brand-400",
    bgColor: "bg-brand-400/10",
  },
  {
    icon: Shield,
    title: "Profile Analysis",
    description: "Detailed review of your username, bio, CTA, and positioning with actionable fixes.",
    color: "text-accent-cyan",
    bgColor: "bg-accent-cyan/10",
  },
  {
    icon: Target,
    title: "Growth Blockers",
    description: "Discover the exact reasons your account isn't growing with priority-ranked solutions.",
    color: "text-accent-pink",
    bgColor: "bg-accent-pink/10",
  },
  {
    icon: TrendingUp,
    title: "Winning Content",
    description: "Find which topics, formats, and timing patterns drive your best performance.",
    color: "text-accent-emerald",
    bgColor: "bg-accent-emerald/10",
  },
  {
    icon: Users,
    title: "Competitor Insights",
    description: "Side-by-side analysis showing what competitors do better and opportunities you're missing.",
    color: "text-accent-amber",
    bgColor: "bg-accent-amber/10",
  },
  {
    icon: Lightbulb,
    title: "Content Ideas",
    description: "AI-generated reel, carousel, and story ideas tailored to your niche and audience.",
    color: "text-brand-300",
    bgColor: "bg-brand-300/10",
  },
  {
    icon: Clock,
    title: "Best Time to Post",
    description: "Data-driven analysis of your best and worst posting times with visual heatmaps.",
    color: "text-accent-cyan",
    bgColor: "bg-accent-cyan/10",
  },
  {
    icon: BarChart3,
    title: "30-Day Growth Plan",
    description: "Personalized weekly plan with specific goals, actions, and focus areas.",
    color: "text-accent-pink",
    bgColor: "bg-accent-pink/10",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-text-secondary">Powerful Features</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Grow</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            8 AI-powered tools that analyze every aspect of your Instagram presence and give you a clear growth roadmap.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              className="group glass rounded-2xl p-6 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// How It Works
// ============================================
const steps = [
  {
    step: "01",
    title: "Connect Your Account",
    description: "Link your Instagram Business or Creator account securely through Meta OAuth. We never store your password.",
    icon: Instagram,
  },
  {
    step: "02",
    title: "AI Analyzes Everything",
    description: "Our AI examines your posts, engagement, timing, profile, and competitors to find growth opportunities.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Get Your Growth Plan",
    description: "Receive actionable insights, specific recommendations, and a personalized 30-day growth strategy.",
    icon: TrendingUp,
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent" />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Steps to <span className="gradient-text">Growth</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-secondary text-lg">
            From connection to actionable insights in under 2 minutes.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-500/30 to-transparent" />
              )}
              <div className="w-24 h-24 rounded-2xl gradient-bg mx-auto mb-6 flex items-center justify-center">
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-brand-400 font-mono text-sm mb-2">
                Step {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Pricing Section
// ============================================
function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-secondary text-lg">
            Start free. Upgrade when you need unlimited insights.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Free Plan */}
          <motion.div variants={scaleIn} className="glass rounded-2xl p-5 sm:p-8">
            <div className="text-text-muted text-sm font-medium mb-2">
              STARTER
            </div>
            <div className="text-4xl font-bold mb-1">Free</div>
            <div className="text-text-muted text-sm mb-6">
              Perfect for trying out
            </div>
            <hr className="border-border-default mb-6" />
            <ul className="space-y-3 mb-8">
              {[
                "1 Instagram Account",
                "3 Full AI Reports",
                "3 Competitor Analyses",
                "10 Content Idea Requests",
                "Account Health Score",
                "Profile Analysis",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/api/auth/connect"
              id="pricing-free-cta"
              className="block w-full py-3 rounded-xl border border-border-default text-center font-semibold hover:border-brand-500/50 hover:text-brand-400 transition-all duration-300"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            variants={scaleIn}
            className="relative glass rounded-2xl p-5 sm:p-8 border-brand-500/30"
          >
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-semibold gradient-bg text-white">
              POPULAR
            </div>
            <div className="text-brand-400 text-sm font-medium mb-2">PRO</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">₹199</span>
              <span className="text-text-muted">/month</span>
            </div>
            <div className="text-text-muted text-sm mb-6">
              For serious creators
            </div>
            <hr className="border-border-default mb-6" />
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Unlimited AI Reports",
                "Unlimited Competitor Analysis",
                "Unlimited Content Ideas",
                "Full 30-Day Growth Plan",
                "Advanced Insights",
                "Priority AI Processing",
                "Best Time to Post Analysis",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              id="pricing-pro-cta"
              className="block w-full py-3 rounded-xl font-semibold text-white gradient-bg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300"
            >
              Upgrade to Pro
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Testimonials Section
// ============================================
const testimonials = [
  {
    name: "Priya Sharma",
    handle: "@priya.creates",
    text: "GrowMyAccount showed me exactly why my reels weren't getting views. The growth blockers report was eye-opening — I fixed 3 issues and doubled my reach in 2 weeks.",
    avatar: "PS",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    handle: "@arjun.fitness",
    text: "The competitor analysis is incredible. I could see exactly what my competitors were doing better and adapted my strategy. 40% more followers in a month.",
    avatar: "AM",
    rating: 5,
  },
  {
    name: "Neha Gupta",
    handle: "@neha.stylefiles",
    text: "I was posting at all the wrong times! The best time to post analysis alone was worth it. My engagement rate went from 1.2% to 4.8%.",
    avatar: "NG",
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent" />
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Creators</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={scaleIn}
              className="glass rounded-2xl p-6 hover:border-brand-500/20 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent-amber text-accent-amber"
                  />
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-text-muted text-xs">{t.handle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FAQ Section
// ============================================
const faqs = [
  {
    q: "Does GrowMyAccount work with personal Instagram accounts?",
    a: "No, GrowMyAccount requires an Instagram Business or Creator account. You can switch your account type for free in Instagram settings. This is required by Instagram's API to access analytics data.",
  },
  {
    q: "Is my Instagram account safe?",
    a: "Absolutely. We use Meta's official OAuth to connect, never store your password, and only request read-only permissions. We cannot post, delete, or modify anything on your account.",
  },
  {
    q: "How is this different from Instagram's built-in analytics?",
    a: "Instagram shows you basic numbers. GrowMyAccount uses AI to tell you WHY those numbers are what they are, what's blocking your growth, and exactly what to do about it.",
  },
  {
    q: "Does GrowMyAccount generate content for me?",
    a: "No. GrowMyAccount is an analytics and strategy tool. We generate insights, ideas, and recommendations — not actual posts, reels, or captions.",
  },
  {
    q: "What happens after my free trial?",
    a: "Your account stays connected and you keep access to previously generated reports. To generate new reports, you can upgrade to Pro at ₹199/month.",
  },
  {
    q: "Can I analyze my competitors?",
    a: "Yes! You can analyze up to 3 competitors on the free plan and unlimited on Pro. The competitor must also have a Business or Creator account.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-200/50 transition-colors"
              >
                <span className="font-medium text-sm md:text-base pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-text-secondary text-sm leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Footer
// ============================================
function Footer() {
  return (
    <footer className="border-t border-border-default py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">GrowMyAccount AI</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-text-muted">
            <a href="/#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="/#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
            <a href="mailto:support@growmyaccount.ai" className="hover:text-text-primary transition-colors">Support</a>
          </div>

          <div className="text-sm text-text-muted">
            © {new Date().getFullYear()} GrowMyAccount AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// CTA Banner
// ============================================
function CTABanner() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={scaleIn}
        className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-bg p-6 sm:p-12 text-center"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to Grow?
          </h2>
          <p className="text-white/80 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Join thousands of creators who discovered their growth blockers and turned their accounts around.
          </p>
          <Link
            href="/api/auth/connect"
            id="cta-bottom"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white text-surface-0 hover:bg-white/90 transition-all duration-300 hover:scale-105"
          >
            <Instagram className="w-5 h-5" />
            Analyze My Account Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// Landing Page
// ============================================
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold">GrowMyAccount AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
          </div>

          <Link
            href="/api/auth/connect"
            id="nav-cta"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm gradient-bg text-white hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            Connect
          </Link>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTABanner />
      <FAQSection />
      <Footer />
    </main>
  );
}
