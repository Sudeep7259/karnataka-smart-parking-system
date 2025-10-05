import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAchievements, achievements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    // Validate user_id is provided
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query userAchievements joined with achievements table
    const unlockedAchievements = await db
      .select({
        // UserAchievement fields
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        isNew: userAchievements.isNew,
        // Achievement details
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        pointsRequired: achievements.pointsRequired,
        category: achievements.category,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));

    return NextResponse.json(unlockedAchievements, { status: 200 });
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