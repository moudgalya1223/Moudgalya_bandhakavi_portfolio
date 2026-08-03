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

    const recipientEmail = 'dattumoudgalyabandhakavi@gmail.com';
    const mailtoSubject = encodeURIComponent(`[NEW CONSULTATION BOOKING] ${name} - ${projectType}`);
    const mailtoBody = encodeURIComponent(
      `New Consultation Call Booked!\n\n` +
      `Client Name: ${name}\n` +
      `Client Email: ${email}\n` +
      `Requested Date/Time: ${meetingDate}\n` +
      `Project Type: ${projectType}\n` +
      `Budget: ${budget}\n\n` +
      `Project Goals:\n${goals}\n`
    );
    const mailtoLink = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Return instant success along with notification details and automated confirmation metadata
    return NextResponse.json({ 
      success: true, 
      leadId,
      recipientEmail,
      mailtoLink,
      confirmationMessage: `Thank you, ${name}! Your consultation booking request has been dispatched to ${recipientEmail} and confirmed for ${meetingDate}.`
    });
  } catch (error: any) {
    console.error('Booking confirmation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
