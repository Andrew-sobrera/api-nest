import { OrderStatus } from '@prisma/client';

export { OrderStatus };

export interface OrderItemEntity {
  id: string;
  description: string;
  price: number;
  orderId: string;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  expectedDeliveryDate: Date;
  customerName: string;
  customerDocument: string;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: OrderItemEntity[];
}

export interface OrderItemInput {
  description: string;
  price: number;
}

export interface CreateOrderInput {
  expectedDeliveryDate: Date;
  customerName: string;
  customerDocument: string;
  deliveryAddress: string;
  status?: OrderStatus;
  items: OrderItemInput[];
}

export interface UpdateOrderInput {
  expectedDeliveryDate?: Date;
  customerName?: string;
  customerDocument?: string;
  deliveryAddress?: string;
  status?: OrderStatus;
  items?: OrderItemInput[];
}

export interface OrderFilterParams {
  orderNumber?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
  skip: number;
  sortBy: 'createdAt' | 'expectedDeliveryDate' | 'orderNumber' | 'status';
  sortOrder: 'asc' | 'desc';
}
