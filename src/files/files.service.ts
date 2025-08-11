import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
    getStaticProductImage( imageName: string ) {
        const path = join( __dirname, '../../static/products', imageName );

        if ( !existsSync(path) ) 
            throw new NotFoundException(`No product found with image ${ imageName }`);

        return path;
    }
}
