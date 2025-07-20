import { SetMetadata } from "@nestjs/common";
import { ValidRoles } from "../interfaces";
import { META_ROLES, RoleProtected } from "./role-protected.decorator";

jest.mock('@nestjs/common', () => ({
    SetMetadata: jest.fn(),
}))

describe('RoleProtected decorator', ()=>{
    it('Should set metadata with correct roles', ()=>{
        const roles = [ValidRoles.admin, ValidRoles.superUser, ValidRoles.user];
        const result = RoleProtected(...roles);

        expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);
    })
})