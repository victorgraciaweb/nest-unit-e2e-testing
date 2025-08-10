import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../../src/app.module';
import { join } from 'path';
import { existsSync, unlink, unlinkSync } from 'fs';

describe('FilesModule - (e2e)', () => {
  let app: INestApplication;
  let testImagePath = join(__dirname, '../../assets/test-image.jpg');

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

  it('Should throw a 400 error if file selected is not image', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', Buffer.from('File text example'), 'file.txt');

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
        message: 'Make sure that the file is an image',
        error: 'Bad Request',
        statusCode: 400
    });
  })

  it('Should upload image successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', testImagePath);

    const fileName = response.body.fileName;

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty('secureUrl');
    expect(response.body).toHaveProperty('fileName');

    const filePath = join(__dirname, '../../../static/products', fileName);
    const fileExists = existsSync(filePath);

    expect(fileExists).toBeTruthy();
    unlinkSync(filePath);
  });
});