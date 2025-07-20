import { ValidRoles } from "./valid-roles"

describe('ValidRoles', ()=>{
    it('Should have correct values', ()=>{
        expect(ValidRoles.admin).toBe('admin');
        expect(ValidRoles.superUser).toBe('super-user');
        expect(ValidRoles.user).toBe('user');
    })

    it('Should contain all expected keys', ()=>{

        const keys: string[] = ['admin', 'superUser', 'user'];

        expect(Object.keys(ValidRoles)).toEqual(
            expect.arrayContaining(keys)
        )
    })

    it('Should contain all expected values', ()=>{

        const values: string[] = ['admin', 'super-user', 'user'];

        expect(Object.values(ValidRoles)).toEqual(
            expect.arrayContaining(values)
        )
    })
})