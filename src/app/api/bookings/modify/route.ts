import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { booking_id, date, startTime, endTime } = requestBody;

    // Validate booking_id is provided and is valid integer
    if (!booking_id || isNaN(parseInt(booking_id))) {
      return NextResponse.json({ 
        error: "Valid booking ID is required",
        code: "INVALID_BOOKING_ID" 
      }, { status: 400 });
    }

    // Check if at least one field is provided for update
    if (!date && !startTime && !endTime) {
      return NextResponse.json({ 
        error: "At least one of date, startTime, or endTime must be provided",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ 
        error: "Date must be in YYYY-MM-DD format",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    // Validate time formats if provided
    if (startTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      return NextResponse.json({ 
        error: "Start time must be in HH:MM format",
        code: "INVALID_START_TIME_FORMAT" 
      }, { status: 400 });
    }

    if (endTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      return NextResponse.json({ 
        error: "End time must be in HH:MM format",
        code: "INVALID_END_TIME_FORMAT" 
      }, { status: 400 });
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(booking_id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    const booking = existingBooking[0];

    // Check if booking can be modified (not cancelled or completed)
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json({ 
        error: "Cannot modify booking with status: " + booking.status,
        code: "BOOKING_NOT_MODIFIABLE" 
      }, { status: 409 });
    }

    // Determine final times for validation and calculation
    const finalStartTime = startTime || booking.startTime;
    const finalEndTime = endTime || booking.endTime;

    // Ensure endTime is after startTime
    if (startTime || endTime) {
      const startMinutes = parseTimeToMinutes(finalStartTime);
      const endMinutes = parseTimeToMinutes(finalEndTime);
      
      if (endMinutes <= startMinutes) {
        return NextResponse.json({ 
          error: "End time must be after start time",
          code: "INVALID_TIME_RANGE" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    // Update date if provided
    if (date) {
      updateData.date = date;
    }

    // Update times if provided and recalculate duration/amount
    if (startTime || endTime) {
      updateData.startTime = finalStartTime;
      updateData.endTime = finalEndTime;
      
      // Calculate new duration
      const startMinutes = parseTimeToMinutes(finalStartTime);
      const endMinutes = parseTimeToMinutes(finalEndTime);
      const durationMinutes = endMinutes - startMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      updateData.duration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      
      // Recalculate amount based on original hourly rate
      // Parse original duration more safely
      let originalHours = 0;
      const durationStr = booking.duration.toLowerCase();
      
      if (durationStr.includes('hour')) {
        const hourMatch = durationStr.match(/(\d+)\s*hour/);
        originalHours = hourMatch ? parseInt(hourMatch[1]) : 0;
      } else {
        // Try to parse patterns like "3h", "2h 30m", etc.
        const hourMatch = durationStr.match(/(\d+)h/);
        const minuteMatch = durationStr.match(/(\d+)m/);
        originalHours = (hourMatch ? parseInt(hourMatch[1]) : 0) + (minuteMatch ? parseInt(minuteMatch[1]) / 60 : 0);
      }
      
      if (originalHours > 0) {
        const hourlyRate = booking.amount / originalHours;
        const newHours = durationMinutes / 60;
        updateData.amount = Math.round(hourlyRate * newHours);
      } else {
        // Fallback: use a default rate of 150 per hour
        updateData.amount = Math.round((durationMinutes / 60) * 150);
      }
    }

    // Update the booking
    const updatedBooking = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(booking_id)))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update booking' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedBooking[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(num => parseInt(num));
  return hours * 60 + minutes;
}