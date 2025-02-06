import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from './entity/posts.entity';
import { AuthModule } from '../auth/auth.module';
import { MinioService } from '../services/minio';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, MinioService],
})
export class PostsModule {}
