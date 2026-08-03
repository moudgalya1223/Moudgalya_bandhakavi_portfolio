import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, title, description, stack, budget, timeline } = body;

    if (!title || !clientEmail) {
      return NextResponse.json({ error: 'Title and email are required fields.' }, { status: 400 });
    }

    const proposalId = 'prop-' + Date.now();

    // 1. Non-blocking background Firestore attempt with 1.5s timeout race
    const saveToFirestore = async () => {
      try {
        await Promise.race([
          addDoc(collection(db, 'leads'), {
            name: clientName || clientEmail,
            email: clientEmail,
            projectType: stack || 'Full-Stack Development',
            budget: budget || 'Project-based USD ($)',
            goals: `[PROPOSAL SUBMISSION] Title: ${title}. Description: ${description}. Timeline: ${timeline}`,
            stage: 'proposal',
            createdAt: serverTimestamp(),
            notes: `Submitted from Client Portal by ${clientEmail}`,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500)),
        ]);
      } catch (e) {
        console.log('Async Firestore proposal notification handled silently:', e);
      }
    };

    saveToFirestore();

    const mailtoSubject = encodeURIComponent(`[NEW CLIENT PROPOSAL] ${title} from ${clientName || clientEmail}`);
    const mailtoBody = encodeURIComponent(
      `New Project Proposal Received!\n\n` +
      `Client Name: ${clientName || 'N/A'}\n` +
      `Client Email: ${clientEmail}\n` +
      `Project Title: ${title}\n` +
      `Estimated Budget: ${budget || 'Project-based USD'}\n` +
      `Target Timeline: ${timeline || 'Flexible'}\n` +
      `Preferred Stack: ${stack || 'Full-Stack'}\n\n` +
      `Project Details & Requirements:\n${description}\n`
    );
    const mailtoLink = `mailto:dattu99rockstar@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({ 
      success: true, 
      proposalId, 
      recipient: 'dattu99rockstar@gmail.com',
      mailtoLink 
    });
  } catch (error: any) {
    console.error('Proposal API submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
