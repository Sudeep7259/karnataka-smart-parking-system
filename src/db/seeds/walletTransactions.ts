import { db } from '@/db';
import { walletTransactions } from '@/db/schema';

async function main() {
    const sampleTransactions = [
        // WALLET 1 (userId: CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav) - Final balance: 0
        {
            walletId: 1,
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            type: 'add_money',
            amount: 1500,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-08T10:30:00').toISOString(),
        },
        {
            walletId: 1,
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            type: 'booking_payment',
            amount: 450,
            description: 'Payment for parking booking #BK001',
            bookingId: 1,
            status: 'completed',
            createdAt: new Date('2024-01-09T14:20:00').toISOString(),
        },
        {
            walletId: 1,
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            type: 'booking_payment',
            amount: 300,
            description: 'Payment for parking booking #BK002',
            bookingId: 2,
            status: 'completed',
            createdAt: new Date('2024-01-10T09:15:00').toISOString(),
        },
        {
            walletId: 1,
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            type: 'refund',
            amount: 250,
            description: 'Refund for cancelled booking #BK003',
            bookingId: 3,
            status: 'completed',
            createdAt: new Date('2024-01-11T16:45:00').toISOString(),
        },
        {
            walletId: 1,
            userId: 'CqaQzAFzdCuQFzhycBgrbtPEhTEP6mav',
            type: 'debit',
            amount: 1000,
            description: 'Withdrawal to bank account',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-12T11:30:00').toISOString(),
        },

        // WALLET 2 (userId: KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW) - Final balance: 500
        {
            walletId: 2,
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            type: 'add_money',
            amount: 1000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-09T08:00:00').toISOString(),
        },
        {
            walletId: 2,
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            type: 'booking_payment',
            amount: 500,
            description: 'Payment for parking booking #BK004',
            bookingId: 1,
            status: 'completed',
            createdAt: new Date('2024-01-10T13:30:00').toISOString(),
        },
        {
            walletId: 2,
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            type: 'add_money',
            amount: 1000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-11T10:00:00').toISOString(),
        },
        {
            walletId: 2,
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            type: 'booking_payment',
            amount: 600,
            description: 'Payment for parking booking #BK005',
            bookingId: 2,
            status: 'completed',
            createdAt: new Date('2024-01-11T15:45:00').toISOString(),
        },
        {
            walletId: 2,
            userId: 'KX1sTxzm4hTPJtmrK3LHmPXSBOhdeLqW',
            type: 'booking_payment',
            amount: 400,
            description: 'Payment for parking booking #BK006',
            bookingId: 3,
            status: 'completed',
            createdAt: new Date('2024-01-12T12:20:00').toISOString(),
        },

        // WALLET 3 (userId: Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa) - Final balance: 1000
        {
            walletId: 3,
            userId: 'Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa',
            type: 'add_money',
            amount: 3000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-10T09:30:00').toISOString(),
        },
        {
            walletId: 3,
            userId: 'Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa',
            type: 'booking_payment',
            amount: 1200,
            description: 'Payment for parking booking #BK007',
            bookingId: 4,
            status: 'completed',
            createdAt: new Date('2024-01-11T14:00:00').toISOString(),
        },
        {
            walletId: 3,
            userId: 'Z22gw6MyLNNU8JfyTFxmwLkfdHM3Oupa',
            type: 'booking_payment',
            amount: 800,
            description: 'Payment for parking booking #BK008',
            bookingId: 5,
            status: 'completed',
            createdAt: new Date('2024-01-12T10:30:00').toISOString(),
        },

        // WALLET 4 (userId: ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2) - Final balance: 2500
        {
            walletId: 4,
            userId: 'ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2',
            type: 'add_money',
            amount: 3000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-11T08:15:00').toISOString(),
        },
        {
            walletId: 4,
            userId: 'ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2',
            type: 'add_money',
            amount: 2000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-12T11:00:00').toISOString(),
        },
        {
            walletId: 4,
            userId: 'ruNWLyrPw2eQrj13Uy0nviCmoqcgihE2',
            type: 'booking_payment',
            amount: 500,
            description: 'Payment for parking booking #BK009',
            bookingId: 6,
            status: 'pending',
            createdAt: new Date('2024-01-13T09:45:00').toISOString(),
        },

        // WALLET 5 (userId: AVMXomXcGNOxRJAnFu3u5e5bP83dnGhW) - Final balance: 5000
        {
            walletId: 5,
            userId: 'AVMXomXcGNOxRJAnFu3u5e5bP83dnGhW',
            type: 'add_money',
            amount: 5000,
            description: 'Added money to wallet',
            bookingId: null,
            status: 'completed',
            createdAt: new Date('2024-01-12T15:00:00').toISOString(),
        },
    ];

    await db.insert(walletTransactions).values(sampleTransactions);
    
    console.log('✅ Wallet transactions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});