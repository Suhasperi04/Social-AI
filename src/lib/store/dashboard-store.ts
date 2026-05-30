import { create } from "zustand";
import {
  AccountHealthData,
  ProfileAnalysisData,
  GrowthBlockerData,
  WinningContentData,
  ContentIdeasData,
  BestTimeData,
  GrowthPlanData,
} from "@/types";

interface DashboardState {
  accountHealth: AccountHealthData | null;
  profileAnalysis: ProfileAnalysisData | null;
  growthBlockers: GrowthBlockerData | null;
  winningContent: WinningContentData | null;
  contentIdeas: ContentIdeasData | null;
  bestTime: BestTimeData | null;
  growthPlan: GrowthPlanData | null;
  activeReport: string | null;
  isGenerating: boolean;

  setAccountHealth: (data: AccountHealthData | null) => void;
  setProfileAnalysis: (data: ProfileAnalysisData | null) => void;
  setGrowthBlockers: (data: GrowthBlockerData | null) => void;
  setWinningContent: (data: WinningContentData | null) => void;
  setContentIdeas: (data: ContentIdeasData | null) => void;
  setBestTime: (data: BestTimeData | null) => void;
  setGrowthPlan: (data: GrowthPlanData | null) => void;
  setActiveReport: (report: string | null) => void;
  setGenerating: (generating: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  accountHealth: null,
  profileAnalysis: null,
  growthBlockers: null,
  winningContent: null,
  contentIdeas: null,
  bestTime: null,
  growthPlan: null,
  activeReport: null,
  isGenerating: false,

  setAccountHealth: (accountHealth) => set({ accountHealth }),
  setProfileAnalysis: (profileAnalysis) => set({ profileAnalysis }),
  setGrowthBlockers: (growthBlockers) => set({ growthBlockers }),
  setWinningContent: (winningContent) => set({ winningContent }),
  setContentIdeas: (contentIdeas) => set({ contentIdeas }),
  setBestTime: (bestTime) => set({ bestTime }),
  setGrowthPlan: (growthPlan) => set({ growthPlan }),
  setActiveReport: (activeReport) => set({ activeReport }),
  setGenerating: (isGenerating) => set({ isGenerating }),
}));
