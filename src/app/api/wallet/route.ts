import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallet } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'user_id query parameter is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const userWallet = await db.select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (userWallet.length === 0) {
      return NextResponse.json(
        { 
          error: 'Wallet not found for this user',
          code: 'WALLET_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(userWallet[0], { status: 200 });
  } catch (error) {
    console.error('GET wallet error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, balance, currency } = body;

    if (!user_id || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'user_id is required and cannot be empty',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const existingWallet = await db.select()
      .from(wallet)
      .where(eq(wallet.userId, user_id))
      .limit(1);

    if (existingWallet.length > 0) {
      return NextResponse.json(
        { 
          error: 'Wallet already exists for this user',
          code: 'WALLET_ALREADY_EXISTS' 
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newWallet = await db.insert(wallet)
      .values({
        userId: user_id,
        balance: balance !== undefined ? Number(balance) : 0,
        currency: currency || 'INR',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newWallet[0], { status: 201 });
  } catch (error) {
    console.error('POST wallet error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}