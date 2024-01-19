import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientInfoDTO } from './oidc/client/dto/add-client.dto';
import { ClientCrudGuard } from './guards/create-client.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
