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
    const id = decodedToken?.sub;
    if (!id) {
      throw new Error('Invalid token: ID not found.');
    }
    return id;
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
    const createdPost = new this.postsModel({
      ...postsDto,
      imageUrl,
    });
    return createdPost.save();
  }

  async getAllPosts(): Promise<PostsDocument[]> {
    const allPosts = this.postsModel.find().exec();
    return allPosts;
  }

  async getPostByUserId(userId: string): Promise<PostsDocument[]> {
    const getPostByUser = this.postsModel.find({ entrepreneurId: userId }).exec();
    return getPostByUser;
  }

  async deletePost(userId: string, postId: string): Promise<{ message: string }> {
    const deletedPost = await this.postsModel.findOneAndDelete({ _id: postId,  entrepreneurId: userId });
    if (!deletedPost) {
      throw new Error('Post not found or not authorized to delete');
    }
    return { message: 'Post deleted successfully' };
  }

  async updatePost( userId: string, postId: string, updatedData: Partial<PostsDto>, file?: { buffer: string; originalname: string; mimetype: string }): Promise<PostsDocument> {
    const post = await this.postsModel.findOne({ _id: postId, entrepreneurId: userId });
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
        { _id: postId, entrepreneurId: userId },
        { ...updatedData, imageUrl },
        { new: true },
    );

    if (!updatedPost) {
      throw new Error('Failed to update the post');
    }

    return updatedPost;
  }



}
