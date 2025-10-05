import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPoints, pointsHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, points, action, booking_id } = body;

    // Validate required fields
    if (!user_id || points === undefined || !action) {
      return NextResponse.json(
        {
          error: 'Missing required fields: user_id, points, and action are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate user_id is not empty string
    if (typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        {
          error: 'user_id must be a non-empty string',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Validate points is a positive integer
    if (typeof points !== 'number' || !Number.isInteger(points) || points <= 0) {
      return NextResponse.json(
        {
          error: 'points must be a positive integer',
          code: 'INVALID_POINTS',
        },
        { status: 400 }
      );
    }

    // Validate action is not empty string
    if (typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json(
        {
          error: 'action must be a non-empty string',
          code: 'INVALID_ACTION',
        },
        { status: 400 }
      );
    }

    // Validate booking_id if provided
    if (booking_id !== undefined && booking_id !== null) {
      if (typeof booking_id !== 'number' || !Number.isInteger(booking_id)) {
        return NextResponse.json(
          {
            error: 'booking_id must be a valid integer',
            code: 'INVALID_BOOKING_ID',
          },
          { status: 400 }
        );
      }
    }

    // Check if userPoints record exists
    const existingUserPoints = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, user_id))
      .limit(1);

    if (existingUserPoints.length === 0) {
      return NextResponse.json(
        {
          error: 'User points record not found',
          code: 'USER_POINTS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const currentUserPoints = existingUserPoints[0];
    const newTotalPoints = currentUserPoints.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;
    const currentTimestamp = new Date().toISOString();

    // Update userPoints table
    const updatedUserPoints = await db
      .update(userPoints)
      .set({
        totalPoints: newTotalPoints,
        level: newLevel,
        updatedAt: currentTimestamp,
      })
      .where(eq(userPoints.userId, user_id))
      .returning();

    // Insert into pointsHistory table
    const newPointsHistory = await db
      .insert(pointsHistory)
      .values({
        userId: user_id,
        points: points,
        action: action.trim(),
        bookingId: booking_id !== undefined && booking_id !== null ? booking_id : null,
        createdAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(
      {
        userPoints: updatedUserPoints[0],
        pointsHistory: newPointsHistory[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/gamification/points/add error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}