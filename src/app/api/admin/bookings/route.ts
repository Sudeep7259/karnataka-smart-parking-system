import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, parkingSpaces, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Authorization check - admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin role required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const statusFilter = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const dateFilter = searchParams.get('date');
    const customerIdFilter = searchParams.get('customerId');
    const parkingSpaceIdFilter = searchParams.get('parkingSpaceId');

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // Validate status filter if provided
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Validate payment status filter if provided
    const validPaymentStatuses = ['pending', 'verified', 'rejected'];
    if (paymentStatusFilter && !validPaymentStatuses.includes(paymentStatusFilter)) {
      return NextResponse.json({ 
        error: 'Invalid paymentStatus. Must be one of: pending, verified, rejected',
        code: 'INVALID_PAYMENT_STATUS' 
      }, { status: 400 });
    }

    // Validate parkingSpaceId if provided
    if (parkingSpaceIdFilter && isNaN(parseInt(parkingSpaceIdFilter))) {
      return NextResponse.json({ 
        error: 'Invalid parkingSpaceId parameter',
        code: 'INVALID_PARKING_SPACE_ID' 
      }, { status: 400 });
    }

    // Build the query with joins
    let query = db
      .select({
        // Booking fields
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
        // Customer fields
        customerEmail: user.email,
        customerImage: user.image,
        // Parking space fields
        parkingSpaceName: parkingSpaces.name,
        parkingSpaceLocation: parkingSpaces.location,
        parkingSpaceCity: parkingSpaces.city,
        parkingSpaceAddress: parkingSpaces.address,
        parkingSpaceOwnerId: parkingSpaces.ownerId,
      })
      .from(bookings)
      .leftJoin(user, eq(bookings.customerId, user.id))
      .leftJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id));

    // Apply filters
    const conditions = [];

    if (statusFilter) {
      conditions.push(eq(bookings.status, statusFilter));
    }

    if (paymentStatusFilter) {
      conditions.push(eq(bookings.paymentStatus, paymentStatusFilter));
    }

    if (dateFilter) {
      conditions.push(eq(bookings.date, dateFilter));
    }

    if (customerIdFilter) {
      conditions.push(eq(bookings.customerId, customerIdFilter));
    }

    if (parkingSpaceIdFilter) {
      conditions.push(eq(bookings.parkingSpaceId, parseInt(parkingSpaceIdFilter)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting and pagination
    const results = await query
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get owner details for each parking space
    const bookingsWithOwnerDetails = await Promise.all(
      results.map(async (booking) => {
        let ownerDetails = null;
        
        if (booking.parkingSpaceOwnerId) {
          const owners = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            })
            .from(user)
            .where(eq(user.id, booking.parkingSpaceOwnerId))
            .limit(1);

          if (owners.length > 0) {
            ownerDetails = owners[0];
          }
        }

        return {
          id: booking.id,
          bookingId: booking.bookingId,
          customerId: booking.customerId,
          parkingSpaceId: booking.parkingSpaceId,
          customerName: booking.customerName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          amount: booking.amount,
          status: booking.status,
          cancellationReason: booking.cancellationReason,
          modifiedAt: booking.modifiedAt,
          paymentScreenshot: booking.paymentScreenshot,
          paymentStatus: booking.paymentStatus,
          verificationReason: booking.verificationReason,
          transactionId: booking.transactionId,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          customer: {
            id: booking.customerId,
            name: booking.customerName,
            email: booking.customerEmail,
            image: booking.customerImage,
          },
          parkingSpace: {
            id: booking.parkingSpaceId,
            name: booking.parkingSpaceName,
            location: booking.parkingSpaceLocation,
            city: booking.parkingSpaceCity,
            address: booking.parkingSpaceAddress,
            owner: ownerDetails,
          },
        };
      })
    );

    return NextResponse.json(bookingsWithOwnerDetails, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}