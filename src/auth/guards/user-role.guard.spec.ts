import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRoleGuard } from './user-role.guard';
import { Reflector } from '@nestjs/core';
import { ValidRoles } from '../interfaces';

describe('UserRoleGuard', () => {
    let guard: UserRoleGuard;
    let reflector: Reflector;
    let mockContext: ExecutionContext;

    beforeEach(()=>{
        reflector = new Reflector();
        guard = new UserRoleGuard(reflector);
        
        mockContext = {
            getHandler: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({}),
            }),
        } as unknown as ExecutionContext;
    })

    it('Should return true if not exist roles', ()=>{
        jest.spyOn(reflector, 'get').mockReturnValue(undefined);
        expect(guard.canActivate(mockContext)).toEqual(true);
    })

    it('Should return true if array roles is exist but is empty', ()=>{
        jest.spyOn(reflector, 'get').mockReturnValue([]);
        expect(guard.canActivate(mockContext)).toEqual(true);
    })

    it('Should throw BadRequest exception if user not found', ()=>{
        jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.superUser, ValidRoles.user]);
        expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    })

    it('Should return true if user exist and has role required', ()=>{
        const user = { id: 1, name: 'User Test', roles: [ValidRoles.superUser]}

        jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.superUser, ValidRoles.user]);
        jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({user});

        expect(guard.canActivate(mockContext)).toEqual(true);
    })

    it('Should throw ForbiddenException if user did not have role required', ()=>{
        const user = { id: 1, name: 'User Test', roles: [ValidRoles.admin]}
       
        jest.spyOn(reflector, 'get').mockReturnValue([ValidRoles.superUser, ValidRoles.user]);
        jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({user});

        expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    })
})