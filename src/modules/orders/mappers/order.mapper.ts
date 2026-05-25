import { OrderStatus, Prisma } from '@prisma/client';
import {
  OrderEntity,
  OrderFilterParams,
  OrderItemEntity,
} from '../entities/order.entity';

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export class OrderMapper {
  static toEntity(order: OrderWithItems): OrderEntity {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      expectedDeliveryDate: order.expectedDeliveryDate,
      customerName: order.customerName,
      customerDocument: order.customerDocument,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deletedAt: order.deletedAt,
      items: order.items.map((item) => OrderMapper.toItemEntity(item)),
    };
  }

  static toItemEntity(item: OrderWithItems['items'][number]): OrderItemEntity {
    return {
      id: item.id,
      description: item.description,
      price: Number(item.price),
      orderId: item.orderId,
    };
  }

  static buildWhereClause(
    filters: Pick<
      OrderFilterParams,
      'orderNumber' | 'status' | 'startDate' | 'endDate'
    >,
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (filters.orderNumber) {
      where.orderNumber = {
        contains: filters.orderNumber,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.expectedDeliveryDate = {};

      if (filters.startDate) {
        where.expectedDeliveryDate.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.expectedDeliveryDate.lte = filters.endDate;
      }
    }

    return where;
  }

  static buildOrderByClause(
    sortBy: OrderFilterParams['sortBy'],
    sortOrder: OrderFilterParams['sortOrder'],
  ): Prisma.OrderOrderByWithRelationInput {
    return {
      [sortBy]: sortOrder,
    };
  }
}

export { OrderStatus };
