import {
  IGProfile,
  IGMedia,
  IGMediaResponse,
  IGInsightsResponse,
} from "./types";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

// ============================================
// Instagram Graph API Wrapper (Facebook Login)
// ============================================

export class InstagramAPI {
  private token: string;
  private instagramId: string;

  constructor(accessToken: string, instagramId: string) {
    this.token = accessToken;
    this.instagramId = instagramId;
  }

  private async fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
    url.searchParams.set("access_token", this.token);
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Instagram API error: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    return response.json();
  }

  /**
   * Fetch the authenticated user's profile
   */
  async getProfile(): Promise<IGProfile> {
    return this.fetchAPI<IGProfile>(`/${this.instagramId}`, {
      fields: "id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count",
    });
  }

  /**
   * Fetch recent media posts (with automatic pagination)
   */
  async getMedia(limit: number = 50): Promise<IGMedia[]> {
    let allMedia: IGMedia[] = [];
    
    // Request up to the limit (or max 50 per page as per Meta guidelines)
    let response = await this.fetchAPI<IGMediaResponse>(`/${this.instagramId}/media`, {
      fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
      limit: Math.min(limit, 50).toString(),
    });

    if (response.data) {
      allMedia = [...response.data];
    }

    // Follow the pagination cursor until we hit our target limit
    while (allMedia.length < limit && response.paging?.next) {
      try {
        const nextRes = await fetch(response.paging.next);
        if (!nextRes.ok) break;
        
        response = await nextRes.json();
        if (response.data && response.data.length > 0) {
          allMedia = [...allMedia, ...response.data];
        } else {
          break;
        }
      } catch (e) {
        console.error("Pagination failed:", e);
        break;
      }
    }

    return allMedia.slice(0, limit);
  }

  /**
   * Fetch insights for a specific media post
   */
  async getMediaInsights(
    mediaId: string,
    mediaType: string
  ): Promise<Record<string, number>> {
    try {
      // Different metrics for different media types
      let metrics = "likes,comments,shares,saved,reach";
      if (mediaType === "VIDEO" || mediaType === "REEL") {
        metrics = "likes,comments,shares,saved,reach,views";
      }

      const response = await this.fetchAPI<IGInsightsResponse>(
        `/${mediaId}/insights`,
        { metric: metrics }
      );

      const insights: Record<string, number> = {};
      response.data?.forEach((metric) => {
        insights[metric.name] = metric.values?.[0]?.value || 0;
      });

      return insights;
    } catch {
      // Some media types don't support all metrics
      return {};
    }
  }

  /**
   * Fetch account-level insights
   */
  async getAccountInsights(
    period: "day" | "week" | "days_28" = "day",
    since?: string,
    until?: string
  ): Promise<Record<string, number[]>> {
    try {
      const params: Record<string, string> = {
        metric: "reach,impressions,follower_count,profile_views",
        period,
      };

      if (since) params.since = since;
      if (until) params.until = until;

      const response = await this.fetchAPI<IGInsightsResponse>(
        `/${this.instagramId}/insights`,
        params
      );

      const insights: Record<string, number[]> = {};
      response.data?.forEach((metric) => {
        insights[metric.name] = metric.values?.map((v) => v.value) || [];
      });

      return insights;
    } catch {
      return {};
    }
  }

  /**
   * Fetch all media with their insights (batched)
   */
  async getMediaWithInsights(
    limit: number = 30
  ): Promise<(IGMedia & { insights: Record<string, number> })[]> {
    const media = await this.getMedia(limit);

    const mediaWithInsights = await Promise.all(
      media.map(async (post) => {
        const insights = await this.getMediaInsights(
          post.id,
          post.media_type
        );
        return { ...post, insights };
      })
    );

    return mediaWithInsights;
  }
}

/**
 * Fetch public profile data for competitor analysis
 */
export async function fetchPublicProfile(
  username: string,
  accessToken: string,
  instagramId: string
): Promise<Partial<IGProfile> | null> {
  try {
    const url = new URL(`${GRAPH_API_BASE}/${instagramId}`);
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set(
      "fields",
      `business_discovery.username(${username}){username,name,biography,profile_picture_url,followers_count,follows_count,media_count,media{id,caption,media_type,timestamp,like_count,comments_count}}`
    );

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    return data.business_discovery || null;
  } catch {
    return null;
  }
}
