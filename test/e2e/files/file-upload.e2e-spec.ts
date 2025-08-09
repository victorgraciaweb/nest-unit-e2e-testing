import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../../src/app.module';

describe('FilesModule - (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should throw a 400 error if no file selected', async () => {
    const response = await request(app.getHttpServer()).post('/files/product');

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
        message: 'Make sure that the file is an image',
        error: 'Bad Request',
        statusCode: 400
    });
  })
});