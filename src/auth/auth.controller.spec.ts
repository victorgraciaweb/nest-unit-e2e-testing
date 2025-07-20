import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from "@nestjs/passport";
import { CreateUserDto, LoginUserDto } from "./dto";
import { User } from "./entities/user.entity";
import { IncomingHttpHeaders } from "http";

describe('AuthController', ()=>{

    let authController: AuthController;
    let authService: AuthService;
    
    const mockUser = {
        email: 'Test',
        password: '1234',
        fullName: 'Test Test'
    } as User;

    const mockAuthService = {
        create: jest.fn(),
        login: jest.fn(),
        checkAuthStatus: jest.fn(),
    };

    beforeEach(async () => {
        mockAuthService.create.mockResolvedValue(mockUser);
        mockAuthService.login.mockResolvedValue({ user: mockUser, token: 'mocked-jwt-token' });
        mockAuthService.checkAuthStatus.mockResolvedValue({ user: mockUser, token: 'mocked-jwt-token' });

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService
                },
            ],
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }),
            ]
        }).compile();

        authController = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService);
    })

    it('Should be defined', ()=>{
        expect(authController).toBeDefined();
    })

    it('Should create user with proper DTO', async ()=>{
        const createUserDto: CreateUserDto = {
            email: 'test@test.com',
            password: '1234',
            fullName: 'Test Test',
        };
        
        const result = await authController.createUser(createUserDto);
        expect(authService.create).toHaveBeenCalledWith(createUserDto);
        expect(result).toEqual(mockUser);
    })

    it('Should return user with proper DTO', async ()=>{
        const loginUserDto: LoginUserDto = {
            email: 'test@test.com',
            password: '1234',
        };
        
        const result = await authController.loginUser(loginUserDto);
        expect(authService.login).toHaveBeenCalledWith(loginUserDto);
        expect(result).toEqual({ user: mockUser, token: 'mocked-jwt-token' });
    })

    it('Should check user with proper DTO', async ()=>{      
        const result = await authController.checkAuthStatus(mockUser);
        expect(authService.checkAuthStatus).toHaveBeenCalledWith(mockUser);
        expect(result).toEqual({ user: mockUser, token: 'mocked-jwt-token' });
    })

    it('Should return private route data', ()=>{     
        const request: Express.Request = null;
        const rawHeaders: string[] = [
            'header1: value1', 
            'header2: value2'
        ];
        const headers: IncomingHttpHeaders = {
            header1: 'value1', 
            header2: 'value2'
        };

        const result = authController.testingPrivateRoute(
            request,
            mockUser,
            mockUser.email,
            rawHeaders,
            headers
        );
        expect(result).toEqual({
            ok: true,
            message: 'Hola Mundo Private',
            user: mockUser,
            userEmail: mockUser.email,
            rawHeaders,
            headers
        });
    })
})