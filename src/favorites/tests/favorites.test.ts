import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from '../favorites.service';
import { Model } from 'mongoose';
import { Favorite } from '../entity/favorites.entity';
import { getModelToken } from '@nestjs/mongoose';
import { FavoritesDto } from '../dto/favorites.dto';
import mongoose from 'mongoose';

describe('FavoritesService', () => {
    let service: FavoritesService;
    let favoriteModel: Model<Favorite>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoritesService,
                {
                    provide: getModelToken(Favorite.name),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn().mockImplementation((dto) => ({
                            ...dto,
                            _id: new mongoose.Types.ObjectId(),
                        })),
                        find: jest.fn().mockReturnThis(),
                        populate: jest.fn().mockReturnThis(),
                        exec: jest.fn(),
                        findByIdAndDelete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<FavoritesService>(FavoritesService);
        favoriteModel = module.get<Model<Favorite>>(getModelToken(Favorite.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addFavorites', () => {
        it('should add a favorite successfully', async () => {
            const postId = new mongoose.Types.ObjectId();
            const dto: FavoritesDto = {
                username: 'user1',
                post: postId,
            };

            const mockFavorite = {
                ...dto,
                _id: new mongoose.Types.ObjectId(),
            };

            jest.spyOn(favoriteModel, 'findOne').mockResolvedValue(null);
            jest.spyOn(favoriteModel, 'create').mockResolvedValue(mockFavorite as any);

            const result = await service.addFavorites(dto);
            expect(result).toEqual(mockFavorite);
            expect(favoriteModel.findOne).toHaveBeenCalledWith({
                username: dto.username,
                post: dto.post,
            });
            expect(favoriteModel.create).toHaveBeenCalledWith({
                username: dto.username,
                post: dto.post,
            });
        });

        it('should throw an error if the post is already favorited', async () => {
            const postId = new mongoose.Types.ObjectId();
            const dto: FavoritesDto = {
                username: 'user1',
                post: postId,
            };

            const existingFavorite = {
                username: 'user1',
                post: postId,
            };

            jest.spyOn(favoriteModel, 'findOne').mockResolvedValue(existingFavorite as any);

            await expect(service.addFavorites(dto)).rejects.toThrow(
                'This Post Already Favorite',
            );
        });

        it('should throw an error if the post ID is invalid', async () => {
            const dto: FavoritesDto = {
                username: 'user1',
                post: 'invalid-post-id' as unknown as mongoose.Types.ObjectId,
            };

            await expect(service.addFavorites(dto as FavoritesDto)).rejects.toThrow('Invalid post ID');
        });
    });

    describe('getFvoritesByUser', () => {
        it('should return favorites for a user', async () => {
            const username = 'user1';
            const mockFavorites = [
                { username: 'user1', post: new mongoose.Types.ObjectId() },
                { username: 'user1', post: new mongoose.Types.ObjectId() },
            ];

            jest.spyOn(favoriteModel, 'find').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockFavorites),
            } as any);

            const result = await service.getFvoritesByUser(username);
            expect(result).toEqual(mockFavorites);
            expect(favoriteModel.find).toHaveBeenCalledWith({ username });
        });

        it('should return an empty array if no favorites exist', async () => {
            const username = 'user1';

            jest.spyOn(favoriteModel, 'find').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            } as any);

            const result = await service.getFvoritesByUser(username);
            expect(result).toEqual([]);
            expect(favoriteModel.find).toHaveBeenCalledWith({ username });
        });
    });

    describe('removeFavorite', () => {
        it('should remove a favorite successfully', async () => {
            const favoriteId = new mongoose.Types.ObjectId().toString();
            const mockDeletedFavorite = {
                _id: favoriteId,
                username: 'user1',
                post: new mongoose.Types.ObjectId(),
            };

            jest.spyOn(favoriteModel, 'findByIdAndDelete').mockResolvedValue(mockDeletedFavorite as any);

            const result = await service.removeFavorite(favoriteId);
            expect(result).toEqual(mockDeletedFavorite);
            expect(favoriteModel.findByIdAndDelete).toHaveBeenCalledWith(favoriteId);
        });

        it('should throw an error if the favorite is not found', async () => {
            const favoriteId = new mongoose.Types.ObjectId().toString();

            jest.spyOn(favoriteModel, 'findByIdAndDelete').mockResolvedValue(null);

            await expect(service.removeFavorite(favoriteId)).rejects.toThrow(
                'Favorite not found or not authorized to delete',
            );
        });
    });
});
