import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { parkingSpaces, bookings } from '@/db/schema';
import { eq, and, sum, count, avg, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    const period = searchParams.get('period') || 'month';

    // Validate owner_id parameter
    if (!ownerId) {
      return NextResponse.json({ 
        error: "owner_id parameter is required",
        code: "MISSING_OWNER_ID" 
      }, { status: 400 });
    }

    // Validate period parameter
    const validPeriods = ['today', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ 
        error: "Invalid period. Must be one of: today, week, month, year",
        code: "INVALID_PERIOD" 
      }, { status: 400 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Check if owner has any parking spaces
    const ownerSpaces = await db.select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.ownerId, ownerId));

    if (ownerSpaces.length === 0) {
      return NextResponse.json({ 
        error: "No parking spaces found for this owner",
        code: "NO_SPACES_FOUND" 
      }, { status: 404 });
    }

    const spaceIds = ownerSpaces.map(space => space.id);

    // Calculate total revenue and total bookings for the period
    const revenueAndBookingsResult = await db.select({
      totalRevenue: sum(bookings.amount),
      totalBookings: count(bookings.id),
      completedBookings: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'completed' THEN 1 END)`,
      pendingBookings: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'pending' THEN 1 END)`,
    })
    .from(bookings)
    .innerJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id))
    .where(
      and(
        eq(parkingSpaces.ownerId, ownerId),
        gte(bookings.createdAt, startDate.toISOString()),
        lte(bookings.createdAt, endDate.toISOString())
      )
    );

    // Calculate space statistics
    const spaceStatsResult = await db.select({
      totalSpaces: count(parkingSpaces.id),
      activeSpaces: sql<number>`COUNT(CASE WHEN ${parkingSpaces.status} = 'active' THEN 1 END)`,
      averageRating: avg(parkingSpaces.rating),
    })
    .from(parkingSpaces)
    .where(eq(parkingSpaces.ownerId, ownerId));

    // Calculate monthly revenue trend (current month vs previous month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthRevenue = await db.select({
      revenue: sum(bookings.amount),
    })
    .from(bookings)
    .innerJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id))
    .where(
      and(
        eq(parkingSpaces.ownerId, ownerId),
        eq(bookings.status, 'completed'),
        gte(bookings.createdAt, currentMonthStart.toISOString())
      )
    );

    const previousMonthRevenue = await db.select({
      revenue: sum(bookings.amount),
    })
    .from(bookings)
    .innerJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id))
    .where(
      and(
        eq(parkingSpaces.ownerId, ownerId),
        eq(bookings.status, 'completed'),
        gte(bookings.createdAt, previousMonthStart.toISOString()),
        lte(bookings.createdAt, previousMonthEnd.toISOString())
      )
    );

    // Calculate monthly revenue trend percentage
    const currentRevenue = Number(currentMonthRevenue[0]?.revenue) || 0;
    const previousRevenue = Number(previousMonthRevenue[0]?.revenue) || 0;
    
    let monthlyRevenueTrend = 0;
    if (previousRevenue > 0) {
      monthlyRevenueTrend = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (currentRevenue > 0) {
      monthlyRevenueTrend = 100; // 100% increase from 0
    }

    // Extract results with null safety
    const revenueAndBookings = revenueAndBookingsResult[0];
    const spaceStats = spaceStatsResult[0];

    const stats = {
      totalRevenue: Number(revenueAndBookings?.totalRevenue) || 0,
      totalBookings: Number(revenueAndBookings?.totalBookings) || 0,
      activeSpaces: Number(spaceStats?.activeSpaces) || 0,
      totalSpaces: Number(spaceStats?.totalSpaces) || 0,
      pendingBookings: Number(revenueAndBookings?.pendingBookings) || 0,
      completedBookings: Number(revenueAndBookings?.completedBookings) || 0,
      averageRating: parseFloat(Number(spaceStats?.averageRating || 0).toFixed(1)),
      monthlyRevenueTrend: parseFloat(monthlyRevenueTrend.toFixed(1)),
      period,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('GET owner dashboard stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  }
}