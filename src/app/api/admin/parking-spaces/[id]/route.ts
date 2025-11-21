import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { parkingSpaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Extract and validate ID parameter - await params in Next.js 15
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Parking space ID is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    const parkingSpaceId = parseInt(id);
    
    if (isNaN(parkingSpaceId)) {
      return NextResponse.json(
        { 
          error: 'Valid parking space ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if parking space exists
    const existingParkingSpace = await db
      .select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.id, parkingSpaceId))
      .limit(1);

    if (existingParkingSpace.length === 0) {
      return NextResponse.json(
        { 
          error: 'Parking space not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete parking space (CASCADE will handle related bookings)
    const deleted = await db
      .delete(parkingSpaces)
      .where(eq(parkingSpaces.id, parkingSpaceId))
      .returning();

    return NextResponse.json(
      {
        message: 'Parking space and related bookings deleted successfully',
        deletedParkingSpace: deleted[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE parking space error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Extract and validate ID parameter - await params in Next.js 15
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Parking space ID is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    const parkingSpaceId = parseInt(id);
    
    if (isNaN(parkingSpaceId)) {
      return NextResponse.json(
        { 
          error: 'Valid parking space ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json(
        { 
          error: 'Valid status is required (active, inactive, or pending)',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Check if parking space exists
    const existingParkingSpace = await db
      .select()
      .from(parkingSpaces)
      .where(eq(parkingSpaces.id, parkingSpaceId))
      .limit(1);

    if (existingParkingSpace.length === 0) {
      return NextResponse.json(
        { 
          error: 'Parking space not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update parking space status
    const updated = await db
      .update(parkingSpaces)
      .set({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(parkingSpaces.id, parkingSpaceId))
      .returning();

    return NextResponse.json(
      {
        message: `Parking space ${status === 'inactive' ? 'deactivated' : status === 'active' ? 'activated' : 'status updated'} successfully`,
        parkingSpace: updated[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('PATCH parking space error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}