import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPoints, achievements, userAchievements, pointsHistory } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json({ 
        error: "Valid user ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const userId = user_id;

    // Get user's current points
    const userPointsRecord = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    if (userPointsRecord.length === 0) {
      return NextResponse.json({ 
        error: "User points record not found",
        code: "USER_POINTS_NOT_FOUND" 
      }, { status: 404 });
    }

    const currentUserPoints = userPointsRecord[0];
    const currentTotalPoints = currentUserPoints.totalPoints;

    // Get all achievements ordered by pointsRequired ascending
    const allAchievements = await db.select()
      .from(achievements)
      .orderBy(asc(achievements.pointsRequired));

    // Get user's already unlocked achievements
    const unlockedAchievements = await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedAchievementIds = unlockedAchievements.map(ua => ua.achievementId);

    // Filter achievements to find unlockable ones
    const unlockableAchievements = allAchievements.filter(achievement => {
      const isNotUnlocked = !unlockedAchievementIds.includes(achievement.id);
      const hasEnoughPoints = achievement.pointsRequired <= currentTotalPoints;
      return isNotUnlocked && hasEnoughPoints;
    });

    if (unlockableAchievements.length === 0) {
      return NextResponse.json({
        newlyUnlocked: [],
        updatedPoints: currentUserPoints
      }, { status: 200 });
    }

    // Process each newly unlockable achievement
    const newlyUnlocked = [];
    let accumulatedPoints = 0;

    for (const achievement of unlockableAchievements) {
      const currentTimestamp = new Date().toISOString();

      // Insert into userAchievements
      const unlockedAchievement = await db.insert(userAchievements)
        .values({
          userId: userId,
          achievementId: achievement.id,
          unlockedAt: currentTimestamp,
          isNew: true
        })
        .returning();

      // Insert into pointsHistory
      await db.insert(pointsHistory)
        .values({
          userId: userId,
          points: achievement.pointsRequired,
          action: "achievement_unlocked",
          createdAt: currentTimestamp
        })
        .returning();

      // Accumulate points
      accumulatedPoints += achievement.pointsRequired;

      // Add achievement details to newly unlocked array
      newlyUnlocked.push({
        ...unlockedAchievement[0],
        achievement: achievement
      });
    }

    // Update userPoints with accumulated points
    const newTotalPoints = currentTotalPoints + accumulatedPoints;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    const updatedUserPoints = await db.update(userPoints)
      .set({
        totalPoints: newTotalPoints,
        level: newLevel,
        updatedAt: new Date().toISOString()
      })
      .where(eq(userPoints.userId, userId))
      .returning();

    return NextResponse.json({
      newlyUnlocked: newlyUnlocked,
      updatedPoints: updatedUserPoints[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  }
}