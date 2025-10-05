import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPoints } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Validate user_id parameter
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Query user points
    const result = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    // Check if record exists
    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'User points not found',
        code: 'USER_POINTS_NOT_FOUND'
      }, { status: 404 });
    }

    // Return user points record
    return NextResponse.json(result[0], { status: 200 });

  } catch (error) {
    console.error('GET /api/gamification/points error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}