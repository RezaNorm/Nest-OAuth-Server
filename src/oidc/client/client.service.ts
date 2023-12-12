import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientInfoDTO } from './dto/add-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../entities/Client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientEntity: Repository<Client>,
  ) {}
  async createClient(data: Partial<ClientInfoDTO>) {
    try {
      const { client_id, redirectUrls } = data;
      const newClient = await this.clientEntity.save({
        id: client_id,
        data: {
          client_id,
          grant_types: ['authorization_code', 'refresh_token'],
          redirect_uris: redirectUrls,
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
        },
      });
    
    } catch (error) {
      console.log(error)
    }
   
  }

  async updateClient(dataDTO: Partial<ClientInfoDTO>) {
    const { client_id, redirectUrls } = dataDTO;
    const id = client_id;
    const existClient = await this.clientEntity.findOne({ where: { id } });
    if (!existClient) throw new NotFoundException('Client doesnt exist');
    return await this.clientEntity.update({ id }, { data: { redirectUrls } });
  }
}
