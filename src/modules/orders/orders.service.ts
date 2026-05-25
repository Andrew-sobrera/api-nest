import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  buildPaginationMeta,
  PaginatedResult,
  resolvePagination,
} from '../../shared/pagination/pagination.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersQueryDto } from './dto/filter-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const orderNumber = await this.generateOrderNumber();

    return this.ordersRepository.create(createOrderDto, orderNumber);
  }

  async findAll(
    query: FilterOrdersQueryDto,
  ): Promise<PaginatedResult<OrderEntity>> {
    this.validateDateRange(query.startDate, query.endDate);

    const pagination = resolvePagination(query.page, query.limit);
    const filters = {
      orderNumber: query.orderNumber,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      ...pagination,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    };

    const [items, total] = await Promise.all([
      this.ordersRepository.findMany(filters),
      this.ordersRepository.count(filters),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderEntity> {
    await this.findOne(id);
    return this.ordersRepository.update(id, updateOrderDto);
  }

  async remove(id: string): Promise<OrderEntity> {
    await this.findOne(id);
    return this.ordersRepository.softDelete(id);
  }

  private validateDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'startDate must be less than or equal to endDate',
      );
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const totalOrders = await this.ordersRepository.countAll();
    const sequence = String(totalOrders + 1).padStart(4, '0');

    return `ORD-${datePart}-${sequence}`;
  }
}
