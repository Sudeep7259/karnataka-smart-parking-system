import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallet, walletTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, description, booking_id } = body;

    // Validate required fields
    if (!user_id || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { 
          error: 'Amount is required',
          code: 'MISSING_AMOUNT'
        },
        { status: 400 }
      );
    }

    // Validate amount is positive
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
          error: 'Wallet not found',
          code: 'WALLET_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const currentWallet = userWallet[0];

    // Check sufficient balance
    if (currentWallet.balance < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient wallet balance',
          code: 'INSUFFICIENT_BALANCE'
        },
        { status: 400 }
      );
    }

    // Update wallet balance
    const newBalance = currentWallet.balance - amount;
    const updatedWallet = await db.update(wallet)
      .set({
        balance: newBalance,
        updatedAt: new Date().toISOString()
      })
      .where(eq(wallet.id, currentWallet.id))
      .returning();

    // Determine transaction type
    const transactionType = booking_id ? 'booking_payment' : 'debit';

    // Create transaction record
    const transaction = await db.insert(walletTransactions)
      .values({
        walletId: currentWallet.id,
        userId: user_id,
        type: transactionType,
        amount: amount,
        description: description || 'Payment deducted from wallet',
        bookingId: booking_id || null,
        status: 'completed',
        createdAt: new Date().toISOString()
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