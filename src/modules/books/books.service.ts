import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import { BooksInterface } from './interfaces/books.interface'
import { BooksQueryDto } from './dto/books-query.dto'
import BooksEntity from './entities/books.entity'

import { BOOKS, RMQService } from '../../microservice.constants'

import { PaginationResponseInterface } from '../../interfaces/pagination.interface'

@Injectable()
export class BooksService {
  @Inject(RMQService.Books) private readonly booksService: ClientProxy

  async getByObjectId(objectId: string): Promise<BooksInterface> {
    return lastValueFrom(
      this.booksService.send(
        {
          cmd: BOOKS,
          method: 'getByObjectId',
        },
        objectId,
      ),
    )
  }

  async getPagination(
    query: BooksQueryDto,
  ): Promise<PaginationResponseInterface<BooksEntity>> {
    return lastValueFrom(
      this.booksService.send(
        {
          cmd: BOOKS,
          method: 'getPagination',
        },
        query,
      ),
    )
  }
}
