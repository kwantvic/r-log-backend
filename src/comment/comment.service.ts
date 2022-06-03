import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  async create(dto: CreateCommentDto, userId: number) {
    const comment = await this.repository.save({
      text: dto.text,
      post: { id: dto.postId },
      user: { id: userId },
    });

    return this.repository.findOne({
      where: { id: comment.id },
      relations: ['user'],
    });
  }

  async findAll(postId: number) {
    const qb = this.repository.createQueryBuilder('c');

    if (postId) {
      qb.where('c.postId = :postId', { postId });
    }

    const arr = await qb
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    return arr.map((obj) => {
      return {
        ...obj,
        post: { id: obj.post.id, title: obj.post.title },
      };
    });
  }

  async findOne(id: number) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Comment not found');
    }
    return find;
  }

  async update(id: number, dto: UpdateCommentDto) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Comment not found');
    }
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Comment not found');
    }
    return this.repository.delete(id);
  }
}
