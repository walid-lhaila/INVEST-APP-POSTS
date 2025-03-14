import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument } from './entity/posts.entity';
import { MinioService } from '../services/minio';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { PostsDto } from './dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Posts.name) private postsModel: Model<PostsDocument>, private readonly minioService: MinioService) {}

  async verifyToken(token: string): Promise<string> {
    const jwtToken = token.split(' ')[1];
    const decodedToken = jwt.decode(jwtToken) as jwt.JwtPayload;
    const user = decodedToken?.preferred_username;
    if (!user) {
      throw new Error('Invalid token: ID not found.');
    }
    return user;
  }
  async createPosts(postsDto: PostsDto, file?: { buffer: string; originalname: string; mimetype: string },): Promise<PostsDocument> {
    let imageUrl;
    if (file && file.buffer) {
      const fileBuffer = Buffer.from(file.buffer, 'base64');
      imageUrl = await this.minioService.uploadImage({
        ...file,
        buffer: fileBuffer,
      });
    }
    return this.postsModel.create({ ...postsDto, imageUrl });

  }

  async getAllPosts(): Promise<PostsDocument[]> {
    return this.postsModel.find().exec();
  }

  async getPostByUserId(userId: string): Promise<PostsDocument[]> {
    return this.postsModel.find({ entrepreneur: userId }).exec();
  }

  async deletePost(userId: string, postId: string): Promise<{ message: string }> {
    const deletedPost = await this.postsModel.findOneAndDelete({ _id: postId, entrepreneur: userId });
    if (!deletedPost) {
      throw new Error('Post not found or not authorized to delete');
    }
    return { message: 'Post deleted successfully' };
  }

  async updatePost(
      userId: string,
      postId: string,
      updatedData: Partial<PostsDto>,
      file?: { buffer: string; originalname: string; mimetype: string }
  ): Promise<PostsDocument> {
    const post = await this.postsModel.findOne({ _id: postId, entrepreneur: userId });
    if (!post) {
      throw new Error('Post Not Found Or Not Authorized To Update');
    }

    let imageUrl = post.imageUrl;
    if (file && file.buffer) {
      const fileBuffer = Buffer.from(file.buffer, 'base64');
      imageUrl = await this.minioService.uploadImage({
        ...file,
        buffer: fileBuffer,
      });
    }

    const updatedPost = await this.postsModel.findOneAndUpdate(
        { _id: postId, entrepreneur: userId },
        { ...updatedData, imageUrl },
        { new: true }
    );

    if (!updatedPost) {
      throw new Error('Failed to update the post');
    }

    return updatedPost;
  }


}
