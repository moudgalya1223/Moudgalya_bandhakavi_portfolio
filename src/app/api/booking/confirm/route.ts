import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, projectType, budget, goals, meetingDate } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required fields.' }, { status: 400 });
    }

    const leadId = 'lead-' + Date.now();

    // 1. Non-blocking background Firestore attempt with 1.5s timeout race
    const saveToFirestore = async () => {
      try {
        await Promise.race([
          addDoc(collection(db, 'leads'), {
            name,
            email,
            projectType,
            budget,
            goals,
            stage: meetingDate ? 'call' : 'inquiry',
            meetingDate: meetingDate || null,
            createdAt: serverTimestamp(),
            notes: `Meeting date requested: ${meetingDate || 'None'}. Budget: ${budget}. Goals: ${goals}`,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500)),
        ]);
      } catch (e) {
        console.log('Async Firestore booking notification handled silently:', e);
      }
    };

    saveToFirestore();

    // Return instant success so UI modal updates immediately
    return NextResponse.json({ success: true, leadId });
  } catch (error: any) {
    console.error('Booking confirmation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
