import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { parkingSpaces, user } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Authorization check - admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');

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

    // Validate status if provided
    if (status && !['active', 'pending', 'inactive'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be: active, pending, or inactive',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Build conditions array
    const conditions = [];

    // Add search condition
    if (search) {
      conditions.push(
        or(
          like(parkingSpaces.name, `%${search}%`),
          like(parkingSpaces.location, `%${search}%`),
          like(parkingSpaces.city, `%${search}%`)
        )
      );
    }

    // Add city filter
    if (city) {
      conditions.push(eq(parkingSpaces.city, city));
    }

    // Add status filter
    if (status) {
      conditions.push(eq(parkingSpaces.status, status));
    }

    // Add ownerId filter
    if (ownerId) {
      conditions.push(eq(parkingSpaces.ownerId, ownerId));
    }

    // Build query with JOIN
    let query = db
      .select({
        id: parkingSpaces.id,
        ownerId: parkingSpaces.ownerId,
        name: parkingSpaces.name,
        location: parkingSpaces.location,
        city: parkingSpaces.city,
        address: parkingSpaces.address,
        totalSpots: parkingSpaces.totalSpots,
        availableSpots: parkingSpaces.availableSpots,
        price: parkingSpaces.price,
        priceType: parkingSpaces.priceType,
        status: parkingSpaces.status,
        features: parkingSpaces.features,
        description: parkingSpaces.description,
        monthlyRevenue: parkingSpaces.monthlyRevenue,
        totalBookings: parkingSpaces.totalBookings,
        rating: parkingSpaces.rating,
        imageUrl: parkingSpaces.imageUrl,
        peakHours: parkingSpaces.peakHours,
        peakPrice: parkingSpaces.peakPrice,
        offPeakPrice: parkingSpaces.offPeakPrice,
        latitude: parkingSpaces.latitude,
        longitude: parkingSpaces.longitude,
        createdAt: parkingSpaces.createdAt,
        updatedAt: parkingSpaces.updatedAt,
        owner: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(parkingSpaces)
      .leftJoin(user, eq(parkingSpaces.ownerId, user.id))
      .orderBy(desc(parkingSpaces.createdAt));

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute query with pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}