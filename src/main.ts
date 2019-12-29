import {
  CorsOptions,
  CustomOrigin,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
// import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as helmet from 'helmet';

// import { CookieMiddleware } from './@common/middlewares/cookie.middleware';
// import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { AppModule } from './app.module';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || process.env.HOSTNAME || 'localhost';
const SCHEMA = IS_PROD ? 'https' : 'http';

const whitelist = [
  'https://altiore.org', // production
  'https://staging-altiore.herokuapp.com', // staging
  'https://staging-altiore-api.herokuapp.com', // staging for swagger
  'http://localhost:8181', // localhost
  'http://192.168.1.37:8181',
];
const corsOptions = {
  allowedHeaders: 'Authorization,Accept,Content-Type',
  credentials: true,
  exposedHeaders: 'Authorization',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  origin: IS_PROD
    ? (function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } as CustomOrigin)
    : true,
} as CorsOptions;

async function bootstrap() {
  // const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOptions);
  // app.use(new CookieMiddleware().use);
  // app.useWebSocketAdapter(new RedisIoAdapter(app));
  // app.use(helmet());
  app.setGlobalPrefix('v1');

  const options = new DocumentBuilder()
    .setTitle('Altiore')
    .setDescription('Altiore API documentation')
    .setVersion('1.0')
    .addBearerAuth('Authorization', 'header')
    .setSchemes(SCHEMA)
    .setBasePath('v1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(
    PORT,
    // '0.0.0.0',
    /* tslint:disable */
    () =>
      process.env.NODE_ENV !== 'production' &&
      console.log(`Listening on ${SCHEMA}://${HOST}:${PORT}/api/`)
  );
}

bootstrap();
