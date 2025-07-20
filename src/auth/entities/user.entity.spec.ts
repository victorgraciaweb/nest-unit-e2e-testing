import { User } from "./user.entity"

describe('UserEntity', ()=>{
    it('Should create User instance', ()=>{
        const user = new User();
        user.email = 'test@gmail.com';

        expect(user).toBeInstanceOf(User);
        expect(user.email).toEqual('test@gmail.com');
    })

    it('Should format to LowerCase before register new user', ()=>{
        const user = new User();
        user.email = '     test@GmaIL.com '
        user.checkFieldsBeforeInsert();

        expect(user.email).toEqual('test@gmail.com');
    })

    it('Should format to LowerCase before update user', ()=>{
        const user = new User();
        user.email = '     test@GmaIL.com '
        user.checkFieldsBeforeUpdate();

        expect(user.email).toEqual('test@gmail.com');
    })
})