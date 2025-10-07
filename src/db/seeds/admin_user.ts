import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
    const adminEmail = 'admin@nammaparking.com';
    
    // Check if admin user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);
    
    if (existingUser.length > 0) {
        console.log('⚠️  Admin user already exists. Skipping insertion.');
        return;
    }
    
    // Generate unique ID for user
    const userId = `user_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Create admin user
    const adminUser = {
        id: userId,
        name: 'Admin User',
        email: adminEmail,
        emailVerified: true,
        image: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    await db.insert(user).values(adminUser);
    
    // Hash the password
    const hashedPassword = bcrypt.hashSync('Admin@2025#Secure', 10);
    
    // Create account for credential authentication
    const adminAccount = {
        id: `account_${crypto.randomUUID().replace(/-/g, '')}`,
        accountId: adminEmail,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    await db.insert(account).values(adminAccount);
    
    console.log('✅ Admin user seeder completed successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: Admin@2025#Secure`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});