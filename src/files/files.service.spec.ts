import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';
import { FilesService } from "./files.service"

jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn()
}));

describe('FilesService', ()=>{

    let service: FilesService;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [FilesService]
        }).compile();

        service = module.get<FilesService>(FilesService);
    })

    it('Should be defined', ()=>{
        expect(service).toBeDefined();
    })

    describe('getStaticProductImage', ()=>{
        const filename = 'example.png';
        const expectedPath = `./static/products/${filename}`;

        it('Should return image path if exist', ()=>{
            jest.spyOn(path, 'join').mockReturnValue(expectedPath);
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);

            const result = service.getStaticProductImage(filename);
            expect(path.join).toHaveBeenCalledWith(__dirname, '../../static/products', filename);
            expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
            expect(result).toEqual(expectedPath);
        })

        it('Should return BadRequestException if image route not exist', ()=>{
            jest.spyOn(path, 'join').mockReturnValue(expectedPath);
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            expect(() => service.getStaticProductImage(filename)).toThrow(BadRequestException);
        })
    })
})