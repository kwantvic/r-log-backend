import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    // const data = { id: payload.sub, email: payload.email };
    // const user = await this.userService.findByCond(data);
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('You do not have access to this page');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }
}
