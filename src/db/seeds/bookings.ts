import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            bookingId: 'BK1704123456ABCD',
            customerId: 'cust_001',
            parkingSpaceId: 1,
            customerName: 'Priya Sharma',
            date: '2024-12-20',
            startTime: '09:00',
            endTime: '12:00',
            duration: '3 hours',
            amount: 450,
            status: 'completed',
            createdAt: new Date('2024-12-20T09:00:00').toISOString(),
            updatedAt: new Date('2024-12-20T12:00:00').toISOString(),
        },
        {
            bookingId: 'BK1704234567EFGH',
            customerId: 'cust_002',
            parkingSpaceId: 1,
            customerName: 'Arun Kumar',
            date: '2024-12-22',
            startTime: '18:00',
            endTime: '20:00',
            duration: '2 hours',
            amount: 300,
            status: 'confirmed',
            createdAt: new Date('2024-12-22T18:00:00').toISOString(),
            updatedAt: new Date('2024-12-22T18:00:00').toISOString(),
        },
        {
            bookingId: 'BK1704345678IJKL',
            customerId: 'cust_003',
            parkingSpaceId: 2,
            customerName: 'Sneha Reddy',
            date: '2024-12-21',
            startTime: '14:00',
            endTime: '18:00',
            duration: '4 hours',
            amount: 320,
            status: 'completed',
            createdAt: new Date('2024-12-21T14:00:00').toISOString(),
            updatedAt: new Date('2024-12-21T18:00:00').toISOString(),
        },
        {
            bookingId: 'BK1704456789MNOP',
            customerId: 'cust_004',
            parkingSpaceId: 2,
            customerName: 'Karan Singh',
            date: '2024-12-23',
            startTime: '09:00',
            endTime: '12:00',
            duration: '3 hours',
            amount: 240,
            status: 'pending',
            createdAt: new Date('2024-12-23T09:00:00').toISOString(),
            updatedAt: new Date('2024-12-23T09:00:00').toISOString(),
        },
        {
            bookingId: 'BK1704567890QRST',
            customerId: 'cust_005',
            parkingSpaceId: 3,
            customerName: 'Meera Nair',
            date: '2024-12-19',
            startTime: '18:30',
            endTime: '21:00',
            duration: '2.5 hours',
            amount: 125,
            status: 'confirmed',
            createdAt: new Date('2024-12-19T18:30:00').toISOString(),
            updatedAt: new Date('2024-12-19T18:30:00').toISOString(),
        },
        {
            bookingId: 'BK1704678901UVWX',
            customerId: 'cust_006',
            parkingSpaceId: 3,
            customerName: 'Rajesh Patel',
            date: '2024-12-18',
            startTime: '14:00',
            endTime: '18:00',
            duration: '4 hours',
            amount: 200,
            status: 'cancelled',
            createdAt: new Date('2024-12-18T14:00:00').toISOString(),
            updatedAt: new Date('2024-12-18T16:00:00').toISOString(),
        }
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});