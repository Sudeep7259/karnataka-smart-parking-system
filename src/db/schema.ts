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
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});