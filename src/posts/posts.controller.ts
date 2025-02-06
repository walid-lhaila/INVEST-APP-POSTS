import {Controller} from '@nestjs/common';
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
    const entrepreneurId = await this.postService.verifyToken(token);

    const postData = {
      ...payload,
      entrepreneurId,
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
    if(!token){
      throw new Error('Token is Missing');
    }
    const userId = await this.postService.verifyToken(token);
    console.log(userId);
    return this.postService.getPostByUserId(userId);
  }
}
