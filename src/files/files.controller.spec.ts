import { Test, TestingModule } from "@nestjs/testing";
import { Response } from 'express';
import { FilesController } from "./files.controller"
import { ConfigService } from "@nestjs/config";
import { FilesService } from "./files.service";

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
        
    })
})