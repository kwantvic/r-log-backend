import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
  ) {}

  create(dto: CreatePostDto, userId: number) {
    const firstParagraph = dto.body.find((obj) => obj.type === 'paragraph')
      ?.data?.text;
    return this.repository.save({
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      user: { id: userId },
      description: firstParagraph || '',
    });
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Post not found');
    }
    const firstParagraph = dto.body.find((obj) => obj.type === 'paragraph')
      ?.data?.text;
    return this.repository.update(id, {
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      user: { id: userId },
      description: firstParagraph || '',
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async popular() {
    const qb = this.repository.createQueryBuilder();
    qb.orderBy('views', 'DESC');
    qb.limit(10);
    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
    };
  }

  async search(dto: SearchPostDto) {
    const qb = this.repository.createQueryBuilder('p');
    qb.leftJoinAndSelect('p.user', 'user');
    qb.limit(dto.limit || 0);
    qb.take(dto.take || 10);
    qb.setParameters({
      body: `%${dto.body}%`,
      title: `%${dto.title}%`,
      tag: `%${dto.tag}%`,
      views: dto.views || '',
    });
    if (dto.views) {
      qb.orderBy('views', dto.views);
    }
    if (dto.body) {
      qb.andWhere(`p.body ILIKE :body`);
    }
    if (dto.title) {
      qb.andWhere(`p.title ILIKE :title`);
    }
    if (dto.tag) {
      qb.andWhere(`p.tag ILIKE :tag`);
    }
    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
    };
  }

  // todo: 💊❓
  async findOne(id: number) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Post not found');
    }
    await this.repository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .update()
      .set({
        views: () => 'views + 1',
      })
      .execute();
    // return this.repository.findOne({ where: { id: id }, relations: ['user'] });
    return this.repository.findOne({ where: { id: id } });
  }

  async remove(id: number, userId: number) {
    const find = await this.repository.findOne({ where: { id: id } });
    if (!find) {
      throw new NotFoundException('Post not found');
    }

    if (find.user.id !== userId) {
      throw new ForbiddenException('No access to this article');
    }

    return this.repository.delete(id);
  }
}
