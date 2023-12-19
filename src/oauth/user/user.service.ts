import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto, User } from './user.entity';
import { Repository } from 'typeorm';
import { pbkdf2, pbkdf2Sync, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly HASH_ITERATIONS = 15000;
  private readonly KEY_LEN = 32;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly _repo: Repository<User>,
  ) {}

  findOne(id: string) {
    return this._repo.findOneOrFail(id);
  }

  findByEmail(email: string) {
    return this._repo.findOne({ email });
  }

  async register(dto: RegisterUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this._repo
      .save({
        fullName: dto.fullName,
        email: dto.email,
        hash,
        clientId: dto.clientId,
      })
      .then((user) => {
        delete user.hash;
        return user;
      });

    const sendDataTo3rdp = {
      email: dto.email,
      password: hash,
      clientId: dto.clientId,
      oauth_user_id: user.id,
    };

    const THIRDPARTY_SIGNUP_ADDRESS = `${this.configService.get(
      'THIRDPARTY_ADDRESS',
    )}/users/oauth/signup`;

    const OAUTH_KEY = this.configService.get('OAUTH_KEY');

    console.log(THIRDPARTY_SIGNUP_ADDRESS)
    
    await axios.post(THIRDPARTY_SIGNUP_ADDRESS, sendDataTo3rdp, {
      headers: { 'x-oauth-key': OAUTH_KEY },
    });

    return user;

    // const salt = randomBytes(12).toString('base64');
    // const key = await new Promise<string>((resolve, reject) => {
    //   pbkdf2(
    //     dto.password,
    //     salt,
    //     this.HASH_ITERATIONS,
    //     this.KEY_LEN,
    //     'sha256',
    //     (err, result) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(result.toString('base64'));
    //       }
    //     },
    //   );
    // });

    // const hash = `pbkdf2_sha256$${this.HASH_ITERATIONS}$${salt}$${key}`;
  }

  async authenticate(email, password) {
    const user = await this._repo.findOne(
      { email },
      { select: ['email', 'hash', 'id', 'fullName'] },
    );

    const checkPass = await this._compare(password, user.hash);

    if (!user || !checkPass) {
      throw new UnauthorizedException();
    }
    delete user.hash;
    return user;
  }

  private async _compare(password, hash) {
    return await bcrypt.compare(password, hash);
    // if (!hash.startsWith('pbkdf2_')) {
    //   return false;
    // }
    // const parts = hash.split('$');
    // const iterations = +parts[1];
    // const salt = parts[2];
    // const digest = parts[0].split('_')[1];
    // return (
    //   pbkdf2Sync(password, salt, iterations, this.KEY_LEN, digest).toString(
    //     'base64',
    //   ) === parts[3]
    // );
  }
}
