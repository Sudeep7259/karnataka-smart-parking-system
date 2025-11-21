import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, booking_id } = body;

    // Accept both bookingId and booking_id for compatibility
    const id = bookingId || booking_id;

    // Validation: booking_id is required
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID'
        },
        { status: 400 }
      );
    }

    // Validation: booking_id must be a valid integer
    const bookingIdInt = parseInt(id);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json(
        { 
          error: 'Booking ID must be a valid integer',
          code: 'INVALID_BOOKING_ID'
        },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingIdInt))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { 
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const booking = existingBooking[0];

    // Check if paymentStatus is 'pending'
    if (booking.paymentStatus !== 'pending') {
      return NextResponse.json(
        { 
          error: 'Payment already verified or rejected',
          code: 'PAYMENT_ALREADY_PROCESSED'
        },
        { status: 400 }
      );
    }

    // Check if paymentScreenshot exists
    if (!booking.paymentScreenshot || booking.paymentScreenshot.trim() === '') {
      return NextResponse.json(
        { 
          error: 'No payment screenshot uploaded',
          code: 'MISSING_PAYMENT_SCREENSHOT'
        },
        { status: 400 }
      );
    }

    // Update booking: set paymentStatus to 'verified', status to 'confirmed', and update timestamp
    const updatedBooking = await db.update(bookings)
      .set({
        paymentStatus: 'verified',
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      })
      .where(eq(bookings.id, bookingIdInt))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update booking',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}