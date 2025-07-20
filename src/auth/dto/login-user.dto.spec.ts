import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

describe('LoginUserDto', ()=>{
    it('Should have correct properties', async ()=>{
        const loginUser = new LoginUserDto();
        loginUser.email = 'test@gmail.com';
        loginUser.password = 'password1234P&';

        const errors = await validate(loginUser);
        expect(errors.length).toBe(0);
    })

    it('Should return error password not valid', async ()=>{
        const loginUser = new LoginUserDto();
        loginUser.email = 'test@gmail.com';
        loginUser.password = 'password';

        const errors = await validate(loginUser);
        
        const passwordError = errors.find(err => err.property === 'password');
        
        expect(passwordError).toBeDefined();
        expect(passwordError?.constraints).toBeDefined();
        expect(Object.values(passwordError!.constraints!)).toContainEqual(expect.stringContaining('password'));
    })
})