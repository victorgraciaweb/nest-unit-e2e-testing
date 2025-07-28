import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../../src/app.module';

describe('Auth - login', () => {
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

  afterAll(()=>{
    app.close();
  })

  it('/auth/login (POST) - should throw 400 if no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string'
    ];
    
    expect(response.status).toEqual(400);

    errorMessages.forEach(message => {
        expect(response.body.message).toContain(message);
    });
  });

  it('/auth/login (POST) - wrong email', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(
      {
        "email": "no-exist@gmail.com",
        "password": "123456abcABC"
      }
    );

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Credentials are not valid (email)');
  });

  it('/auth/login (POST) - wrong password', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(
      {
        "email": "test1@google.com",
        "password": "123456abcABC"
      }
    );

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Credentials are not valid (password)')
  });

  it('/auth/login (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(
      {
        "email": "test1@google.com",
        "password": "Abc123"
      }
    );

    const { user, token } = response.body;

    expect(response.status).toEqual(201);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email', 'test1@google.com');
    expect(user).toHaveProperty('fullName', 'Test One');
    expect(user).toHaveProperty('isActive', true);
    expect(user).toHaveProperty('roles');
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user.roles).toContain('admin');

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });
});
