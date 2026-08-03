import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendProposalEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, title, description, stack, budget, timeline } = body;

    if (!title || !clientEmail) {
      return NextResponse.json({ error: 'Title and email are required fields.' }, { status: 400 });
    }

    const proposalId = 'prop-' + Date.now();

    // 1. Non-blocking background Firestore save & email dispatch
    const saveAndNotify = async () => {
      try {
        await Promise.allSettled([
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
          sendProposalEmails({
            clientName: clientName || clientEmail,
            clientEmail,
            title,
            description,
            stack,
            budget,
            timeline,
          }),
        ]);
      } catch (e) {
        console.log('Async proposal notification handled silently:', e);
      }
    };

    saveAndNotify();

    const recipientEmail = 'dattumoudgalyabandhakavi@gmail.com';
    return NextResponse.json({ 
      success: true, 
      proposalId, 
      recipient: recipientEmail 
    });
  } catch (error: any) {
    console.error('Proposal API submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
