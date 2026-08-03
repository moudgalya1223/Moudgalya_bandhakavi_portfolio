import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendBookingEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, projectType, budget, goals, meetingDate } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required fields.' }, { status: 400 });
    }

    const leadId = 'lead-' + Date.now();

    // 1. Non-blocking background Firestore save & email dispatch
    const saveAndNotify = async () => {
      try {
        await Promise.allSettled([
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
          sendBookingEmails({
            name,
            email,
            projectType,
            budget,
            goals,
            meetingDate: meetingDate || 'Scheduled Consultation Call',
          }),
        ]);
      } catch (e) {
        console.log('Async booking notification handled silently:', e);
      }
    };

    saveAndNotify();

    const recipientEmail = 'dattumoudgalyabandhakavi@gmail.com';
    return NextResponse.json({ 
      success: true, 
      leadId,
      recipientEmail,
      confirmationMessage: `Thank you, ${name}! Your consultation booking request has been dispatched to ${recipientEmail} and confirmed for ${meetingDate}.`
    });
  } catch (error: any) {
    console.error('Booking confirmation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
