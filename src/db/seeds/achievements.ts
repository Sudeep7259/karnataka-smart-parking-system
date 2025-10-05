import { db } from '@/db';
import { achievements } from '@/db/schema';

async function main() {
    const sampleAchievements = [
        {
            name: 'First Park',
            description: 'Complete your first parking booking',
            icon: '🚗',
            pointsRequired: 10,
            category: 'parking_master',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Regular Parker',
            description: 'Park 5 times',
            icon: '⭐',
            pointsRequired: 50,
            category: 'frequent_parker',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'MG Road Master',
            description: 'Park 5 times near MG Road',
            icon: '🏆',
            pointsRequired: 100,
            category: 'location_explorer',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Night Owl',
            description: 'Park after 10 PM, 3 times',
            icon: '🌙',
            pointsRequired: 75,
            category: 'frequent_parker',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Early Bird',
            description: 'Park before 8 AM, 3 times',
            icon: '🌅',
            pointsRequired: 75,
            category: 'frequent_parker',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'City Explorer',
            description: 'Park in 3 different cities',
            icon: '🗺️',
            pointsRequired: 150,
            category: 'location_explorer',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Weekend Warrior',
            description: 'Park 10 times on weekends',
            icon: '💪',
            pointsRequired: 100,
            category: 'frequent_parker',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Parking Legend',
            description: 'Complete 50 bookings',
            icon: '👑',
            pointsRequired: 500,
            category: 'parking_master',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Loyalty Badge',
            description: 'Use NammaParking for 30 days',
            icon: '❤️',
            pointsRequired: 200,
            category: 'parking_master',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Speed Demon',
            description: 'Complete a booking in under 2 minutes',
            icon: '⚡',
            pointsRequired: 50,
            category: 'parking_master',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(achievements).values(sampleAchievements);
    
    console.log('✅ Achievements seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});