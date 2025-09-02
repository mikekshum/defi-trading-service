import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger docs setup
  if (process.env.NODE_ENV != 'production') {
    const config = new DocumentBuilder()
      .setTitle('1inch + Mike Shum = <3 | Test Assignment')
      .setDescription('A backend microservice for DeFi trading and on-chain data aggregation')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
