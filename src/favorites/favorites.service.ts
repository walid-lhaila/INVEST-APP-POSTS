import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from './entity/favorites.entity';
import { Model } from 'mongoose';
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
    const existingFavorite = await this.favoriteModel.findOne({
      username,
      post,
    });
    if (existingFavorite) {
      throw new Error('This Post Already Favorite');
    }
    const favorite = new this.favoriteModel({ username, post });
    return await favorite.save();
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
    return { message: 'Favorite removed successfully' };
  }
}
