import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createBookingAtomically } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = await req.json();

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Create booking atomically in Firestore
    const bookingId = await createBookingAtomically({
      ...bookingData,
      paymentId: razorpay_payment_id,
      status: 'confirmed',
    });

    return NextResponse.json({ success: true, bookingId });
  } catch (err: any) {
    if (err.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'This slot was just taken. Please choose another.' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
