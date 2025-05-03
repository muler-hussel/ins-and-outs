import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env file');
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
