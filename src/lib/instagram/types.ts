// ============================================
// Instagram Graph API Types
// ============================================

export interface IGProfile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  account_type: "BUSINESS" | "CREATOR";
  website?: string;
}

export interface IGMedia {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
}

export interface IGMediaInsight {
  name: string;
  period: string;
  values: { value: number }[];
  title: string;
}

export interface IGAccountInsight {
  name: string;
  period: string;
  values: { value: number; end_time: string }[];
  title: string;
}

export interface IGMediaResponse {
  data: IGMedia[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

export interface IGInsightsResponse {
  data: IGMediaInsight[];
}
