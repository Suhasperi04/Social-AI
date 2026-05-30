// ============================================
// Database Types — matches Supabase schema
// ============================================

export interface InstagramAccount {
  id: string;
  instagram_id: string;
  username: string | null;
  full_name: string | null;
  profile_picture_url: string | null;
  biography: string | null;
  followers_count: number;
  following_count: number;
  media_count: number;
  account_type: "BUSINESS" | "CREATOR" | null;
  access_token: string;
  token_expires_at: string | null;
  plan: "free" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_used: boolean;
  created_at: string;
  last_login: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  instagram_id: string;
  reports_used: number;
  competitor_analyses_used: number;
  ideas_used: number;
  updated_at: string;
}

export interface Report {
  id: string;
  instagram_id: string;
  report_type: ReportType;
  data: Record<string, unknown>;
  created_at: string;
  expires_at: string;
}

export type ReportType =
  | "account_health"
  | "profile_analysis"
  | "growth_blockers"
  | "winning_content"
  | "content_ideas"
  | "best_time"
  | "growth_plan";

export interface Competitor {
  id: string;
  instagram_id: string;
  competitor_username: string;
  competitor_data: Record<string, unknown> | null;
  analyzed_at: string | null;
  created_at: string;
}

export interface RateLimit {
  id: string;
  identifier: string;
  endpoint: string;
  request_count: number;
  window_start: string;
}

// ============================================
// Plan Limits
// ============================================

export const PLAN_LIMITS = {
  free: {
    reports: 3,
    competitorAnalyses: 3,
    ideas: 10,
  },
  pro: {
    reports: Infinity,
    competitorAnalyses: Infinity,
    ideas: Infinity,
  },
} as const;

// ============================================
// AI Response Types
// ============================================

export interface AccountHealthData {
  overallScore: number;
  contentScore: number;
  engagementScore: number;
  consistencyScore: number;
  growthScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string;
}

export interface ProfileAnalysisData {
  username: RatingItem;
  bio: RatingItem;
  cta: RatingItem;
  positioning: RatingItem;
  profileStructure: RatingItem;
  overallRating: number;
  recommendations: Recommendation[];
}

export interface RatingItem {
  rating: number;
  feedback: string;
  status: "good" | "needs_improvement" | "bad";
}

export interface GrowthBlockerData {
  blockers: GrowthBlocker[];
  summary: string;
}

export interface GrowthBlocker {
  issue: string;
  impact: "high" | "medium" | "low";
  recommendation: string;
  priority: number;
  category: string;
}

export interface WinningContentData {
  winningFactors: string[];
  losingFactors: string[];
  bestThemes: ThemeAnalysis[];
  worstThemes: ThemeAnalysis[];
  bestFormats: FormatAnalysis[];
  timingPatterns: string;
}

export interface ThemeAnalysis {
  theme: string;
  avgEngagement: number;
  postCount: number;
}

export interface FormatAnalysis {
  format: string;
  avgEngagement: number;
  postCount: number;
}

export interface ContentIdeasData {
  reelIdeas: ContentIdea[];
  carouselIdeas: ContentIdea[];
  storyIdeas: ContentIdea[];
}

export interface ContentIdea {
  idea: string;
  whyItWorks: string;
  difficulty: "easy" | "medium" | "hard";
  growthPotential: "high" | "medium" | "low";
}

export interface BestTimeData {
  bestDay: string;
  bestTime: string;
  worstDay: string;
  worstTime: string;
  hourlyBreakdown: TimeSlot[];
  dailyBreakdown: DaySlot[];
}

export interface TimeSlot {
  hour: number;
  avgEngagement: number;
  postCount: number;
}

export interface DaySlot {
  day: string;
  avgEngagement: number;
  postCount: number;
}

export interface GrowthPlanData {
  weeks: WeekPlan[];
  summary: string;
}

export interface WeekPlan {
  weekNumber: number;
  focus: string;
  goals: string[];
  actions: ActionItem[];
}

export interface ActionItem {
  action: string;
  details: string;
  day?: string;
}

export interface CompetitorAnalysisData {
  comparison: {
    yourFollowers: number;
    competitorFollowers: number;
    yourEngagement: number;
    competitorEngagement: number;
    yourPostingFrequency: string;
    competitorPostingFrequency: string;
  };
  competitorStrengths: string[];
  opportunities: string[];
  gaps: string[];
  recommendations: Recommendation[];
}
