import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // You will need this for nextauth on a production environment.
  // Trust me, I spent 12 hours crying on this
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXTAUTH_URL
        : 'http://localhost:3001',
    credentials: true,
  });

  // Easy API docs
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription(
      "This Swagger API documents the routes for ft_transcendence's backend",
    )
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document);

  /**
   * Remember to add Prisma NestJS enableShutdownHooks.
   */

  await app.listen(3000);
  console.log(`✅ Server listening on port 3000`);
}
bootstrap();
