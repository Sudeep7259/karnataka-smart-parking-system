import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Add parking management tables
export const parkingSpaces = sqliteTable('parking_spaces', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  location: text('location').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  totalSpots: integer('total_spots').notNull(),
  availableSpots: integer('available_spots').notNull(),
  price: integer('price').notNull(),
  priceType: text('price_type').default('per hour'),
  status: text('status').default('active'),
  features: text('features', { mode: 'json' }),
  description: text('description'),
  monthlyRevenue: integer('monthly_revenue').default(0),
  totalBookings: integer('total_bookings').default(0),
  rating: real('rating').default(0),
  imageUrl: text('image_url'),
  peakHours: text('peak_hours'),
  peakPrice: integer('peak_price'),
  offPeakPrice: integer('off_peak_price'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: text('booking_id').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  parkingSpaceId: integer('parking_space_id').notNull().references(() => parkingSpaces.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  duration: text('duration').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').default('pending'),
  cancellationReason: text('cancellation_reason'),
  modifiedAt: text('modified_at'),
  paymentScreenshot: text('payment_screenshot'),
  paymentStatus: text('payment_status').default('pending'),
  verificationReason: text('verification_reason'),
  transactionId: text('transaction_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add e-wallet tables
export const wallet = sqliteTable('wallet', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const walletTransactions = sqliteTable('wallet_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletId: integer('wallet_id').notNull().references(() => wallet.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  bookingId: integer('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('completed'),
  createdAt: text('created_at').notNull(),
});

// Add gamification tables
export const userPoints = sqliteTable('user_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  totalPoints: integer('total_points').notNull().default(0),
  level: integer('level').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  pointsRequired: integer('points_required').notNull(),
  category: text('category').notNull(),
  createdAt: text('created_at').notNull(),
});

export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: text('unlocked_at').notNull(),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(true),
});

export const pointsHistory = sqliteTable('points_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  points: integer('points').notNull(),
  action: text('action').notNull(),
  bookingId: integer('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
});