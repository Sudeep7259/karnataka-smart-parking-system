import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allAchievements = await db.select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      pointsRequired: achievements.pointsRequired,
      category: achievements.category,
      createdAt: achievements.createdAt,
    })
      .from(achievements)
      .orderBy(asc(achievements.pointsRequired));

    return NextResponse.json(allAchievements, { status: 200 });
  } catch (error) {
    console.error('GET achievements error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}