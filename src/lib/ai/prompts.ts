import { IGMedia, IGProfile } from "@/lib/instagram/types";

// ============================================
// AI Prompt Builders
// ============================================

export function buildAccountHealthPrompt(
  profile: IGProfile,
  media: (IGMedia & { insights: Record<string, number> })[]
): string {
  return `Analyze this Instagram account's overall health and provide scores.

ACCOUNT DATA:
- Username: @${profile.username}
- Followers: ${profile.followers_count}
- Following: ${profile.follows_count}
- Total Posts: ${profile.media_count}
- Account Type: ${profile.account_type}
- Bio: ${profile.biography || "No bio"}

RECENT POSTS (last ${media.length}):
${media
  .map(
    (m, i) =>
      `Post ${i + 1}: Type=${m.media_type}, Likes=${m.like_count}, Comments=${m.comments_count}, Date=${m.timestamp}, Caption="${(m.caption || "").substring(0, 100)}"`
  )
  .join("\n")}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "overallScore": <0-100>,
  "contentScore": <0-100>,
  "engagementScore": <0-100>,
  "consistencyScore": <0-100>,
  "growthScore": <0-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": [
    {"title": "...", "description": "...", "priority": "high|medium|low", "impact": "..."}
  ]
}

Score Guidelines:
- Content Score: Quality, variety, and relevance of posts
- Engagement Score: Like/comment ratio relative to follower count (2-3% good, 5%+ excellent for < 10k followers)
- Consistency Score: Posting frequency and regularity
- Growth Score: Follower growth potential based on current strategy
- Overall: Weighted average of all scores`;
}

export function buildProfileAnalysisPrompt(profile: IGProfile): string {
  return `Analyze this Instagram profile's optimization.

PROFILE DATA:
- Username: @${profile.username}
- Name: ${profile.name || "Not set"}
- Bio: ${profile.biography || "No bio"}
- Account Type: ${profile.account_type}
- Followers: ${profile.followers_count}
- Following: ${profile.follows_count}
- Posts: ${profile.media_count}
- Website: ${(profile as unknown as Record<string, unknown>).website || "Not set"}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "username": {"rating": <1-10>, "feedback": "...", "status": "good|needs_improvement|bad"},
  "bio": {"rating": <1-10>, "feedback": "...", "status": "good|needs_improvement|bad"},
  "cta": {"rating": <1-10>, "feedback": "...", "status": "good|needs_improvement|bad"},
  "positioning": {"rating": <1-10>, "feedback": "...", "status": "good|needs_improvement|bad"},
  "profileStructure": {"rating": <1-10>, "feedback": "...", "status": "good|needs_improvement|bad"},
  "overallRating": <1-10>,
  "recommendations": [
    {"title": "...", "description": "...", "priority": "high|medium|low", "impact": "..."}
  ]
}

Evaluate: Is the username searchable? Is the bio clear about what they do? Does it have a CTA? Is the niche positioning clear?`;
}

export function buildGrowthBlockersPrompt(
  profile: IGProfile,
  media: (IGMedia & { insights: Record<string, number> })[]
): string {
  const avgLikes =
    media.reduce((sum, m) => sum + m.like_count, 0) / (media.length || 1);
  const avgComments =
    media.reduce((sum, m) => sum + m.comments_count, 0) / (media.length || 1);
  const engRate =
    profile.followers_count > 0
      ? (((avgLikes + avgComments) / profile.followers_count) * 100).toFixed(2)
      : "0";

  // Calculate posting frequency
  const sortedMedia = [...media].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const daysBetween =
    sortedMedia.length >= 2
      ? (new Date(sortedMedia[0].timestamp).getTime() -
          new Date(sortedMedia[sortedMedia.length - 1].timestamp).getTime()) /
        (1000 * 60 * 60 * 24)
      : 30;
  const postsPerWeek =
    daysBetween > 0 ? ((media.length / daysBetween) * 7).toFixed(1) : "0";

  // Content mix
  const contentTypes = media.reduce(
    (acc, m) => {
      acc[m.media_type] = (acc[m.media_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return `Identify the biggest growth blockers for this Instagram account.

ACCOUNT METRICS:
- Username: @${profile.username}
- Followers: ${profile.followers_count}
- Engagement Rate: ${engRate}%
- Avg Likes: ${avgLikes.toFixed(0)}
- Avg Comments: ${avgComments.toFixed(0)}
- Posts Per Week: ${postsPerWeek}
- Content Mix: ${JSON.stringify(contentTypes)}
- Bio: ${profile.biography || "No bio"}

RECENT POSTS DATA:
${media
  .slice(0, 20)
  .map(
    (m) =>
      `Type=${m.media_type}, Likes=${m.like_count}, Comments=${m.comments_count}, Caption="${(m.caption || "").substring(0, 80)}"`
  )
  .join("\n")}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "blockers": [
    {
      "issue": "Clear description of the blocker",
      "impact": "high|medium|low",
      "recommendation": "Specific actionable fix",
      "priority": <1-10 where 10 is most critical>,
      "category": "content|engagement|consistency|strategy|profile"
    }
  ],
  "summary": "Brief overview of the main growth issues"
}

Find at least 5 blockers. Be specific — don't give generic advice.`;
}

export function buildWinningContentPrompt(
  media: (IGMedia & { insights: Record<string, number> })[]
): string {
  const sorted = [...media].sort(
    (a, b) => b.like_count + b.comments_count - (a.like_count + a.comments_count)
  );

  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5);

  return `Analyze what content performs best and worst for this Instagram account.

TOP 5 POSTS (Best performing):
${top5
  .map(
    (m, i) =>
      `${i + 1}. Type=${m.media_type}, Likes=${m.like_count}, Comments=${m.comments_count}, Time=${m.timestamp}, Caption="${(m.caption || "").substring(0, 150)}"`
  )
  .join("\n")}

BOTTOM 5 POSTS (Worst performing):
${bottom5
  .map(
    (m, i) =>
      `${i + 1}. Type=${m.media_type}, Likes=${m.like_count}, Comments=${m.comments_count}, Time=${m.timestamp}, Caption="${(m.caption || "").substring(0, 150)}"`
  )
  .join("\n")}

ALL POSTS SUMMARY (${media.length} total):
${JSON.stringify(
  media.reduce(
    (acc, m) => {
      acc[m.media_type] = (acc[m.media_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  )
)}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "winningFactors": ["factor1", "factor2", ...],
  "losingFactors": ["factor1", "factor2", ...],
  "bestThemes": [{"theme": "...", "avgEngagement": <number>, "postCount": <number>}],
  "worstThemes": [{"theme": "...", "avgEngagement": <number>, "postCount": <number>}],
  "bestFormats": [{"format": "...", "avgEngagement": <number>, "postCount": <number>}],
  "timingPatterns": "Analysis of when best content was posted"
}`;
}

export function buildContentIdeasPrompt(
  profile: IGProfile,
  media: IGMedia[]
): string {
  const topics = media
    .map((m) => m.caption || "")
    .filter(Boolean)
    .slice(0, 10);

  return `Generate content ideas for this Instagram account.

ACCOUNT:
- Username: @${profile.username}
- Bio: ${profile.biography || "No bio"}
- Followers: ${profile.followers_count}
- Account Type: ${profile.account_type}

RECENT CONTENT TOPICS:
${topics.map((t) => `- "${t.substring(0, 100)}"`).join("\n")}

IMPORTANT: Generate IDEAS only, NOT actual content. Each idea should be a concept/topic they should create content about.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "reelIdeas": [
    {"idea": "...", "whyItWorks": "...", "difficulty": "easy|medium|hard", "growthPotential": "high|medium|low"}
  ],
  "carouselIdeas": [
    {"idea": "...", "whyItWorks": "...", "difficulty": "easy|medium|hard", "growthPotential": "high|medium|low"}
  ],
  "storyIdeas": [
    {"idea": "...", "whyItWorks": "...", "difficulty": "easy|medium|hard", "growthPotential": "high|medium|low"}
  ]
}

Generate 5 ideas per category. Make them specific to this creator's niche and audience.`;
}

export function buildBestTimePrompt(
  media: (IGMedia & { insights: Record<string, number> })[]
): string {
  const timeData = media.map((m) => {
    const date = new Date(m.timestamp);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      hour: date.getHours(),
      engagement: m.like_count + m.comments_count,
    };
  });

  return `Analyze the best and worst times to post for this Instagram account based on historical performance.

POSTING HISTORY WITH ENGAGEMENT:
${timeData
  .map(
    (t) => `Day=${t.day}, Hour=${t.hour}:00, Engagement=${t.engagement}`
  )
  .join("\n")}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "bestDay": "Monday|Tuesday|...",
  "bestTime": "HH:MM format",
  "worstDay": "Monday|Tuesday|...",
  "worstTime": "HH:MM format",
  "hourlyBreakdown": [
    {"hour": <0-23>, "avgEngagement": <number>, "postCount": <number>}
  ],
  "dailyBreakdown": [
    {"day": "Monday|Tuesday|...", "avgEngagement": <number>, "postCount": <number>}
  ]
}

Provide all 24 hours and 7 days in the breakdowns.`;
}

export function buildGrowthPlanPrompt(
  profile: IGProfile,
  media: (IGMedia & { insights: Record<string, number> })[],
  blockers?: string
): string {
  const avgEng =
    media.reduce((s, m) => s + m.like_count + m.comments_count, 0) /
    (media.length || 1);

  return `Create a 30-day personalized growth plan for this Instagram account.

ACCOUNT:
- Username: @${profile.username}
- Bio: ${profile.biography || "No bio"}
- Followers: ${profile.followers_count}
- Avg Engagement per Post: ${avgEng.toFixed(0)}
- Total Posts: ${profile.media_count}
- Account Type: ${profile.account_type}

${blockers ? `KNOWN GROWTH BLOCKERS:\n${blockers}` : ""}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "Main focus area for this week",
      "goals": ["goal1", "goal2", ...],
      "actions": [
        {"action": "...", "details": "...", "day": "Mon-Sun or Daily"}
      ]
    }
  ],
  "summary": "Brief overview of the 30-day plan strategy"
}

Create 4 weeks. Each week should build on the previous. Be specific with actions — no generic advice.`;
}

export function buildCompetitorAnalysisPrompt(
  userProfile: IGProfile,
  competitorData: Record<string, unknown>
): string {
  return `Compare this Instagram account with their competitor.

YOUR ACCOUNT:
- Username: @${userProfile.username}
- Followers: ${userProfile.followers_count}
- Following: ${userProfile.follows_count}
- Posts: ${userProfile.media_count}
- Bio: ${userProfile.biography || "No bio"}

COMPETITOR ACCOUNT:
${JSON.stringify(competitorData, null, 2)}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "comparison": {
    "yourFollowers": ${userProfile.followers_count},
    "competitorFollowers": <number>,
    "yourEngagement": <estimated %>,
    "competitorEngagement": <estimated %>,
    "yourPostingFrequency": "X posts/week",
    "competitorPostingFrequency": "X posts/week"
  },
  "competitorStrengths": ["strength1", "strength2", ...],
  "opportunities": ["things you can learn/adopt", ...],
  "gaps": ["areas where competitor is weak that you can exploit", ...],
  "recommendations": [
    {"title": "...", "description": "...", "priority": "high|medium|low", "impact": "..."}
  ]
}`;
}
