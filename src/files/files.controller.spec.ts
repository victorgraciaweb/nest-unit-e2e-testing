import { Test, TestingModule } from "@nestjs/testing";
import { Response } from 'express';
import { FilesController } from "./files.controller"
import { ConfigService } from "@nestjs/config";
import { FilesService } from "./files.service";
import { BadRequestException } from "@nestjs/common";

describe('FilesController', ()=>{
    let controller: FilesController;
    let filesService: FilesService;

    beforeEach(async ()=>{
        const mockFilesService = {
            getStaticProductImage: jest.fn()
        }

        const mockConfigService = {
            get: jest.fn().mockReturnValue('http:localhost:3000')
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FilesController],
            providers: [
                {
                    provide: FilesService,
                    useValue: mockFilesService
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile();

        controller = module.get<FilesController>(FilesController);
        filesService = module.get<FilesService>(FilesService);
    })

    it('Should be defined', ()=>{
        expect(controller).toBeDefined();
    })

    describe('findProductImage', ()=>{
        it('Should return file path when function is called', ()=>{
            const mockResponse = {
                sendFile: jest.fn()
            } as unknown as Response;

            const imageName = 'image.jpg';
            const filePath = `url-file/${imageName}`;

            jest.spyOn(filesService, 'getStaticProductImage').mockReturnValue(filePath);

            controller.findProductImage(mockResponse, imageName);
            expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath);
        })
    })

    describe('uploadProductImage', ()=>{
        it('Should return securUrl and fileName when uploadProductImage is called with valid image', ()=>{
            const file = {
                filename: 'file-name.jpg'
            } as Express.Multer.File;

            const result = controller.uploadProductImage(file);
            expect(result).toEqual({
                secureUrl: 'http:localhost:3000/files/product/file-name.jpg',
                fileName: 'file-name.jpg'
            });
        })

        it('Should throw BadRequestException if file was not provided', () => {
            expect(() => controller.uploadProductImage(null)).toThrow(BadRequestException);
        });
    })
})