import { Test, TestingModule } from "@nestjs/testing"
import { FilesModule } from './files.module';
import { FilesService } from './files.service';
import { FilesController } from "./files.controller";

describe('FilesModule', ()=>{
    let module: TestingModule;
    
    beforeEach(async ()=>{
        module = await Test.createTestingModule({
            imports: [FilesModule]
        }).compile();
    })

    afterEach(() => {
        module.close();
    });
    
    it('Should be module defined', ()=>{
        expect(module).toBeDefined();
    })

    it('Should be FilesController defined', ()=>{
        const filesController = module.get<FilesController>(FilesController)
        expect(filesController).toBeDefined();
    })

    it('Should be FilesService defined', ()=>{
        const filesService = module.get<FilesService>(FilesService)
        expect(filesService).toBeDefined();
    })
})