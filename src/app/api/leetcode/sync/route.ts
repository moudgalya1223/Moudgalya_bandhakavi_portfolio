import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, limit = 20 } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'LeetCode username is required' }, { status: 400 });
    }

    const query = `
      query recentSubmissions($username: String!, $limit: Int!) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          statusDisplay
          lang
          timestamp
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query,
        variables: { username, limit: Number(limit) },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to query LeetCode GraphQL API' }, { status: 502 });
    }

    const data = await response.json();
    const submissions = data?.data?.recentSubmissionList || [];

    // Filter submissions into unique problem entries with their best status
    const problemMap: Record<string, {
      title: string;
      titleSlug: string;
      isAccepted: boolean;
      lang: string;
      timestamp: number;
    }> = {};

    for (const sub of submissions) {
      const slug = sub.titleSlug;
      const isAcc = sub.statusDisplay === 'Accepted';
      const ts = Number(sub.timestamp) * 1000;

      if (!problemMap[slug]) {
        problemMap[slug] = {
          title: sub.title,
          titleSlug: slug,
          isAccepted: isAcc,
          lang: sub.lang,
          timestamp: ts,
        };
      } else {
        // If we already saw an entry, prioritize Accepted over non-Accepted
        if (isAcc && !problemMap[slug].isAccepted) {
          problemMap[slug].isAccepted = true;
          problemMap[slug].lang = sub.lang;
          problemMap[slug].timestamp = ts;
        }
      }
    }

    return NextResponse.json({
      success: true,
      username,
      totalSubmissionsFetched: submissions.length,
      syncedProblems: Object.values(problemMap),
      lastSynced: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync error' }, { status: 500 });
  }
}
