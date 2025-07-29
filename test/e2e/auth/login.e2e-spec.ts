import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@gmail.com', 
  password: 'Abc123',
  fullName: 'Test User'
} as User

const testingAdmin = {
  email: 'testing.admin@gmail.com', 
  password: 'Abc123',
  fullName: 'Test Admin'
} as User

describe('Auth - login', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
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
    userRepository.delete({email: testingUser.email});
    userRepository.delete({email: testingAdmin.email});

    // Added user for testing
    await request(app.getHttpServer())
    .post('/auth/register')
    .send(testingUser);

    const result = await request(app.getHttpServer())
    .post('/auth/register')
    .send(testingAdmin);

    // Updated testingAdmin with properly roles ('user') by default
    userRepository.update(
      { email: testingAdmin.email },
      { roles: ['admin'] }
    )
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdmin.email });

    await app.close();
  });

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
        "password": testingUser.password
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
        "email": testingUser.email,
        "password": 'Abc123-ERROR'
      }
    );

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Credentials are not valid (password)')
  });

  it('/auth/login (POST) - valid credentials (user rol)', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(
      {
        "email": testingUser.email,
        "password": testingUser.password
      }
    );

    const { user, token } = response.body;

    expect(response.status).toEqual(201);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('fullName');
    expect(user).toHaveProperty('isActive', true);
    expect(user).toHaveProperty('roles');
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user.roles).toContain('user');

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('/auth/login (POST) - valid credentials (admin rol)', async () => {
    const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(
      {
        "email": testingAdmin.email,
        "password": testingAdmin.password
      }
    );

    const { user, token } = response.body;

    expect(response.status).toEqual(201);
    expect(user).toHaveProperty('roles');
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user.roles).toContain('admin');
  });
});
