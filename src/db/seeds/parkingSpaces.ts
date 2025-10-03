import { db } from '@/db';
import { parkingSpaces } from '@/db/schema';

async function main() {
    const sampleParkingSpaces = [
        {
            ownerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            name: 'MG Road Premium Parking',
            location: 'Commercial Street, MG Road',
            city: 'Bangalore',
            address: 'Commercial Street, Near Brigade Road Junction, MG Road, Bangalore, Karnataka 560001',
            totalSpots: 30,
            availableSpots: 25,
            price: 150,
            priceType: 'per hour',
            status: 'active',
            features: JSON.stringify(['CCTV', '24/7 Security', 'Covered Parking', 'EV Charging']),
            description: 'Premium parking facility located in the heart of Bangalore\'s commercial district. Perfect for shopping and business meetings with easy access to MG Road metro station and major shopping centers.',
            monthlyRevenue: 45000,
            totalBookings: 80,
            rating: 4.8,
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            ownerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            name: 'Mysore Palace Parking Hub',
            location: 'Near Mysore Palace',
            city: 'Mysore',
            address: 'Sayyaji Rao Road, Near Mysore Palace Main Gate, Mysore, Karnataka 570001',
            totalSpots: 20,
            availableSpots: 16,
            price: 80,
            priceType: 'per hour',
            status: 'active',
            features: JSON.stringify(['CCTV', 'Washroom']),
            description: 'Convenient parking near the iconic Mysore Palace. Ideal for tourists visiting the palace and exploring nearby attractions like Devaraja Market and Chamundi Hill.',
            monthlyRevenue: 28000,
            totalBookings: 55,
            rating: 4.2,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            ownerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
            name: 'Panambur Beach Parking',
            location: 'Panambur Beach Road',
            city: 'Mangalore',
            address: 'Panambur Beach Road, Near Beach Resort, Mangalore, Karnataka 575010',
            totalSpots: 15,
            availableSpots: 12,
            price: 50,
            priceType: 'per hour',
            status: 'pending',
            features: JSON.stringify(['Basic Security']),
            description: 'Budget-friendly parking near the beautiful Panambur Beach. Perfect for beach visitors and water sports enthusiasts with easy access to local seafood restaurants.',
            monthlyRevenue: 15000,
            totalBookings: 35,
            rating: 3.8,
            imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        }
    ];

    await db.insert(parkingSpaces).values(sampleParkingSpaces);
    
    console.log('✅ Parking spaces seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});