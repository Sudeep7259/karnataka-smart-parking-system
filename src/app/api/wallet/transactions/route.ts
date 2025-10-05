import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletTransactions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const walletId = searchParams.get('wallet_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate that at least one of user_id or wallet_id is provided
    if (!userId && !walletId) {
      return NextResponse.json(
        { 
          error: 'At least one of user_id or wallet_id must be provided',
          code: 'MISSING_REQUIRED_FILTER'
        },
        { status: 400 }
      );
    }

    // Build filter conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(walletTransactions.userId, userId));
    }

    if (walletId) {
      const parsedWalletId = parseInt(walletId);
      if (isNaN(parsedWalletId)) {
        return NextResponse.json(
          { 
            error: 'Invalid wallet_id format',
            code: 'INVALID_WALLET_ID'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(walletTransactions.walletId, parsedWalletId));
    }

    if (type) {
      const validTypes = ['credit', 'debit', 'booking_payment', 'refund', 'add_money'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { 
            error: 'Invalid type. Must be one of: credit, debit, booking_payment, refund, add_money',
            code: 'INVALID_TYPE'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(walletTransactions.type, type));
    }

    if (status) {
      const validStatuses = ['completed', 'pending', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            error: 'Invalid status. Must be one of: completed, pending, failed',
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(walletTransactions.status, status));
    }

    // Build and execute query
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(whereCondition)
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('GET wallet transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}