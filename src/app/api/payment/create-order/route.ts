import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, bookingMeta } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: bookingMeta,
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
