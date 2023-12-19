import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../oauth/user/user.service';
import { FindAccount } from 'oidc-provider';

@Injectable()
export class AccountService {
  constructor(private userService: UserService) {}

  findAccount: FindAccount = async (ctx, id: string) => {
    console.log({ id });
    const user = await this.userService.findOne(id);

    if (!user) {
      return undefined;
    }

    return {
      accountId: id,
      async claims() {
        return {
          sub: user.email,
          email: user.email,
          fullName: user.fullName,
        };
      },
    };
  };

  async findUserByEmail(email: string) {
    return await this.userService.findByEmail(email);
  }

  async authenticate(email, password) {
    const user = await this.userService.authenticate(email, password);

    return user.id;
  }

  async signup(fullName: string, email: string, passwords: string[], clientId: string) {
    const password = passwords[0];
    if (password !== passwords[1])
      throw new UnauthorizedException('passwords not match');

    const checkExistingUser = await this.findUserByEmail(email);

    if (checkExistingUser)
      throw new UnauthorizedException('user with this email already exists');

    const user = await this.userService.register({ fullName, email, password, clientId });

    return user.id;
  }
}
