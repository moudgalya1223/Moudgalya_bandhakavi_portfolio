import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    if (!input) {
      return NextResponse.json({ error: 'Input (URL or slug) is required' }, { status: 400 });
    }

    // Extract titleSlug from URL if full URL is passed
    let titleSlug = input.trim();
    if (titleSlug.includes('leetcode.com/problems/')) {
      const parts = titleSlug.split('leetcode.com/problems/')[1].split('/')[0];
      if (parts) titleSlug = parts;
    }
    titleSlug = titleSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
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
        variables: { titleSlug },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to communicate with LeetCode API' }, { status: 502 });
    }

    const data = await response.json();
    const q = data?.data?.question;

    if (!q) {
      return NextResponse.json({ error: `Problem "${titleSlug}" not found on LeetCode` }, { status: 404 });
    }

    return NextResponse.json({
      title: q.title,
      titleSlug: q.titleSlug,
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
      difficulty: q.difficulty || 'Medium',
      tags: q.topicTags ? q.topicTags.map((t: { name: string }) => t.name) : [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
