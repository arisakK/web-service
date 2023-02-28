import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import compression from 'compression'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import timezone from 'dayjs/plugin/timezone'

import { getQueueName } from './microservice.providers'
import { AppModule } from './modules/app/app.module'
import { setupSwagger } from './swagger'

dayjs.extend(isToday)
dayjs.extend(timezone)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get<number>('port')
  const provider = configService.get<string>('provider')
  const logger = new Logger()

  app.use(compression())

  if (process.env.ENABLE_SWAGGER_API_DOCUMENT === '1') {
    setupSwagger(app)
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ],
      queue: getQueueName(provider),
      queueOptions: {
        durable: false,
      },
    },
  })

  await app.startAllMicroservices()
  await app.listen(port, () => {
    logger.log(`
      Application ${provider} started listen on port ${port}
      Local Timezone guess: ${dayjs.tz.guess()}
      Local Date: ${dayjs().toDate().toISOString()} ~ ${dayjs().format(
      'YYYY-MM-DD HH:mm:ss',
    )}
    `)
  })
}
bootstrap()
