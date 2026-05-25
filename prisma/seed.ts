import { OrderStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const customers = [
  {
    name: 'Maria Silva',
    document: '12345678901',
    address: 'Rua das Flores, 123 - São Paulo, SP',
  },
  {
    name: 'João Santos',
    document: '98765432100',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
  },
  {
    name: 'Ana Oliveira',
    document: '45678912345',
    address: 'Rua XV de Novembro, 45 - Curitiba, PR',
  },
  {
    name: 'Carlos Pereira',
    document: '32165498700',
    address: 'Av. Atlântica, 500 - Rio de Janeiro, RJ',
  },
  {
    name: 'Fernanda Costa',
    document: '78912345600',
    address: 'Rua da Bahia, 789 - Belo Horizonte, MG',
  },
];

const productCatalog = [
  { description: 'Notebook Dell Inspiron 15', price: 3499.99 },
  { description: 'Mouse Logitech MX Master 3', price: 499.9 },
  { description: 'Teclado Mecânico Keychron K2', price: 699.0 },
  { description: 'Monitor LG UltraWide 29"', price: 1899.99 },
  { description: 'Headset HyperX Cloud II', price: 599.99 },
  { description: 'Webcam Logitech C920', price: 449.9 },
  { description: 'SSD Samsung 1TB NVMe', price: 399.99 },
  { description: 'Cadeira Ergonômica Flexform', price: 1299.0 },
];

const statuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomItems(count: number) {
  const shuffled = [...productCatalog].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function seedUsers(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@orders.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const name = process.env.SEED_ADMIN_NAME ?? 'System Administrator';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

async function seedOrders(): Promise<void> {
  const existingOrders = await prisma.order.count();

  if (existingOrders > 0) {
    console.log('Orders already seeded, skipping...');
    return;
  }

  const baseDate = new Date('2025-01-01');

  for (let index = 0; index < 25; index += 1) {
    const customer = customers[index % customers.length];
    const createdAt = addDays(baseDate, index * 3);
    const expectedDeliveryDate = addDays(createdAt, 7 + (index % 10));
    const orderNumber = `ORD-${createdAt.toISOString().slice(0, 10).replace(/-/g, '')}-${String(index + 1).padStart(4, '0')}`;
    const items = randomItems(1 + (index % 3));

    await prisma.order.create({
      data: {
        orderNumber,
        expectedDeliveryDate,
        customerName: customer.name,
        customerDocument: customer.document,
        deliveryAddress: customer.address,
        status: randomItem(statuses),
        createdAt,
        updatedAt: createdAt,
        items: {
          create: items.map((item) => ({
            description: item.description,
            price: item.price,
          })),
        },
      },
    });
  }

  console.log('Seeded 25 orders with items');
}

async function main(): Promise<void> {
  await seedUsers();
  await seedOrders();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
