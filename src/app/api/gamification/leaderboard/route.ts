import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPoints, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(Math.max(parseInt(limitParam), 1), 50) 
      : 10;

    // Validate limit is a valid number
    if (limitParam && isNaN(parseInt(limitParam))) {
      return NextResponse.json(
        { 
          error: 'Invalid limit parameter',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }

    // Query leaderboard with join
    const leaderboard = await db
      .select({
        userId: userPoints.userId,
        totalPoints: userPoints.totalPoints,
        level: userPoints.level,
        name: user.name,
        image: user.image,
      })
      .from(userPoints)
      .innerJoin(user, eq(userPoints.userId, user.id))
      .orderBy(desc(userPoints.totalPoints))
      .limit(limit);

    // Add rank to each entry
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      userId: entry.userId,
      name: entry.name,
      image: entry.image,
      totalPoints: entry.totalPoints,
      level: entry.level,
      rank: index + 1,
    }));

    return NextResponse.json(leaderboardWithRank, { status: 200 });

  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}