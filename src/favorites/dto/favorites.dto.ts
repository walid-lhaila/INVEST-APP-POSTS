import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FavoritesDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  post: Types.ObjectId;
}
