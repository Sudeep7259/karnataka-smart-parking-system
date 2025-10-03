import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { parkingSpaces } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(parkingSpaces)
        .where(eq(parkingSpaces.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with filters, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const ownerId = searchParams.get('owner_id');
    const city = searchParams.get('city');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(parkingSpaces);
    let conditions = [];

    // Owner filter
    if (ownerId) {
      conditions.push(eq(parkingSpaces.ownerId, ownerId));
    }

    // Search across name, location, city
    if (search) {
      conditions.push(
        or(
          like(parkingSpaces.name, `%${search}%`),
          like(parkingSpaces.location, `%${search}%`),
          like(parkingSpaces.city, `%${search}%`)
        )
      );
    }

    // City filter
    if (city) {
      conditions.push(eq(parkingSpaces.city, city));
    }

    // Status filter
    if (status) {
      conditions.push(eq(parkingSpaces.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    if (sort === 'createdAt') {
      query = order === 'asc' ? query.orderBy(asc(parkingSpaces.createdAt)) : query.orderBy(desc(parkingSpaces.createdAt));
    } else if (sort === 'name') {
      query = order === 'asc' ? query.orderBy(asc(parkingSpaces.name)) : query.orderBy(desc(parkingSpaces.name));
    } else if (sort === 'price') {
      query = order === 'asc' ? query.orderBy(asc(parkingSpaces.price)) : query.orderBy(desc(parkingSpaces.price));
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
      ownerId,
      name, 
      location, 
      city, 
      address,
      totalSpots, 
      availableSpots, 
      price, 
      priceType,
      status,
      features,
      description,
      monthlyRevenue,
      totalBookings,
      rating,
      imageUrl,
      peakHours,
      peakPrice,
      offPeakPrice,
      latitude,
      longitude
    } = requestBody;

    // Validate required fields
    if (!ownerId || !name || !location || !city || !totalSpots || availableSpots === undefined || !price) {
      return NextResponse.json({ 
        error: "Required fields missing: ownerId, name, location, city, totalSpots, availableSpots, price",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Validate data types and business rules
    if (typeof totalSpots !== 'number' || totalSpots <= 0) {
      return NextResponse.json({ 
        error: "totalSpots must be a positive integer",
        code: "INVALID_TOTAL_SPOTS" 
      }, { status: 400 });
    }

    if (typeof availableSpots !== 'number' || availableSpots < 0) {
      return NextResponse.json({ 
        error: "availableSpots must be a non-negative integer",
        code: "INVALID_AVAILABLE_SPOTS" 
      }, { status: 400 });
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ 
        error: "price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (availableSpots > totalSpots) {
      return NextResponse.json({ 
        error: "availableSpots cannot exceed totalSpots",
        code: "INVALID_SPOT_COUNT" 
      }, { status: 400 });
    }

    // Sanitize and prepare data
    const sanitizedData = {
      ownerId: ownerId.trim(),
      name: typeof name === 'string' ? name.trim() : name,
      location: typeof location === 'string' ? location.trim() : location,
      city: typeof city === 'string' ? city.trim() : city,
      address: address ? (typeof address === 'string' ? address.trim() : address) : null,
      totalSpots,
      availableSpots,
      price,
      priceType: priceType || 'per hour',
      status: status || 'active',
      features: features || null,
      description: description ? (typeof description === 'string' ? description.trim() : description) : null,
      monthlyRevenue: monthlyRevenue || 0,
      totalBookings: totalBookings || 0,
      rating: rating || 0,
      imageUrl: imageUrl || null,
      peakHours: peakHours || null,
      peakPrice: peakPrice || null,
      offPeakPrice: offPeakPrice || null,
      latitude: latitude || null,
      longitude: longitude || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(parkingSpaces)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

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

    // Check if record exists
    const existingRecord = await db.select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
    }

    const {
      name,
      location,
      city,
      address,
      totalSpots,
      availableSpots,
      price,
      priceType,
      status,
      features,
      description,
      monthlyRevenue,
      totalBookings,
      rating,
      imageUrl,
      peakHours,
      peakPrice,
      offPeakPrice,
      latitude,
      longitude
    } = requestBody;

    // Validate updated fields if provided
    if (totalSpots !== undefined && (typeof totalSpots !== 'number' || totalSpots <= 0)) {
      return NextResponse.json({ 
        error: "totalSpots must be a positive integer",
        code: "INVALID_TOTAL_SPOTS" 
      }, { status: 400 });
    }

    if (availableSpots !== undefined && (typeof availableSpots !== 'number' || availableSpots < 0)) {
      return NextResponse.json({ 
        error: "availableSpots must be a non-negative integer",
        code: "INVALID_AVAILABLE_SPOTS" 
      }, { status: 400 });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json({ 
        error: "price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Check spot count logic
    const finalTotalSpots = totalSpots !== undefined ? totalSpots : existingRecord[0].totalSpots;
    const finalAvailableSpots = availableSpots !== undefined ? availableSpots : existingRecord[0].availableSpots;

    if (finalAvailableSpots > finalTotalSpots) {
      return NextResponse.json({ 
        error: "availableSpots cannot exceed totalSpots",
        code: "INVALID_SPOT_COUNT" 
      }, { status: 400 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = typeof name === 'string' ? name.trim() : name;
    if (location !== undefined) updates.location = typeof location === 'string' ? location.trim() : location;
    if (city !== undefined) updates.city = typeof city === 'string' ? city.trim() : city;
    if (address !== undefined) updates.address = address ? (typeof address === 'string' ? address.trim() : address) : null;
    if (totalSpots !== undefined) updates.totalSpots = totalSpots;
    if (availableSpots !== undefined) updates.availableSpots = availableSpots;
    if (price !== undefined) updates.price = price;
    if (priceType !== undefined) updates.priceType = priceType;
    if (status !== undefined) updates.status = status;
    if (features !== undefined) updates.features = features;
    if (description !== undefined) updates.description = description ? (typeof description === 'string' ? description.trim() : description) : null;
    if (monthlyRevenue !== undefined) updates.monthlyRevenue = monthlyRevenue;
    if (totalBookings !== undefined) updates.totalBookings = totalBookings;
    if (rating !== undefined) updates.rating = rating;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (peakHours !== undefined) updates.peakHours = peakHours;
    if (peakPrice !== undefined) updates.peakPrice = peakPrice;
    if (offPeakPrice !== undefined) updates.offPeakPrice = offPeakPrice;
    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;

    const updated = await db.update(parkingSpaces)
      .set(updates)
      .where(eq(parkingSpaces.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
    }

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

    // Check if record exists
    const existingRecord = await db.select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
    }

    const deleted = await db.delete(parkingSpaces)
      .where(eq(parkingSpaces.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Parking space deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}