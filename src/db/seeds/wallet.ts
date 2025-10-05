import { db } from '@/db';
import { wallet } from '@/db/schema';

async function main() {
    const sampleWallets = [
        {
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            balance: 0,
            currency: 'INR',
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            balance: 500,
            currency: 'INR',
            createdAt: new Date('2024-01-09').toISOString(),
            updatedAt: new Date('2024-01-09').toISOString(),
        },
        {
            userId: 'Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa',
            balance: 1000,
            currency: 'INR',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2',
            balance: 2500,
            currency: 'INR',
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date('2024-01-11').toISOString(),
        },
        {
            userId: 'AVMXomXcGNOxRJAnFu3u5e5bP83dnGhW',
            balance: 5000,
            currency: 'INR',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        }
    ];

    await db.insert(wallet).values(sampleWallets);
    
    console.log('✅ Wallet seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});