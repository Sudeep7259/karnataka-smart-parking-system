import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, bookings, parkingSpaces } from '@/db/schema';
import { count, sum, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Calculate user statistics
    const totalUsers = await db.select({ count: count() }).from(user);
    const totalCustomers = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, 'customer'));
    const totalOwners = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, 'owner'));
    const totalAdmins = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, 'admin'));

    // Calculate booking statistics
    const totalBookings = await db.select({ count: count() }).from(bookings);
    const pendingBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'pending'));
    const confirmedBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'confirmed'));
    const completedBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'completed'));
    const cancelledBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, 'cancelled'));

    // Calculate revenue
    const revenueResult = await db
      .select({ total: sum(bookings.amount) })
      .from(bookings)
      .where(eq(bookings.status, 'completed'));

    // Calculate parking space statistics
    const totalParkingSpaces = await db
      .select({ count: count() })
      .from(parkingSpaces);
    const activeParkingSpaces = await db
      .select({ count: count() })
      .from(parkingSpaces)
      .where(eq(parkingSpaces.status, 'active'));
    const pendingParkingSpaces = await db
      .select({ count: count() })
      .from(parkingSpaces)
      .where(eq(parkingSpaces.status, 'pending'));
    const inactiveParkingSpaces = await db
      .select({ count: count() })
      .from(parkingSpaces)
      .where(eq(parkingSpaces.status, 'inactive'));

    // Prepare response
    const stats = {
      users: {
        total: totalUsers[0]?.count || 0,
        customers: totalCustomers[0]?.count || 0,
        owners: totalOwners[0]?.count || 0,
        admins: totalAdmins[0]?.count || 0,
      },
      bookings: {
        total: totalBookings[0]?.count || 0,
        pending: pendingBookings[0]?.count || 0,
        confirmed: confirmedBookings[0]?.count || 0,
        completed: completedBookings[0]?.count || 0,
        cancelled: cancelledBookings[0]?.count || 0,
      },
      revenue: {
        total: Number(revenueResult[0]?.total) || 0,
      },
      parkingSpaces: {
        total: totalParkingSpaces[0]?.count || 0,
        active: activeParkingSpaces[0]?.count || 0,
        pending: pendingParkingSpaces[0]?.count || 0,
        inactive: inactiveParkingSpaces[0]?.count || 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats, { status: 200 });
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