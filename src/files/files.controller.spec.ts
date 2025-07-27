import { Test, TestingModule } from "@nestjs/testing";
import { FilesController } from "./files.controller"
import { ConfigService } from "@nestjs/config";
import { FilesService } from "./files.service";

describe('FilesController', ()=>{
    let controller: FilesController;

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
    })

    it('Should be defined', ()=>{
        expect(controller).toBeDefined();
    })
})