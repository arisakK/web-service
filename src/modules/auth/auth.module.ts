import { DynamicModule } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'

import { AuthController } from './auth.controller'
import { JwtStrategy } from './guards/jwt.strategy'

import { UsersService } from '../users/users.service'

import { RMQService } from '../../microservice.constants'
import { MakeRMQServiceProvider } from '../../microservice.providers'

export class AuthModule {
  static register(): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        ClientsModule.register([MakeRMQServiceProvider(RMQService.Users)]),
      ],
      controllers: [AuthController],
      providers: [JwtStrategy, UsersService],
    }
  }
}
