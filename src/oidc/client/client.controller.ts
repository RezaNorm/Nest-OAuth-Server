import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientCrudGuard } from 'src/guards/create-client.guard';
import { ClientInfoDTO } from './dto/add-client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(ClientCrudGuard)
  @Post('add')
  async addClient(@Body() data: Partial<ClientInfoDTO>) {
    console.log("here1")
    return await this.clientService.createClient(data);
  }

  @UseGuards(ClientCrudGuard)
  @Put('modify')
  async updateClient(@Body() data: Partial<ClientInfoDTO>) {
    console.log("here2")
    return await this.clientService.updateClient(data);
  }
}
