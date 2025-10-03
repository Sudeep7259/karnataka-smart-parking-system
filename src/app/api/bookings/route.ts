import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, parkingSpaces } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single booking by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const booking = await db.select({
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
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        parkingSpaceName: parkingSpaces.name,
        parkingSpaceLocation: parkingSpaces.location
      })
        .from(bookings)
        .leftJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id))
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(booking[0]);
    }

    // List bookings with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const ownerId = searchParams.get('owner_id');
    const parkingSpaceId = searchParams.get('parking_space_id');
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select({
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
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      parkingSpaceName: parkingSpaces.name,
      parkingSpaceLocation: parkingSpaces.location
    })
      .from(bookings)
      .leftJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id));

    const conditions = [];

    // Owner filter - get bookings for owner's parking spaces
    if (ownerId) {
      conditions.push(eq(parkingSpaces.ownerId, ownerId));
    }

    if (parkingSpaceId) {
      conditions.push(eq(bookings.parkingSpaceId, parseInt(parkingSpaceId)));
    }

    if (customerId) {
      conditions.push(eq(bookings.customerId, customerId));
    }

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    if (date) {
      conditions.push(eq(bookings.date, date));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'createdAt' ? bookings.createdAt : 
                     sort === 'date' ? bookings.date :
                     sort === 'amount' ? bookings.amount : bookings.createdAt;
    
    if (order === 'asc') {
      query = query.orderBy(asc(sortField));
    } else {
      query = query.orderBy(desc(sortField));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    const {
      customerId,
      parkingSpaceId,
      customerName,
      date,
      startTime,
      endTime,
      duration,
      amount,
      status = 'pending'
    } = requestBody;

    // Validate required fields
    if (!customerId) {
      return NextResponse.json({ 
        error: "Customer ID is required",
        code: "MISSING_CUSTOMER_ID" 
      }, { status: 400 });
    }

    if (!parkingSpaceId) {
      return NextResponse.json({ 
        error: "Parking space ID is required",
        code: "MISSING_PARKING_SPACE_ID" 
      }, { status: 400 });
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ 
        error: "Customer name is required",
        code: "MISSING_CUSTOMER_NAME" 
      }, { status: 400 });
    }

    if (!date || !date.trim()) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (!startTime || !startTime.trim()) {
      return NextResponse.json({ 
        error: "Start time is required",
        code: "MISSING_START_TIME" 
      }, { status: 400 });
    }

    if (!endTime || !endTime.trim()) {
      return NextResponse.json({ 
        error: "End time is required",
        code: "MISSING_END_TIME" 
      }, { status: 400 });
    }

    if (!duration || !duration.trim()) {
      return NextResponse.json({ 
        error: "Duration is required",
        code: "MISSING_DURATION" 
      }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be greater than 0",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    // Validate parking space exists
    const parkingSpace = await db.select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.id, parseInt(parkingSpaceId)))
      .limit(1);

    if (parkingSpace.length === 0) {
      return NextResponse.json({ 
        error: "Parking space not found",
        code: "PARKING_SPACE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Generate booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const currentTime = new Date().toISOString();

    const newBooking = await db.insert(bookings).values({
      bookingId,
      customerId: customerId.trim(),
      parkingSpaceId: parseInt(parkingSpaceId),
      customerName: customerName.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      duration: duration.trim(),
      amount: parseInt(amount),
      status,
      createdAt: currentTime,
      updatedAt: currentTime
    }).returning();

    return NextResponse.json(newBooking[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Update allowed fields
    const {
      customerName,
      date,
      startTime,
      endTime,
      duration,
      amount,
      status
    } = requestBody;

    if (customerName !== undefined) {
      if (!customerName.trim()) {
        return NextResponse.json({ 
          error: "Customer name cannot be empty",
          code: "INVALID_CUSTOMER_NAME" 
        }, { status: 400 });
      }
      updates.customerName = customerName.trim();
    }

    if (date !== undefined) {
      if (!date.trim()) {
        return NextResponse.json({ 
          error: "Date cannot be empty",
          code: "INVALID_DATE" 
        }, { status: 400 });
      }
      updates.date = date.trim();
    }

    if (startTime !== undefined) {
      if (!startTime.trim()) {
        return NextResponse.json({ 
          error: "Start time cannot be empty",
          code: "INVALID_START_TIME" 
        }, { status: 400 });
      }
      updates.startTime = startTime.trim();
    }

    if (endTime !== undefined) {
      if (!endTime.trim()) {
        return NextResponse.json({ 
          error: "End time cannot be empty",
          code: "INVALID_END_TIME" 
        }, { status: 400 });
      }
      updates.endTime = endTime.trim();
    }

    if (duration !== undefined) {
      if (!duration.trim()) {
        return NextResponse.json({ 
          error: "Duration cannot be empty",
          code: "INVALID_DURATION" 
        }, { status: 400 });
      }
      updates.duration = duration.trim();
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json({ 
          error: "Amount must be greater than 0",
          code: "INVALID_AMOUNT" 
        }, { status: 400 });
      }
      updates.amount = parseInt(amount);
    }

    if (status !== undefined) {
      updates.status = status;
    }

    const updated = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const deleted = await db.delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Booking deleted successfully',
      booking: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}