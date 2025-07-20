import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto, LoginUserDto } from "./dto";
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

describe('AuthService', ()=>{
    let authService: AuthService;
    let userRepository: Repository<User>;
    let jwtService: JwtService;
    
    beforeEach(async () => {

        const mockUserRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn()
        }

        const mockJwtService = {
            sign: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                AuthService
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);
    })

    describe('Definition checks', () => {
        it('Should be defined', ()=>{
            expect(authService).toBeDefined();
        })

        it('Should be userRepository defined', ()=>{
            expect(userRepository).toBeDefined();
        })

        it('Should be jwtService defined', ()=>{
            expect(jwtService).toBeDefined();
        })
    })

    describe('create', () => {
        it('Should create user and return user with token', async ()=>{
            const createUserDto: CreateUserDto = {
                email: 'test@test.com',
                password: 'password',
                fullName: 'Test Test'
            }

            const hashedPassword = 'hashedPassword';

            const userMock = {
                id: 'ID',
                email: createUserDto.email,
                password: hashedPassword,
                fullName: createUserDto.fullName,
                isActive: true,
                roles: ['user']
            } as User;

            const jwtToken = 'jwt-token';

            jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashedPassword);
            jest.spyOn(userRepository, 'create').mockReturnValue(userMock);
            jest.spyOn(jwtService, 'sign').mockReturnValue(jwtToken);

            const result = await authService.create(createUserDto);

            expect(userRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: hashedPassword,
            });
            
            expect(bcrypt.hashSync).toHaveBeenCalledWith(
                createUserDto.password,
                10
            );
            
            expect(userRepository.save).toHaveBeenCalledWith(userMock);
            expect(result).toEqual({
                user: userMock, 
                token: jwtToken
            })
        })

        it('Should throw an error if email alreay exist', async ()=>{
            const createUserDto: CreateUserDto = {
                email: 'test@test.com',
                password: 'password',
                fullName: 'Test Test'
            }

            jest.spyOn(userRepository, 'save').mockRejectedValue({
                code: '23505',
                detail: 'email already exist'
            });
            
            await expect(authService.create(createUserDto)).rejects.toThrow(BadRequestException);
            await expect(authService.create(createUserDto)).rejects.toThrow('email already exist');
        })

        it('Should throw an error internal server error', async ()=>{
            const createUserDto: CreateUserDto = {
                email: 'test@test.com',
                password: 'password',
                fullName: 'Test Test'
            }

            const mockLog = {
                code: '500',
                detail: 'Please check server logs'
            }

            jest.spyOn(userRepository, 'save').mockRejectedValue(mockLog);
            const logSpy = jest.spyOn(console, 'log').mockImplementation(()=>{});
            
            await expect(authService.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
            await expect(authService.create(createUserDto)).rejects.toThrow('Please check server logs');
            expect(console.log).toHaveBeenCalledWith(mockLog);

            logSpy.mockRestore();
        })
    })

    describe('login', ()=>{
        const loginUserDto: LoginUserDto = {
            email: 'email',
            password: 'password'
        }

        const userMock = {
            id: 'ID',
            ...loginUserDto,
            fullName: 'name',
            isActive: true,
            roles: ['user']
        } as User;

        it('Should login and return token', async ()=>{
            const jwtToken = 'jwt-token';

            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock);
            jest.spyOn(jwtService, 'sign').mockReturnValue(jwtToken);

            const result = await authService.login(loginUserDto);

            const { password: _, ...userWithoutPassword } = userMock;

            expect(result).toEqual({
                user: userWithoutPassword, 
                token: jwtToken
            })
        })

        it('Should throw UnauthorizedException error with email incorrect', async ()=>{
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(authService.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
            await expect(authService.login(loginUserDto)).rejects.toThrow('Credentials are not valid (email)');
        })

        it('Should throw UnauthorizedException error with password incorrect', async ()=>{
            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock);

            await expect(authService.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
            await expect(authService.login(loginUserDto)).rejects.toThrow('Credentials are not valid (password)');
        })
    })

    describe('checkAuthStatus', ()=>{
        const userMock = {
            id: 'ID',
            email: 'email',
            password: 'password',
            fullName: 'name',
            isActive: true,
            roles: ['user']
        } as User;

        it('Should check auth status and return user with new token', async ()=>{            
            const jwtToken = 'jwt-token';

            jest.spyOn(jwtService, 'sign').mockReturnValue(jwtToken);

            const result = await authService.checkAuthStatus(userMock);
            expect(result).toEqual({
                user: userMock, 
                token: jwtToken
            })
        })
    })
})