import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../app.module";
import { AuthService } from './auth.service';
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthModule', ()=>{

    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '2h' }
                }),
                AppModule
            ],
            providers: [
                {
                    provide: AuthService,
                    useValue: {}
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository
                },
                {
                    provide: ConfigService,
                    useValue: {}
                }
            ]
        }).compile();
    })

    beforeEach(() =>{
        module.close();
    })

    it('Should be defined', ()=>{
        expect(module).toBeDefined();
    })

    it('Should have AuthService as provider', () =>{
        const authService = module.get<AuthService>(AuthService)
        expect(authService).toBeDefined();
    })

    it('Should have AuthController as controller', () =>{
        const authController = module.get<AuthController>(AuthController)
        expect(authController).toBeDefined();
    })

    it('Should have JwtStrategy as provider', () =>{
        const jwtStrategy = module.get<JwtStrategy>(JwtStrategy)
        expect(jwtStrategy).toBeDefined();
    })

    it('Should have JwtModule as module', () =>{
        const jwtModule = module.get<JwtModule>(JwtModule)
        expect(jwtModule).toBeDefined();
    })
})