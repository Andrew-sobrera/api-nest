process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/orders_db?schema=public';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-minimum-16-chars';
}
