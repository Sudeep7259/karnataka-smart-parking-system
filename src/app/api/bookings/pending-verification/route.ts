import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, parkingSpaces } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const ownerId = searchParams.get('owner_id');
    
    // Validate and set limit (default 50, max 100)
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return NextResponse.json(
          { 
            error: 'Invalid limit parameter. Must be between 1 and 100',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }
    
    // Validate and set offset (default 0)
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: 'Invalid offset parameter. Must be a non-negative integer',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }
    
    // Build the query
    let query = db
      .select({
        id: bookings.id,
        bookingId: bookings.bookingId,
        customerId: bookings.customerId,
        parkingSpaceId: bookings.parkingSpaceId,
        customerName: bookings.customerName,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        duration: bookings.duration,
        amount: bookings.amount,
        status: bookings.status,
        cancellationReason: bookings.cancellationReason,
        modifiedAt: bookings.modifiedAt,
        paymentScreenshot: bookings.paymentScreenshot,
        paymentStatus: bookings.paymentStatus,
        verificationReason: bookings.verificationReason,
        transactionId: bookings.transactionId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        parkingSpaceName: parkingSpaces.name,
        parkingSpaceLocation: parkingSpaces.location,
      })
      .from(bookings)
      .innerJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id));
    
    // Apply payment status filter
    if (ownerId) {
      query = query.where(
        and(
          eq(bookings.paymentStatus, 'pending'),
          eq(parkingSpaces.ownerId, ownerId)
        )
      );
    } else {
      query = query.where(eq(bookings.paymentStatus, 'pending'));
    }
    
    // Apply sorting and pagination
    const results = await query
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}