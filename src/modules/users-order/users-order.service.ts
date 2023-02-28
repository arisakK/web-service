import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import { UsersHistoryQueryDto } from '../users/dto/users-history-query.dto'
import UsersOrderHistoryQueryEntity from './entities/users-order-history-query.entity'
import { CreateOrderInterface } from './interfaces/create-order.interface'

import { RMQService, USERS_ORDER } from '../../microservice.constants'

@Injectable()
export class UsersOrderService {
  @Inject(RMQService.Books) private readonly usersOrderService: ClientProxy

  async createOrder(body: CreateOrderInterface) {
    return this.usersOrderService.emit(
      {
        cmd: USERS_ORDER,
        method: 'create-order',
      },
      body,
    )
  }
  async topSeller(): Promise<any> {
    return lastValueFrom(
      this.usersOrderService.send(
        {
          cmd: USERS_ORDER,
          method: 'topSeller',
        },
        {},
      ),
    )
  }

  async topSellerByGenre(): Promise<any> {
    return lastValueFrom(
      this.usersOrderService.send(
        {
          cmd: USERS_ORDER,
          method: 'topSellerByGenre',
        },
        {},
      ),
    )
  }

  async getHistoryByOrder(
    objectId: string,
    query: UsersHistoryQueryDto,
  ): Promise<UsersOrderHistoryQueryEntity> {
    return lastValueFrom(
      this.usersOrderService.send(
        {
          cmd: USERS_ORDER,
          method: 'getHistoryByOrder',
        },
        {
          objectId,
          body: query,
        },
      ),
    )
  }
}
