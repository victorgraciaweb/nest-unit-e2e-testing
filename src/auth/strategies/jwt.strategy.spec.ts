import { Test, TestingModule } from "@nestjs/testing"
import { JwtStrategy } from "./jwt.strategy";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interfaces";

describe('JwtStrategy', ()=>{

    let strategy: JwtStrategy;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const mockUserRepository = {
            findOneBy: jest.fn()
        }

        const mockConfigService = {
            get: jest.fn().mockReturnValue('JWT_SECRET')
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    })

    it('Should be defined', ()=>{
        expect(strategy).toBeDefined();
    })

    it('Should throw UnauthorizedException for token not valid', async ()=>{
        const payload: JwtPayload = { id: 'test' };
        jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
        await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    })

    it('Should throw UnauthorizedException for user not active', async ()=>{
        const payload: JwtPayload = { id: 'test' };
        const mockUser = {
            isActive: false
        } as User;

        jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
        await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    })

    it('Should return user valid if exist and isActive is true', async ()=>{
        const payload: JwtPayload = { id: 'test' };
        const mockUser = {
            isActive: true
        } as User;

        jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
        await expect(strategy.validate(payload)).resolves.toEqual(mockUser);
        expect(userRepository.findOneBy).toHaveBeenCalledWith(payload);
    })
})