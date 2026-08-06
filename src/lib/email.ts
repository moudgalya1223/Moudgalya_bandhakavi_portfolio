import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'dattamoudgalyabandhakavi@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport(
  SMTP_HOST === 'smtp.gmail.com'
    ? {
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }
    : {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }
);

interface BookingEmailParams {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  goals: string;
  meetingDate: string;
}

interface ProposalEmailParams {
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  stack: string;
  budget: string;
  timeline: string;
}

// ─── SEND BOOKING EMAILS ──────────────────────────────────────────────────
export async function sendBookingEmails(params: BookingEmailParams) {
  const { name, email, projectType, budget, goals, meetingDate } = params;
  const developerEmail = SMTP_USER;

  if (!SMTP_PASS) {
    console.warn('⚠️ SMTP_PASS is missing in environment variables. Email sending skipped.');
    return { success: false, reason: 'SMTP_PASS_MISSING' };
  }

  // 1. Generate ICS Content for attachment
  const startDateObj = new Date(meetingDate.replace(' at ', ' '));
  const validDate = isNaN(startDateObj.getTime()) ? new Date() : startDateObj;
  const endDateObj = new Date(validDate.getTime() + 30 * 60000);
  const formatICSDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moudgalya Bandhakavi//Consultation Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:booking-${Date.now()}@moudgalya.store`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(validDate)}`,
    `DTEND:${formatICSDate(endDateObj)}`,
    `SUMMARY:Consultation Call: Moudgalya Bandhakavi & ${name}`,
    `DESCRIPTION:Client: ${name} (${email})\\nProject Type: ${projectType}\\nBudget: ${budget}\\nGoals: ${goals}`,
    `ORGANIZER;CN=Moudgalya Bandhakavi:mailto:${developerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${name}:mailto:${email}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Moudgalya:mailto:${developerEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Google Calendar URL
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Consultation Call: Moudgalya Bandhakavi & ${name}`)}&details=${encodeURIComponent(`Project Type: ${projectType}\nBudget: ${budget}\nGoals: ${goals}`)}&add=${developerEmail},${encodeURIComponent(email)}`;

  // 2. Email to Developer (Notification)
  const devMailOptions = {
    from: `"Portfolio Booking System" <${SMTP_USER}>`,
    to: developerEmail,
    subject: `🗓️ New Consultation Call Booked: ${name} (${projectType})`,
    text: `New Consultation Call Booked!\n\nClient Name: ${name}\nClient Email: ${email}\nMeeting Date/Time: ${meetingDate}\nProject Type: ${projectType}\nBudget: ${budget}\n\nGoals & Scope:\n${goals}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #7c3aed; margin-top: 0;">🗓️ New Consultation Call Booked</h2>
        <p>A new consultation discovery call has been scheduled on your portfolio website.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Client Name:</strong> ${name}</p>
        <p><strong>Client Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Requested Meeting Time:</strong> <span style="background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #3730a3;">${meetingDate}</span></p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Estimated Budget:</strong> ${budget}</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #7c3aed; margin: 20px 0;">
          <strong>Project Goals & Description:</strong><br />
          <p style="margin-top: 8px; white-space: pre-wrap;">${goals}</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `consultation-invite-${validDate.toISOString().split('T')[0]}.ics`,
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
      },
    ],
  };

  // 3. Email to Customer (Thank You & Calendar Invite)
  const customerMailOptions = {
    from: `"Moudgalya Bandhakavi" <${SMTP_USER}>`,
    to: email,
    subject: `✅ Consultation Call Confirmed with Moudgalya Bandhakavi`,
    text: `Hello ${name},\n\nThank you for booking a consultation call. I have received your request and look forward to speaking with you on ${meetingDate}.\n\nProject Type: ${projectType}\nBudget: ${budget}\n\nYou can add this event to your Google Calendar using the link below:\n${gcalUrl}\n\nBest regards,\nMoudgalya Bandhakavi\nSenior Full-Stack & AI Engineer\n${developerEmail}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #06b6d4; margin-top: 0;">✅ Consultation Call Confirmed</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for scheduling a discovery consultation! Your call request has been confirmed for:</p>
        
        <div style="background: #ecfeff; border: 1px solid #a5f3fc; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 1.2rem; font-weight: bold; color: #0891b2;">${meetingDate}</span>
        </div>

        <p><strong>Project Focus:</strong> ${projectType}<br /><strong>Budget:</strong> ${budget}</p>
        
        <p style="margin-top: 24px;">An <strong>.ics calendar invitation</strong> is attached to this email. You can also add this event directly to your calendar:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${gcalUrl}" target="_blank" style="background: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            📅 Add to Google Calendar
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.9rem; color: #666;">
          Best regards,<br />
          <strong>Moudgalya Bandhakavi</strong><br />
          Senior Full-Stack & AI Engineer<br />
          <a href="mailto:${developerEmail}">${developerEmail}</a>
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `consultation-invite-${validDate.toISOString().split('T')[0]}.ics`,
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
      },
    ],
  };

  try {
    await Promise.all([
      transporter.sendMail(devMailOptions),
      transporter.sendMail(customerMailOptions),
    ]);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending booking emails:', error);
    return { success: false, error: error.message };
  }
}

// ─── SEND PROPOSAL EMAILS ─────────────────────────────────────────────────
export async function sendProposalEmails(params: ProposalEmailParams) {
  const { clientName, clientEmail, title, description, stack, budget, timeline } = params;
  const developerEmail = SMTP_USER;

  if (!SMTP_PASS) {
    console.warn('⚠️ SMTP_PASS is missing in environment variables. Email sending skipped.');
    return { success: false, reason: 'SMTP_PASS_MISSING' };
  }

  // 1. Email to Developer
  const devMailOptions = {
    from: `"Portfolio Proposal System" <${SMTP_USER}>`,
    to: developerEmail,
    subject: `🚀 New Client Proposal: "${title}" from ${clientName || clientEmail}`,
    text: `New Client Proposal Received!\n\nClient Name: ${clientName || 'N/A'}\nClient Email: ${clientEmail}\nProject Title: ${title}\nStack: ${stack}\nBudget: ${budget}\nTimeline: ${timeline}\n\nRequirements:\n${description}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #06b6d4; margin-top: 0;">🚀 New Client Proposal Submitted</h2>
        <p>A new project proposal has been submitted through your Client Portal dashboard.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Project Title:</strong> ${title}</p>
        <p><strong>Client:</strong> ${clientName || 'N/A'} (<a href="mailto:${clientEmail}">${clientEmail}</a>)</p>
        <p><strong>Service / Stack:</strong> ${stack}</p>
        <p><strong>Estimated Budget:</strong> ${budget}</p>
        <p><strong>Target Timeline:</strong> ${timeline}</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0;">
          <strong>Project Description & Requirements:</strong><br />
          <p style="margin-top: 8px; white-space: pre-wrap;">${description}</p>
        </div>
      </div>
    `,
  };

  // 2. Email to Client (Confirmation)
  const clientMailOptions = {
    from: `"Moudgalya Bandhakavi" <${SMTP_USER}>`,
    to: clientEmail,
    subject: `📩 Proposal Received: "${title}" — Moudgalya Bandhakavi`,
    text: `Hello ${clientName || 'Partner'},\n\nThank you for submitting your project proposal for "${title}".\n\nI have received your requirements and will review the specifications shortly. You can check real-time status updates inside your Client Dashboard.\n\nBest regards,\nMoudgalya Bandhakavi\n${developerEmail}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #7c3aed; margin-top: 0;">📩 Project Proposal Received</h2>
        <p>Hello <strong>${clientName || 'Partner'}</strong>,</p>
        <p>Thank you for submitting your project proposal: <strong>&quot;${title}&quot;</strong>.</p>
        <p>I have received your specifications and estimated budget (<strong>${budget}</strong>). I am reviewing your scope and will follow up with you shortly.</p>
        <p>You can view live status updates for your request at any time inside your private Client Portal dashboard.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.9rem; color: #666;">
          Best regards,<br />
          <strong>Moudgalya Bandhakavi</strong><br />
          Senior Full-Stack & AI Engineer<br />
          <a href="mailto:${developerEmail}">${developerEmail}</a>
        </p>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(devMailOptions),
      transporter.sendMail(clientMailOptions),
    ]);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending proposal emails:', error);
    return { success: false, error: error.message };
  }
}
