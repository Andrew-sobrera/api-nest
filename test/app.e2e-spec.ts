import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login should authenticate seeded admin user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@orders.local',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.message).toBe('Login successful');
  });

  it('POST /auth/login should reject invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@orders.local',
        password: 'invalid-password',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('GET /orders should require authentication', async () => {
    await request(app.getHttpServer()).get('/orders').expect(401);
  });
});

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let createdOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@orders.local',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /orders should create a new order', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        expectedDeliveryDate: '2025-07-10T00:00:00.000Z',
        customerName: 'E2E Customer',
        customerDocument: '11122233344',
        deliveryAddress: 'Rua E2E, 100 - Test City',
        items: [
          { description: 'Produto E2E', price: 199.99 },
          { description: 'Produto E2E 2', price: 49.9 },
        ],
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.orderNumber).toMatch(/^ORD-/);
    expect(response.body.data.items).toHaveLength(2);
    createdOrderId = response.body.data.id;
  });

  it('GET /orders should list orders with filters and pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .query({
        status: 'PENDING',
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.meta.page).toBe(1);
  });

  it('GET /orders/:id should return order details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(createdOrderId);
  });

  it('PATCH /orders/:id should update order status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'PROCESSING' })
      .expect(200);

    expect(response.body.data.status).toBe('PROCESSING');
  });

  it('DELETE /orders/:id should soft delete order', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.deletedAt).not.toBeNull();

    await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
