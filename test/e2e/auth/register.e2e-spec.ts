import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

describe('AuthModule - Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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
    
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Removed users if exist
    await userRepository.delete({email: testingUser.email});
  });

  afterEach(async () => {
    // Removed users if exist
    await userRepository.delete({email: testingUser.email});
    await app.close();
  });

  it('/auth/register (POST) - no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
      'fullName must be longer than or equal to 1 characters',
      'fullName must be a string'
    ];
        
    expect(response.status).toEqual(400);
    errorMessages.forEach(message => {
        expect(response.body.message).toContain(message);
    });
  });

  it('/auth/register (POST) - same email', async () => {
    const responseSuccessfully = await request(app.getHttpServer())
    .post('/auth/register')
    .send(testingUser);

    // We make sure user was register already
    expect(responseSuccessfully.status).toEqual(201);

    const responseError = await request(app.getHttpServer())
    .post('/auth/register')
    .send(testingUser);

    // We can check user was register already
    expect(responseError.status).toEqual(400);
    expect(responseError.body.message).toEqual(`Key (email)=(${testingUser.email}) already exists.`)
  });

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: testingUser.email,
      password: 'no-valid-password',
      fullName: testingUser.fullName,
    });

    expect(response.status).toEqual(400);
    expect(response.body.message).toContain(
      'The password must have a Uppercase, lowercase letter and a number'
    );
  });

  it('/auth/register (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(testingUser);

    expect(response.status).toEqual(201);
  });
});