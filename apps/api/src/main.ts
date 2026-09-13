import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cross-origin requests for your Vite frontend application
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // Crucial for auto-casting URL query string numbers
      },
    }),
  );

  // 🛠️ Swagger UI Configuration
  const config = new DocumentBuilder()
    .setTitle('Deepledger API Engine')
    .setDescription(
      'The complete, secured backend ledger and balance calculation engine documentation.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter your valid user accessToken string here to authenticate your ledger actions.',
        in: 'header',
      },
      'JWT-auth', // Absolute unique link token identifier
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Maps the interactive UI panel directly to http://localhost:5000/docs

  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
