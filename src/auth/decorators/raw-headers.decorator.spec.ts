import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getRawHeaders } from "./raw-headers.decorator";

jest.mock('@nestjs/common', () => ({
    createParamDecorator: jest.fn(),
}))

describe('RawHeaders decorator', () => {
    const mockRawHeaders = ['Autorization', 'Bearer Token'];
    const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
                rawHeaders: mockRawHeaders
            })
        })
    } as unknown as ExecutionContext

    it('Should return raw headers from the request', ()=>{
       const result = getRawHeaders('string', mockExecutionContext)

       expect(result).toEqual(mockRawHeaders);
    })

    it('Should call createParamDecorator with getRawHeaders', ()=>{
       expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
    })
})