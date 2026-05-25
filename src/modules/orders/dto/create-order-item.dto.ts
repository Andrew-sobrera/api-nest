import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'Notebook Dell Inspiron 15' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: 3499.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}
