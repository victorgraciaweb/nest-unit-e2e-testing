import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from 'src/auth/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { title } from 'process';

describe('ProductsService', ()=>{
    let service: ProductsService;
    let productRepository: Repository<Product>;
    let productImageRepository: Repository<ProductImage>

    beforeEach(async () => {
        const mockProductRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn()
        }

        const mockProductImageRepository = {
            create: jest.fn()
        }

        const mockDataSource = {
            createQueryRunner: jest.fn().mockReturnValue({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                manager: {
                    delete: jest.fn(),
                    save: jest.fn(),
                },
                commitTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn()
            })
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
                {
                    provide: getRepositoryToken(ProductImage),
                    useValue: mockProductImageRepository,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                ProductsService,
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
        productImageRepository = module.get<Repository<ProductImage>>(getRepositoryToken(ProductImage));
    })

    it('Should be defined', ()=>{
        expect(service).toBeDefined();
    })

    describe('create', ()=>{
        it('Should create a product', async ()=>{
            const dto = {
                title: 'product',
                sizes: ['S', 'M'],
                gender: 'men',
                tags: ['tag1', 'tag2'],
                images: ['image1', 'image2']
            } as CreateProductDto

            const { images: dtoWithNoImages, ...createProductDto } = dto

            const user = {
                id: 'ID',
                email: 'test@gmail.com'
            } as User

            const mockProduct = {
                id: 'ID',
                ...createProductDto,
                title: 'product'
            } as unknown as Product

            jest.spyOn(productRepository, 'create').mockReturnValue(mockProduct);
            jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct);
            jest.spyOn(productImageRepository, 'create').mockImplementation((imageData) => imageData as unknown as ProductImage);

            const result = await service.create(dto, user);

            expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
            expect(result).toEqual({
                ...mockProduct,
                images: dtoWithNoImages
            })
        })

        it('Should throw BadRequestException if create product fails', async ()=>{
            const dto = {} as CreateProductDto
            const user = {} as User
            
            jest.spyOn(productRepository, 'save').mockRejectedValue({
                code: '23505',
                detail: 'product already exist',
            });

            await expect(service.create(dto, user)).rejects.toThrow(BadRequestException);
            await expect(service.create(dto, user)).rejects.toThrow('product already exist');
        })
    })

    describe('findAll', ()=>{
        const mocksProducts = [
            {
                id: 'ID1',
                title: 'product1',
                price: 10,
                images: [
                    { url: 'image1' },
                    { url: 'image2' }
                ],
            },
            {
                id: 'ID2',
                title: 'product2',
                price: 30,
                images: [
                    { url: 'image1' }
                ],
            },
        ] as unknown as Product[];

        it('Should return all products default values', async ()=>{
            const paginationDto = {
                limit: 10,
                offset: 0,
                gender: 'men'
            } as PaginationDto;

            jest.spyOn(productRepository, 'find').mockResolvedValue(mocksProducts);
            jest.spyOn(productRepository, 'count').mockResolvedValue(mocksProducts.length);
            jest.spyOn(productImageRepository, 'create').mockImplementation((imageData) => imageData as unknown as ProductImage);

            const result = await service.findAll(paginationDto)

            expect(productRepository.find).toHaveBeenCalledWith({
                take: paginationDto.limit,
                skip: paginationDto.offset,
                relations: {
                    images: true,
                },
                order: {
                    id: 'ASC',
                },
                where: [
                    { gender: paginationDto.gender }, 
                    { gender: 'unisex' }
                ],
            });
            expect(productRepository.count).toHaveBeenCalledWith({
                where: paginationDto.gender ? [
                    { gender: paginationDto.gender }, 
                    { gender: 'unisex' }
                ] : {},
            });

            expect(result).toEqual({
                count: mocksProducts.length,
                pages: Math.ceil(mocksProducts.length / paginationDto.limit),
                products: [
                    {
                        id: 'ID1',
                        title: 'product1',
                        price: 10,
                        images: [
                            'image1',
                            'image2',
                        ],
                    },
                    {
                        id: 'ID2',
                        title: 'product2',
                        price: 30,
                        images: [
                            'image1',
                        ],
                    },
                ],
            });
        })

        it('Should return all products', async ()=>{
            const paginationDto = {} as PaginationDto;

            jest.spyOn(productRepository, 'find').mockResolvedValue(mocksProducts);
            jest.spyOn(productRepository, 'count').mockResolvedValue(mocksProducts.length);
            jest.spyOn(productImageRepository, 'create').mockImplementation((imageData) => imageData as unknown as ProductImage);

            const result = await service.findAll(paginationDto)

            expect(productRepository.find).toHaveBeenCalledWith({
                take: 10,
                skip: 0,
                relations: {
                    images: true,
                },
                order: {
                    id: 'ASC',
                },
                where: {},
            });
            expect(productRepository.count).toHaveBeenCalledWith({
                where: {},
            });

            expect(result).toEqual({
                count: mocksProducts.length,
                pages: Math.ceil(mocksProducts.length / 10),
                products: [
                    {
                        id: 'ID1',
                        title: 'product1',
                        price: 10,
                        images: [
                            'image1',
                            'image2',
                        ],
                    },
                    {
                        id: 'ID2',
                        title: 'product2',
                        price: 30,
                        images: [
                            'image1',
                        ],
                    },
                ],
            });
        })
    })
})