import {Controller, UnauthorizedException} from '@nestjs/common';
import { PostsService } from './posts.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @MessagePattern({ cmd: 'createPost' })
  async createPosts(@Payload() data: any) {
    const { token, payload, file } = data;
    if (!token) {
      throw new Error('token is missing');
    }
    const entrepreneur = await this.postService.verifyToken(token);

    const postData = {
      ...payload,
      entrepreneur,
    };
    return this.postService.createPosts(postData, file);
  }


  @MessagePattern({ cmd: 'getAll' })
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @MessagePattern({ cmd: 'getAllPostsByUserId' })
  async getAllPostsByUserId(@Payload() data: any) {
    const { token } = data;
    if (!token) {
      throw new Error('Token is Missing');
    }
    const userId = await this.postService.verifyToken(token);
    return this.postService.getPostByUserId(userId);
  }

  @MessagePattern({ cmd: 'deletePost' })
  async deletePost(@Payload() data: any) {
    const { token, postId } = data;
    if (!token) {
      throw new UnauthorizedException('Token is Missing');
    }
    if (!postId) {
      throw new Error('Post Id is Required');
    }

    const userId = await this.postService.verifyToken(token);
    return this.postService.deletePost(userId, postId);
  }

  @MessagePattern({ cmd: 'updatePost' })
  async updatePost(@Payload() data: any) {
    const { token, postId, payload, file } = data;
    if (!token) {
      throw new UnauthorizedException('TOKEN IS MISSING');
    }
    if (!postId) {
      throw new Error('POST ID IS REQUIRED');
    }

    const userId = await this.postService.verifyToken(token);
    return this.postService.updatePost(userId, postId, payload, file);
  }

}
