import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { booking_id, cancellation_reason } = requestBody;

    // Validate booking_id
    if (!booking_id) {
      return NextResponse.json({
        error: "Booking ID is required",
        code: "MISSING_BOOKING_ID"
      }, { status: 400 });
    }

    if (isNaN(parseInt(booking_id))) {
      return NextResponse.json({
        error: "Valid booking ID is required",
        code: "INVALID_BOOKING_ID"
      }, { status: 400 });
    }

    // Validate cancellation_reason
    if (!cancellation_reason) {
      return NextResponse.json({
        error: "Cancellation reason is required",
        code: "MISSING_CANCELLATION_REASON"
      }, { status: 400 });
    }

    if (typeof cancellation_reason !== 'string' || cancellation_reason.trim() === '') {
      return NextResponse.json({
        error: "Cancellation reason cannot be empty",
        code: "EMPTY_CANCELLATION_REASON"
      }, { status: 400 });
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(booking_id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({
        error: "Booking not found",
        code: "BOOKING_NOT_FOUND"
      }, { status: 404 });
    }

    const booking = existingBooking[0];

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({
        error: "Booking is already cancelled",
        code: "BOOKING_ALREADY_CANCELLED"
      }, { status: 409 });
    }

    // Update booking to cancelled status
    const updatedBooking = await db.update(bookings)
      .set({
        status: 'cancelled',
        cancellationReason: cancellation_reason.trim(),
        modifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(bookings.id, parseInt(booking_id)))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json({
        error: "Failed to cancel booking",
        code: "CANCELLATION_FAILED"
      }, { status: 500 });
    }

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error) {
    console.error('POST /api/bookings/cancel error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}