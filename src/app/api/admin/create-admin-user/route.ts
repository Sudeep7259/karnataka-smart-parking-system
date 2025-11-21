import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const ADMIN_PASSWORD = 'Admin@2025#Secure';
    const ADMIN_USER_ID = 'admin_1628f6833cb0dfc16847bd7f1e3eae58';
    const ADMIN_EMAIL = 'admin@parking.com';
    const SALT_ROUNDS = 10;

    // Hash the password
    const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS);

    // Update the account record with the hashed password
    const updatedAccount = await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(account.userId, ADMIN_USER_ID))
      .returning();

    if (updatedAccount.length === 0) {
      return NextResponse.json(
        {
          error: 'Admin account not found',
          code: 'ACCOUNT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user password updated',
        adminEmail: ADMIN_EMAIL,
        userId: ADMIN_USER_ID
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}