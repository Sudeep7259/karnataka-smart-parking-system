import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const adminEmail = 'admin@parking.com';
    const adminPassword = 'Admin@2025#Secure';

    // Step 1: Delete existing admin user if found
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      // Delete existing accounts first (due to FK constraint)
      await db.delete(account)
        .where(eq(account.userId, existingUser[0].id));

      // Delete existing user
      await db.delete(user)
        .where(eq(user.email, adminEmail));

      console.log('Existing admin user deleted');
    }

    // Step 2: Use better-auth's internal API to create user with proper password hashing
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: 'System Admin',
      }
    });

    if (!signUpResult) {
      return NextResponse.json({
        error: 'Failed to create admin user',
        code: 'USER_CREATION_FAILED'
      }, { status: 500 });
    }

    // Step 3: Update the user role to admin
    const updatedUser = await db.update(user)
      .set({ 
        role: 'admin',
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(user.email, adminEmail))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({
        error: 'Failed to update admin role',
        code: 'ROLE_UPDATE_FAILED'
      }, { status: 500 });
    }

    // Step 4: Return success response
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully with better-auth',
      data: {
        userId: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        role: updatedUser[0].role,
        emailVerified: updatedUser[0].emailVerified,
        passwordHashed: true,
        hashingMethod: 'better-auth',
        createdAt: updatedUser[0].createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}