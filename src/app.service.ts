import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientInfoDTO } from './oidc/client/dto/add-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './oidc/entities/Client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
