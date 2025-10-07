import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, screenshot_url, transaction_id } = body;

    // Validate booking_id
    if (!booking_id) {
      return NextResponse.json({
        error: 'Booking ID is required',
        code: 'MISSING_BOOKING_ID'
      }, { status: 400 });
    }

    const bookingIdInt = parseInt(booking_id);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json({
        error: 'Booking ID must be a valid integer',
        code: 'INVALID_BOOKING_ID'
      }, { status: 400 });
    }

    // Validate screenshot_url
    if (!screenshot_url || typeof screenshot_url !== 'string' || screenshot_url.trim() === '') {
      return NextResponse.json({
        error: 'Screenshot URL is required and must be a non-empty string',
        code: 'MISSING_SCREENSHOT_URL'
      }, { status: 400 });
    }

    // Validate transaction_id if provided
    if (transaction_id !== undefined && transaction_id !== null && typeof transaction_id !== 'string') {
      return NextResponse.json({
        error: 'Transaction ID must be a string',
        code: 'INVALID_TRANSACTION_ID'
      }, { status: 400 });
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingIdInt))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      }, { status: 404 });
    }

    // Check if payment status is pending
    if (existingBooking[0].paymentStatus !== 'pending') {
      return NextResponse.json({
        error: 'Payment screenshot can only be uploaded for pending payments',
        code: 'PAYMENT_NOT_PENDING'
      }, { status: 400 });
    }

    // Update booking with payment screenshot
    const updatedBooking = await db.update(bookings)
      .set({
        paymentScreenshot: screenshot_url.trim(),
        transactionId: transaction_id ? transaction_id.trim() : null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(bookings.id, bookingIdInt))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json({
        error: 'Failed to update booking',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}