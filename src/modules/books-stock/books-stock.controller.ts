import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BooksStockService } from './books-stock.service'
import { BooksStockQueryDto } from './dto/books-stock-query.dto'
import BooksStockQueryEntity from './entities/books-stock-query.entity'
import BooksStockEntity from './entities/books-stock.entity'
import EGenre from './enum/genre.enum'

import { JwtGuard } from '../auth/guards/jwt.guard'
import { LoggerService } from '../logger/logger.service'
import { UsersOrderInterface } from '../users-order/interfaces/users-order.interface'
import { UsersOrderService } from '../users-order/users-order.service'
import { BooksStockUtils } from '../utils/books-stock'
import { BooksUtil } from '../utils/books/index'

@Controller('books-stock')
@ApiTags('bookStock')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class BooksStockController {
  private readonly logger: LoggerService = new LoggerService(
    BooksStockController.name,
  )

  constructor(
    private readonly booksStockService: BooksStockService,
    private readonly userOrderService: UsersOrderService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: BooksStockQueryEntity,
  })
  async getPagination(
    @Query() query: BooksStockQueryDto,
  ): Promise<BooksStockQueryEntity> {
    const { filter, kSort, title } = query

    query.sort = BooksUtil.sort(kSort) as Record<string, any>

    if (title) {
      filter.title = { $regex: `${title}` }
    }
    try {
      return await this.booksStockService.getPagination(query)
    } catch (e) {
      this.logger.error(
        `catch on getPagination: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @Get('top-sale')
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  async reportTopSale(): Promise<any> {
    try {
      return this.userOrderService.topSeller()
    } catch (e) {
      this.logger.error(`catch on top-sale: ${e?.message ?? JSON.stringify(e)}`)
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @Get('top-sale-genre')
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  async reportTopSaleByGenre(): Promise<any> {
    let order: UsersOrderInterface[]
    try {
      order = await this.userOrderService.topSellerByGenre()

      return BooksStockUtils.getTopSellerGenre(EGenre, order)
    } catch (e) {
      this.logger.error(
        `catch on reportByCategory: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }
}
