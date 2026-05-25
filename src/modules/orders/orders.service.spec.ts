import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;

  const orderMock = {
    id: 'order-id',
    orderNumber: 'ORD-20250523-0001',
    expectedDeliveryDate: new Date('2025-06-15T00:00:00.000Z'),
    customerName: 'Maria Silva',
    customerDocument: '12345678901',
    deliveryAddress: 'Rua das Flores, 123',
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    items: [
      {
        id: 'item-id',
        description: 'Notebook',
        price: 3499.99,
        orderId: 'order-id',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            countAll: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersService = module.get(OrdersService);
    ordersRepository = module.get(OrdersRepository);
  });

  it('should create an order with generated order number', async () => {
    ordersRepository.countAll.mockResolvedValue(0);
    ordersRepository.create.mockResolvedValue(orderMock);

    const result = await ordersService.create({
      expectedDeliveryDate: new Date('2025-06-15T00:00:00.000Z'),
      customerName: 'Maria Silva',
      customerDocument: '12345678901',
      deliveryAddress: 'Rua das Flores, 123',
      items: [{ description: 'Notebook', price: 3499.99 }],
    });

    expect(ordersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerName: 'Maria Silva' }),
      expect.stringMatching(/^ORD-\d{8}-\d{4}$/),
    );
    expect(result).toEqual(orderMock);
  });

  it('should return paginated orders', async () => {
    ordersRepository.findMany.mockResolvedValue([orderMock]);
    ordersRepository.count.mockResolvedValue(1);

    const result = await ordersService.findAll({
      page: 1,
      limit: 10,
      status: OrderStatus.PENDING,
    });

    expect(result.items).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('should throw BadRequestException for invalid date range', async () => {
    await expect(
      ordersService.findAll({
        page: 1,
        limit: 10,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-01-01'),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when order does not exist', async () => {
    ordersRepository.findById.mockResolvedValue(null);

    await expect(ordersService.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should soft delete an existing order', async () => {
    ordersRepository.findById.mockResolvedValue(orderMock);
    ordersRepository.softDelete.mockResolvedValue({
      ...orderMock,
      deletedAt: new Date(),
    });

    const result = await ordersService.remove('order-id');

    expect(ordersRepository.softDelete).toHaveBeenCalledWith('order-id');
    expect(result.deletedAt).toBeInstanceOf(Date);
  });
});
