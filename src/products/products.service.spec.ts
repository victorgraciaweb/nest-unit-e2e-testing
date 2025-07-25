import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryBuilder, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from 'src/auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UUID } from 'crypto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', ()=>{
    let service: ProductsService;
    let productRepository: Repository<Product>;
    let productImageRepository: Repository<ProductImage>
    let mockQueryBuilder: any;

    beforeEach(async () => {
        mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        };

        const mockProductRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

    describe('findOne', ()=>{
        const id: UUID = '550e8400-e29b-41d4-a716-446655440000';
        const term: string = 'term';
        
        it('Should return a product with valid ID', async ()=>{
            const mockProduct = {
                id: 'ID',
                title: 'product'
            } as Product

            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(mockProduct);
            
            const result = await service.findOne(id);
            expect(productRepository.findOneBy).toHaveBeenCalledWith({ id });
            expect(result).toEqual(mockProduct);
        })

        it('Should return a NotFoundExcetion error if not exist product with ID sent', async ()=>{
            jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(id)).rejects.toThrow(`Product with ${id} not found`);
        })

        it('Should return a product by term or slug', async ()=>{
            const mockProduct = {
                id: 'ID',
                title: 'product'
            } as Product

            jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockProduct);
            
            const result = await service.findOne(term);
            expect(result).toEqual(mockProduct);
        })

        it('Should return a NotFoundExcetion error if not exist product by term or slug', async ()=>{
            jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(null);
            
            await expect(service.findOne(term)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(term)).rejects.toThrow(`Product with ${term} not found`);
        })
    })

    describe('update', ()=>{
        it('Should throw an error NotFoundException if product not found', async ()=>{
            const id = 'ID-PRODUCT'; 
            const dto = {
                title: 'product',
                sizes: ['S', 'M'],
                gender: 'men',
                tags: ['tag1', 'tag2'],
                images: ['image1', 'image2']
            } as UpdateProductDto

            const user = {
                id: 'ID',
                email: 'test@gmail.com'
            } as User

            jest.spyOn(productRepository, 'preload').mockResolvedValue(null);
            await expect(service.update(id, dto, user)).rejects.toThrow(NotFoundException)
        })

        it('Should update a product successfully with no images', async ()=>{
            const id = 'ID-PRODUCT'; 
            const dto = {
                title: 'product',
                sizes: ['S', 'M'],
                gender: 'men',
                tags: ['tag1', 'tag2'],
            } as UpdateProductDto

            const user = {
                id: 'ID',
                email: 'test@gmail.com'
            } as User

            const mockProduct = {
                ...dto,
                price: 10.00,
                description: 'Product description'
            } as unknown as Product

            jest.spyOn(productRepository, 'preload').mockResolvedValue(mockProduct);
            jest.spyOn(mockQueryBuilder, 'getOne').mockResolvedValue(mockProduct);
            const result = await service.update(id, dto, user);
        })
    })
})