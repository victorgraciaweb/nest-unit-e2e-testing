import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { plainToClass } from 'class-transformer';
describe('PaginationDto', ()=>{
    it('Should pass without parameters', async ()=>{
        const paginationDto = new PaginationDto();
    
        const errors = await validate(paginationDto);
        expect(paginationDto).toBeDefined();
        expect(errors.length).toBe(0);
    })

    it('Should have correct properties', async ()=>{
        const paginationDto = new PaginationDto();
        paginationDto.limit = 10;
        paginationDto.offset = 2;
        paginationDto.gender = 'men';

        const errors = await validate(paginationDto);
        expect(errors.length).toBe(0);
    })

    it('Should validate limit as positive number', async ()=>{
        const dto = plainToClass(PaginationDto, { limit: -3 })
        const errors = await validate(dto);
        const limitError = errors.find(err => err.property === 'limit');
        
        expect(limitError).toBeDefined();
        expect(limitError?.constraints).toBeDefined();
        expect(errors.length).toBeGreaterThan(0);
    })

    it('Should validate offset as positive number', async ()=>{
        const dto = plainToClass(PaginationDto, { offset: -3 })
        const errors = await validate(dto);
        const offsetError = errors.find(err => err.property === 'offset');
        
        expect(offsetError?.constraints.min).toBeDefined();
        expect(errors.length).toBeGreaterThan(0);
    })

    it('Should validate gender with valid value', async ()=>{
        const dto = plainToClass(PaginationDto, { gender: 'men' })
        const errors = await validate(dto);

        expect(errors.length).toEqual(0);
    })

    it('Should validate gender with not valid value', async ()=>{
        const dto = plainToClass(PaginationDto, { gender: 'other' })
        const errors = await validate(dto);
        const genderError = errors.find(err => err.property === 'gender');

        expect(genderError?.constraints.isIn).toBeDefined();
        expect(errors.length).toBeGreaterThan(0);
    })
})