import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import mongoose, {model, Model} from 'mongoose';
import { Posts, PostsDocument } from '../entity/posts.entity';
import { getModelToken } from '@nestjs/mongoose';
import { MinioService } from '../../services/minio';
import { PostsDto } from '../dto/posts.dto';

describe('PostsService', () => {
    let service: PostsService;
    let postsModel: Model<PostsDocument>;
    let minioService: MinioService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: getModelToken(Posts.name),
                    useValue: {
                        new: jest.fn(),
                        constructor: jest.fn(),
                        create: jest.fn().mockImplementation((post) => ({
                            ...post,
                            save: jest.fn().mockResolvedValue(post),
                        })),
                        find: jest.fn().mockResolvedValue([]),
                        findOneAndDelete: jest.fn().mockReturnValue({
                            exec: jest.fn(),
                        }),
                        exec: jest.fn(),
                    },
                },
                {
                    provide: MinioService,
                    useValue: {
                        uploadImage: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        postsModel = module.get<Model<PostsDocument>>(getModelToken(Posts.name));
        minioService = module.get<MinioService>(MinioService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPosts', () => {
        it('should create a post without an image', async () => {
            const postsDto: PostsDto = {
                title: 'Test Post',
                description: 'Test Description',
                entrepreneur: 'user1',
                category: 'Finance',
                tags: ['gestion'],
                investmentGoal: 80000,
                currentInvestment: 54000,
                location: 'Casablanca',
                status: 'Publié',
            };

            const mockPost = {
                ...postsDto,
                _id: '1',
                save: jest.fn().mockResolvedValue({ ...postsDto, _id: '1' }),
            };

            jest.spyOn(postsModel, 'create').mockResolvedValue(mockPost as any);

            const result = await service.createPosts(postsDto);
            expect(result).toEqual(mockPost);
            expect(postsModel.create).toHaveBeenCalledWith({
                ...postsDto,
                imageUrl: undefined,
            });
        });

        it('should create a post with an image', async () => {
            const postsDto: PostsDto = {
                title: 'Test Post',
                description: 'Test Description',
                entrepreneur: 'user1',
                category: 'Finance',
                tags: ['gestion'],
                investmentGoal: 80000,
                currentInvestment: 54000,
                location: 'Casablanca',
                status: 'Publié',
            };

            const file = {
                buffer: 'base64-encoded-image',
                originalname: 'test-image.jpg',
                mimetype: 'image/jpeg',
            };

            const mockImageUrl = 'http://minio/test-image.jpg';
            const mockPost = {
                ...postsDto,
                _id: '1',
                imageUrl: mockImageUrl,
                save: jest.fn().mockResolvedValue({ ...postsDto, _id: '1', imageUrl: mockImageUrl }),
            };

            jest.spyOn(minioService, 'uploadImage').mockResolvedValue(mockImageUrl);
            jest.spyOn(postsModel, 'create').mockResolvedValue(mockPost as any);

            const result = await service.createPosts(postsDto, file);
            expect(result).toEqual(mockPost);
            expect(minioService.uploadImage).toHaveBeenCalledWith({
                buffer: Buffer.from(file.buffer, 'base64'),
                originalname: file.originalname,
                mimetype: file.mimetype,
            });
            expect(postsModel.create).toHaveBeenCalledWith({
                ...postsDto,
                imageUrl: mockImageUrl,
            });
        });

        it('should throw an error if Minio upload fails', async () => {
            const postsDto: PostsDto = {
                title: 'Test Post',
                description: 'Test Description',
                entrepreneur: 'user1',
                category: 'Finance',
                tags: ['gestion'],
                investmentGoal: 80000,
                currentInvestment: 54000,
                location: 'Casablanca',
                status: 'Publié',
            };

            const file = {
                buffer: 'base64-encoded-image',
                originalname: 'test-image.jpg',
                mimetype: 'image/jpeg',
            };

            jest.spyOn(minioService, 'uploadImage').mockRejectedValue(new Error('Upload failed'));

            await expect(service.createPosts(postsDto, file)).rejects.toThrow('Upload failed');
        });
    });

    describe('getAllPosts', () => {
        it('should return an array of posts', async () => {
            const mockPosts = [
                { _id: '1', title: 'Post 1', description: 'Description 1' },
                { _id: '2', title: 'Post 2', description: 'Description 2' }
            ];

            jest.spyOn(postsModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockPosts),
            } as any);

            const result = await service.getAllPosts();
            expect(result).toEqual(mockPosts);
        });
    });


    describe('getPostByUserId', () => {
        it('should return all posts by a specific user ID', async () => {
            const userId = 'user1';
            const mockPosts: Partial<PostsDocument>[] = [
                {
                    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
                    title: 'Post 1',
                    description: 'Desc 1',
                    entrepreneur: userId,
                    category: ['Finance'],
                    tags: ['investment'],
                    investmentGoal: 50000,
                    currentInvestment: 25000,
                    location: 'Casablanca',
                    status: 'Publié',
                    save: jest.fn(),
                },
                {
                    _id: 'post2',
                    title: 'Post 2',
                    description: 'Desc 2',
                    entrepreneur: userId,
                    category: ['Tech'],
                    tags: ['startup'],
                    investmentGoal: 100000,
                    currentInvestment: 20000,
                    location: 'Rabat',
                    status: 'Publié',
                },
            ];

            jest.spyOn(postsModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockPosts),
            } as any);

            const result = await service.getPostByUserId(userId);
            expect(result).toEqual(mockPosts);
            expect(postsModel.find).toHaveBeenCalledWith({entrepreneur: userId});
        });
    });

    describe('deletePost', () => {
        it('should delete a post successfully', async () => {
            const postId = 'somePostId';
            const userId = 'someUserId';

            jest.spyOn(postsModel, 'findOneAndDelete').mockResolvedValue({_id: postId});

            const result = await service.deletePost(userId, postId);

            expect(result).toEqual({message: 'Post deleted successfully'});
            expect(postsModel.findOneAndDelete).toHaveBeenCalledWith({_id: postId, entrepreneur: userId});
        });

        it('should throw an error if the post does not exist', async () => {
            jest.spyOn(postsModel, 'findOneAndDelete').mockResolvedValue(null);

            await expect(service.deletePost('userId', 'invalidPostId')).rejects.toThrow('Post not found');
        });
    });

});
