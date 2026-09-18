import { NestFactory } from '@nestjs/core';
import { AppModule} from './app.module';
import supertokens from 'supertokens-node';
import { middleware } from 'supertokens-node/framework/express';
import { AuthFilter } from './auth/auth.filter';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  app.use(middleware());
  app.useGlobalFilters(new AuthFilter(), new GlobalExceptionFilter());
  await app.listen(3000);
}
void bootstrap();
