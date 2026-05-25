import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateOrderInput,
  OrderEntity,
  OrderFilterParams,
  UpdateOrderInput,
} from './entities/order.entity';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderInput, orderNumber: string): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        expectedDeliveryDate: data.expectedDeliveryDate,
        customerName: data.customerName,
        customerDocument: data.customerDocument,
        deliveryAddress: data.deliveryAddress,
        status: data.status,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            price: new Prisma.Decimal(item.price),
          })),
        },
      },
      include: { items: true },
    });

    return OrderMapper.toEntity(order);
  }

  async findMany(filters: OrderFilterParams): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: OrderMapper.buildWhereClause(filters),
      include: { items: true },
      skip: filters.skip,
      take: filters.limit,
      orderBy: OrderMapper.buildOrderByClause(filters.sortBy, filters.sortOrder),
    });

    return orders.map((order) => OrderMapper.toEntity(order));
  }

  async count(
    filters: Pick<
      OrderFilterParams,
      'orderNumber' | 'status' | 'startDate' | 'endDate'
    >,
  ): Promise<number> {
    return this.prisma.order.count({
      where: OrderMapper.buildWhereClause(filters),
    });
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    });

    return order ? OrderMapper.toEntity(order) : null;
  }

  async update(id: string, data: UpdateOrderInput): Promise<OrderEntity> {
    const order = await this.prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
      }

      return tx.order.update({
        where: { id },
        data: {
          expectedDeliveryDate: data.expectedDeliveryDate,
          customerName: data.customerName,
          customerDocument: data.customerDocument,
          deliveryAddress: data.deliveryAddress,
          status: data.status,
          ...(data.items && {
            items: {
              create: data.items.map((item) => ({
                description: item.description,
                price: new Prisma.Decimal(item.price),
              })),
            },
          }),
        },
        include: { items: true },
      });
    });

    return OrderMapper.toEntity(order);
  }

  async softDelete(id: string): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { items: true },
    });

    return OrderMapper.toEntity(order);
  }

  async countAll(): Promise<number> {
    return this.prisma.order.count({ where: { deletedAt: null } });
  }
}
