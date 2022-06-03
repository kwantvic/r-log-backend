import { IsEmail, Length } from 'class-validator';

import { UniqueOnDatabase } from '../../auth/validations/UniqueValidation';
import { UserEntity } from '../entities/user.entity';

export class CreateUserDto {
  @Length(2)
  fullName: string;

  @IsEmail(undefined, { message: 'Wrong email' })
  // todo: 💊fix validation uniq email
  // @UniqueOnDatabase(UserEntity, {
  //   message: 'This email address is already taken',
  // })
  email: string;

  @Length(6, 32, { message: 'Password must be at least 6 characters' })
  password?: string;
}
