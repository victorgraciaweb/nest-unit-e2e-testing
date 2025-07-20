import { JwtPayload } from "./jwt-payload.interface"

describe('JwtPayload interface', ()=>{
    it('Should return true for valid payload', ()=>{
        const validPayload: JwtPayload = {id: 'test'}

        expect(validPayload.id).toEqual('test')
    })
})