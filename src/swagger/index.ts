import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('Web BookShop API')
    .setDescription('Web BookShop API Document')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('')
    .addServer('/api')
    .addServer(`/api/${process.env.PROVIDER || ''}`)
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup(`${process.env.PROVIDER || ''}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
}
