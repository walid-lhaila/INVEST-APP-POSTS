import { Controller, UnauthorizedException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  @MessagePattern({ cmd: 'addFavorite' })
  async addFavorite(@Payload() data: any) {
    const { token, payload } = data;
    if (!token) {
      throw new UnauthorizedException('Token is Missing');
    }
    const username = await this.favoriteService.verifyToken(token);
    const postId = payload.postId;
    return this.favoriteService.addFavorites({ username, post: postId });
  }

  @MessagePattern({ cmd: 'getFavoritesByUser' })
  async getFavoritesByUser(@Payload() data: any) {
    const { token } = data;
    if (!token) {
      throw new UnauthorizedException('Token is Missing');
    }
    const username = await this.favoriteService.verifyToken(token);
    return this.favoriteService.getFvoritesByUser(username);
  }

  @MessagePattern({ cmd: 'removeFavorite' })
  async removeFavorite(@Payload() data: any) {
    const { favoriteId, token } = data;
    if (!token) {
      throw new UnauthorizedException('Token is Missing');
    }
    return this.favoriteService.removeFavorite(favoriteId);
  }
}
