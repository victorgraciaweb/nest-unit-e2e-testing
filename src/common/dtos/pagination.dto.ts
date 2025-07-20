import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsIn, isIn, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enableImplicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // enableImplicitConversions: true
  offset?: number;

  @ApiProperty({
    default: '',
    description: 'Filter results by gender',
  })
  @IsOptional()
  @IsIn(['men', 'women', 'unisex', 'kid'])
  gender: 'men' | 'women' | 'unisex' | 'kid';
}
