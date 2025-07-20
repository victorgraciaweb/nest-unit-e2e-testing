import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', ()=>{
    it('Should have correct properties', async ()=>{
        const createUser = new CreateUserDto();
        createUser.email = 'test@gmail.com';
        createUser.password = 'password1234P&';
        createUser.fullName = 'name';

        const errors = await validate(createUser);
        expect(errors.length).toBe(0);
    })

    it('Should return error password not valid', async ()=>{
        const createUser = new CreateUserDto();
        createUser.email = 'test@gmail.com';
        createUser.password = 'password';
        createUser.fullName = 'name';

        const errors = await validate(createUser);
        
        const passwordError = errors.find(err => err.property === 'password');
        
        expect(passwordError).toBeDefined();
        expect(passwordError?.constraints).toBeDefined();
        expect(Object.values(passwordError!.constraints!)).toContainEqual(expect.stringContaining('password'));
    })
})