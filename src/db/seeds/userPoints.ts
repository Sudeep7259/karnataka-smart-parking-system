import { db } from '@/db';
import { userPoints } from '@/db/schema';

async function main() {
    const sampleUserPoints = [
        {
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            totalPoints: 250,
            level: 3,
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            totalPoints: 180,
            level: 2,
            createdAt: new Date('2024-01-09').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa',
            totalPoints: 450,
            level: 5,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2',
            totalPoints: 120,
            level: 2,
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'AVMXomXcGNOxRJAnFu3u5e5bP83dnGhW',
            totalPoints: 600,
            level: 7,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(userPoints).values(sampleUserPoints);
    
    console.log('✅ User points seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});