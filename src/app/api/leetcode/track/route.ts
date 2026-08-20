import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titleSlug, status = 'inprogress' } = body;

    if (!titleSlug) {
      return NextResponse.json({ error: 'titleSlug is required' }, { status: 400 });
    }

    const cleanSlug = titleSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Fetch problem details from GraphQL
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
        variables: { titleSlug: cleanSlug },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to communicate with LeetCode API' }, { status: 502 });
    }

    const data = await response.json();
    const q = data?.data?.question;

    if (!q) {
      return NextResponse.json({ error: `Problem ${cleanSlug} not found` }, { status: 404 });
    }

    const problemData = {
      title: q.title,
      titleSlug: q.titleSlug,
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
      difficulty: q.difficulty || 'Medium',
      tags: q.topicTags ? q.topicTags.map((t: { name: string }) => t.name) : [],
      status: status as 'todo' | 'inprogress' | 'done',
    };

    return NextResponse.json({
      success: true,
      problem: problemData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error tracking problem' }, { status: 500 });
  }
}
