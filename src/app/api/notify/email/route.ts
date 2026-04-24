import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function POST(req: NextRequest) {
  try {
    const { to, userName, systemName, date, startSlot, endSlot, bookingId } = await req.json();

    await transporter.sendMail({
      from: `"Niyusuki Sim Racers" <${process.env.SMTP_USER}>`,
      to,
      subject: '🎮 Booking Confirmed — Niyusuki Sim Racers',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="background:#050505;color:#fff;font-family:sans-serif;padding:40px;">
          <h1 style="color:#E50914;font-size:32px;margin:0;">NIYUSUKI.</h1>
          <p style="color:#999;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Premium Gaming Center</p>
          <hr style="border-color:#1f1f1f;margin:24px 0;" />
          <h2 style="color:#fff;">Your booking is confirmed!</h2>
          <p style="color:#aaa;">Hey <strong style="color:#fff;">${userName}</strong>, you're all set for an elite gaming session.</p>
          <div style="background:#111;border:1px solid #1f1f1f;padding:24px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Booking ID</td><td style="color:#E50914;font-weight:bold;">#${bookingId.slice(0,8).toUpperCase()}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;">System</td><td style="color:#fff;">${systemName}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Date</td><td style="color:#fff;">${date}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Time</td><td style="color:#fff;">${startSlot} – ${endSlot}</td></tr>
            </table>
          </div>
          <p style="color:#666;font-size:12px;">Please arrive 5 minutes early. Your session starts when the admin clicks START.</p>
          <hr style="border-color:#1f1f1f;margin:24px 0;" />
          <p style="color:#333;font-size:11px;">© ${new Date().getFullYear()} Niyusuki Sim Racers. All rights reserved.</p>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
