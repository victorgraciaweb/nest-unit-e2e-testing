import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

import { validate } from 'uuid';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

const testingAdmin = {
  email: 'testing.admin@google.com',
  password: 'Abc12345',
  fullName: 'Testing admin',
};

describe('AuthModule Private (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  let tokenUser: string;
  let tokenAdmin: string;

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
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdmin.email });

    const responseUser = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testingUser);

    const responseAdmin = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testingAdmin);

    await userRepository.update(
      { email: testingAdmin.email },
      { roles: ['admin'] }
    );

    tokenUser = responseUser.body.token;
    tokenAdmin = responseAdmin.body.token;
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdmin.email });
    await app.close();
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .send();

    expect(response.status).toEqual(401)
  });

  it('should return new token and user if token is provided', async () => {
    await new Promise((resolve) =>{
        setTimeout(()=>{
            resolve(true);
        }, 1000)
    })

    const response = await request(app.getHttpServer())
      .get('/auth/check-status')
      .set('Authorization', `Bearer ${tokenUser}`);

      const responseToken = response.body.token;

      expect(response.status).toEqual(200); 
      expect(responseToken).not.toEqual(tokenUser);
  });

  it('should return custom object if any token is valid', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .set('Authorization', `Bearer ${tokenUser}`);
      
    expect(response.body).toMatchObject({
      'ok': true,
      'message': 'Hola Mundo Private',
      'user': {
          'id': expect.any(String),
          'email': testingUser.email,
          'fullName': testingUser.fullName,
          'isActive': true,
          'roles': [
              'user'
          ]
      },
      'userEmail': testingUser.email,
      'rawHeaders': expect.any(Array),
      'headers': expect.any(Object)
    });
  });

  it('should return 403 if token is provided but no admin token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(response.status).toEqual(403)
  });

  it('should return user if admin token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const userId = response.body.user.id;  

    expect(response.status).toEqual(200);
    expect(validate(userId)).toBe(true);
    expect(response.body).toEqual({
      ok: true,
      user: {
        id: expect.any(String),
        email: testingAdmin.email,
        fullName: testingAdmin.fullName,
        isActive: true,
        roles: [ 'admin' ]
      }
    });
  });
});