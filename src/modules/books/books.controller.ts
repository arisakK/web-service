import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BooksService } from './books.service'
import { BooksQueryDto } from './dto/books-query.dto'
import BooksQueryEntity from './entities/books-query.entity'
import BooksEntity from './entities/books.entity'
import { BooksInterface } from './interfaces/books.interface'
import { BooksValidationPipe } from './pipe/books-validation.pipe'

import { JwtGuard } from '../auth/guards/jwt.guard'
import { LoggerService } from '../logger/logger.service'
import { BooksUtil } from '../utils/books/index'

@Controller('books')
@ApiTags('books')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class BooksController {
  private readonly logger: LoggerService = new LoggerService(
    BooksController.name,
  )

  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: BooksQueryEntity,
  })
  async getPagination(
    @Query() query: BooksQueryDto,
  ): Promise<BooksQueryEntity> {
    const { genre, kSort, title } = query

    query.filter = BooksUtil.getQueryByCategory(genre)

    query.sort = BooksUtil.sort(kSort)

    if (title) {
      query.filter = { ...query.filter, title: { $regex: `${title}` } }
    }

    try {
      return this.booksService.getPagination(query)
    } catch (e) {
      this.logger.error(
        `catch on getPagination: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @Get('objectId')
  @ApiParam({
    type: String,
    name: 'objectId',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: BooksEntity,
  })
  async getByObjectId(
    @Param('objectId', BooksValidationPipe) book: BooksInterface,
  ): Promise<BooksEntity> {
    return book
  }
}
