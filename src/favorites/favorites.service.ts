import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from './entity/favorites.entity';
import mongoose, { Model } from 'mongoose';
import { FavoritesDto } from './dto/favorites.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
  ) {}

  async verifyToken(token: string): Promise<string> {
    const jwtToken = token.split(' ')[1];
    const decodedToken = jwt.decode(jwtToken) as jwt.JwtPayload;
    const user = decodedToken?.preferred_username;
    if (!user) {
      throw new Error('Invalid token: ID not found.');
    }
    return user;
  }

  async addFavorites(dto: FavoritesDto) {
    const { username, post } = dto;
    if (!post || !mongoose.Types.ObjectId.isValid(post)) {
      throw new Error('Invalid post ID');
    }

    const postId = new mongoose.Types.ObjectId(post);

    const existingFavorite = await this.favoriteModel.findOne({ username: username, post: postId,});
    if (existingFavorite) {
      throw new Error('This Post Already Favorite');
    }
    return this.favoriteModel.create({
      username,
      post: postId,
    });
  }

  async getFvoritesByUser(username: string) {
    return this.favoriteModel.find({ username }).populate('post').exec();
  }

  async removeFavorite(favoriteId: string) {
    const deletedFavorite =
      await this.favoriteModel.findByIdAndDelete(favoriteId);
    if (!deletedFavorite) {
      throw new Error('Favorite not found or not authorized to delete');
    }
    return deletedFavorite;
  }
}
