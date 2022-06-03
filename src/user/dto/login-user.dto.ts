import { IsEmail, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail(undefined, { message: 'Wrong email!' })
  email: string;

  @Length(6, 32, { message: 'Password must be at least 6 characters!' })
  password?: string;
}
