import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, Observable } from 'rxjs'

import { BooksStockQueryDto } from './dto/books-stock-query.dto'
import BooksStockEntity from './entities/books-stock.entity'
import { BooksStockInterface } from './interfaces/books-stock.interface'
import { UpdateBooksStockInterface } from './interfaces/update-books-stock.interface'

import { BOOKS_STOCK, RMQService } from '../../microservice.constants'
import { PaginationResponseInterface } from '../../interfaces/pagination.interface'

@Injectable()
export class BooksStockService {
  @Inject(RMQService.Books) private readonly booksStockService: ClientProxy

  async getPagination(
    query: BooksStockQueryDto,
  ): Promise<PaginationResponseInterface<BooksStockEntity>> {
    return lastValueFrom(
      this.booksStockService.send(
        {
          cmd: BOOKS_STOCK,
          method: 'getPagination',
        },
        query,
      ),
    )
  }

  async getByBookId(bookId: string): Promise<BooksStockInterface> {
    return lastValueFrom(
      this.booksStockService.send(
        {
          cmd: BOOKS_STOCK,
          method: 'getByBookId',
        },
        bookId,
      ),
    )
  }

  updateStock(
    objectId: string,
    body: UpdateBooksStockInterface,
  ): Observable<any> {
    return this.booksStockService.emit(
      {
        cmd: BOOKS_STOCK,
        method: 'update-stock',
      },
      {
        objectId,
        body,
      },
    )
  }
}
