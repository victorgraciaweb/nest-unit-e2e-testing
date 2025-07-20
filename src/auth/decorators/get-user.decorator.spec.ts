import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('getUser decorator', () => {
    const user = { id: 1, name: 'User Test'}
    
    const mockContextWithUser = {
        switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
        }),
    } as unknown as ExecutionContext;

    it('Should return user[name] from the request when data (name) is provided', () => {
        const result = getUser('name', mockContextWithUser);
        expect(result).toEqual(user.name);
    });

    it('Should return user[id] from the request when data (id) is provided', () => {
        const result = getUser('id', mockContextWithUser);
        expect(result).toEqual(user.id);
    });

    it('Should return user from the request when data is not provided', () => {
        const result = getUser(null, mockContextWithUser);
        expect(result).toEqual(user);
    });

    it('Should throw error if no user is in request', () => {
         const mockContextWithoutUser = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({}),
            }),
        } as unknown as ExecutionContext;

        try {
            getUser(null, mockContextWithoutUser);
            expect(true).toBe(false);
        } catch(error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
        }
    });
})