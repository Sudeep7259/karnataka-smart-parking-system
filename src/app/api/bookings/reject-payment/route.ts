import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, rejection_reason } = body;

    // Validate booking_id
    if (!booking_id) {
      return NextResponse.json(
        { 
          error: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID' 
        },
        { status: 400 }
      );
    }

    const bookingIdNum = parseInt(booking_id);
    if (isNaN(bookingIdNum)) {
      return NextResponse.json(
        { 
          error: 'Booking ID must be a valid integer',
          code: 'INVALID_BOOKING_ID' 
        },
        { status: 400 }
      );
    }

    // Validate rejection_reason
    if (!rejection_reason) {
      return NextResponse.json(
        { 
          error: 'Rejection reason is required',
          code: 'MISSING_REJECTION_REASON' 
        },
        { status: 400 }
      );
    }

    const trimmedReason = rejection_reason.trim();
    if (trimmedReason.length === 0) {
      return NextResponse.json(
        { 
          error: 'Rejection reason cannot be empty',
          code: 'EMPTY_REJECTION_REASON' 
        },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingIdNum))
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

    // Check if payment status is pending
    const currentBooking = existingBooking[0];
    if (currentBooking.paymentStatus !== 'pending') {
      return NextResponse.json(
        { 
          error: `Payment already ${currentBooking.paymentStatus}. Cannot reject.`,
          code: 'PAYMENT_NOT_PENDING' 
        },
        { status: 400 }
      );
    }

    // Update booking with rejection details
    const updatedBooking = await db
      .update(bookings)
      .set({
        paymentStatus: 'rejected',
        status: 'cancelled',
        verificationReason: trimmedReason,
        updatedAt: new Date().toISOString()
      })
      .where(eq(bookings.id, bookingIdNum))
      .returning();

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