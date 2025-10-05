import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallet, walletTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, description } = body;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required and must be a non-empty string',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { 
          error: 'Amount is required',
          code: 'MISSING_AMOUNT' 
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { 
          error: 'Amount must be a positive number',
          code: 'INVALID_AMOUNT' 
        },
        { status: 400 }
      );
    }

    // Find wallet by userId
    const userWallet = await db.select()
      .from(wallet)
      .where(eq(wallet.userId, user_id))
      .limit(1);

    if (userWallet.length === 0) {
      return NextResponse.json(
        { 
          error: 'Wallet not found for the specified user',
          code: 'WALLET_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const currentWallet = userWallet[0];
    const newBalance = currentWallet.balance + amount;
    const now = new Date().toISOString();

    // Update wallet balance
    const updatedWallet = await db.update(wallet)
      .set({
        balance: newBalance,
        updatedAt: now
      })
      .where(eq(wallet.id, currentWallet.id))
      .returning();

    // Create transaction record
    const transaction = await db.insert(walletTransactions)
      .values({
        walletId: currentWallet.id,
        userId: user_id,
        type: 'add_money',
        amount: amount,
        description: description || 'Money added to wallet',
        status: 'completed',
        createdAt: now
      })
      .returning();

    return NextResponse.json(
      {
        wallet: updatedWallet[0],
        transaction: transaction[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}