import {
  CACHE_MANAGER,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import bcrypt from 'bcrypt'
import { AuthGuard } from '@nestjs/passport'
import Cache from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { LoggerService } from '../../logger/logger.service'
import { UsersInterface } from '../../users/interface/users.interface'
import { UsersService } from '../../users/users.service'
import { SignInDto } from '../dto/sign-in.dto'

@Injectable()
export class SignIdAuthGuard extends AuthGuard('jwt') {
  private readonly logger: LoggerService = new LoggerService(
    SignIdAuthGuard.name,
  )

  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache

  constructor(private readonly usersService: UsersService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const body = plainToInstance(SignInDto, request.body)

    let user: UsersInterface
    try {
      user = await this.usersService.getByUsername(body.username)
    } catch (e) {
      this.logger.error(e?.message ?? JSON.stringify(e))
      throw new InternalServerErrorException({
        message: e?.message ?? JSON.stringify(e),
      })
    }
    if (!user) {
      throw new UnprocessableEntityException('Not Found User.')
    }

    const counter =
      (await this.cacheManager.get(`login-failures:${user.username}`)) || 0

    if (counter >= 3) {
      throw new UnauthorizedException(
        'Login blocked due to too many failed attempts',
      )
    }

    const matchPassword = await bcrypt.compare(body.password, user.password)
    if (!matchPassword) {
      await this.cacheManager.set(
        `login-failures:${user.username}`,
        counter + 1,
        {
          ttl: 1800,
        },
      )
      throw new UnprocessableEntityException(
        `Password are not valid ${counter + 1}.`,
      )
    }

    await this.cacheManager.del(`login-failures:${user.username}`)
    return true
  }
}
