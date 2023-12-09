import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenOauth } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenOauth)
    private readonly _repo: Repository<RefreshTokenOauth>,
  ) {}

  save(dto: Partial<RefreshTokenOauth>) {
    return this._repo.save(dto);
  }

  findOne(refreshToken: string) {
    return this._repo.findOneOrFail({
      refreshToken,
    });
  }

  revoke(refreshToken: string) {
    return this._repo.softDelete({
      refreshToken,
    });
  }
}
