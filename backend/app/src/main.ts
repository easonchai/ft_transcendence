import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppExceptionFilter } from './exceptions/app_exception.filter';
import { SocketIOAdapter } from './app_socket_io.adapter';
import { NextFunction } from 'express';
import { AuthGuard } from './guards/auth.guards';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
	
	// class-validator
	app.useGlobalPipes(new ValidationPipe());
	
	app.useGlobalFilters(new AppExceptionFilter(app.get(HttpAdapterHost)));

  // You will need this for nextauth on a production environment.
  // Trust me, I spent 12 hours crying on this
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXTAUTH_URL
        : 'http://localhost:3001',
    credentials: true,
  });
	
	app.useWebSocketAdapter(new SocketIOAdapter(app));

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

	app.use(cookieParser());
  /**
   * Remember to add Prisma NestJS enableShutdownHooks.
   */

	app.use((req: Request, res: Response, next: NextFunction) => {
		Logger.log(`Request`, req.url);
		Logger.log(`Response`, res);
		next();
	})

  await app.listen(3000);
  console.log(`✅ Server listening on port 3000`);
}
bootstrap();
