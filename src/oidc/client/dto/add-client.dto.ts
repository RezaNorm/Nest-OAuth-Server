import { IsString, IsArray, IsUrl, IsEnum } from 'class-validator';

export class ClientInfoDTO {
  @IsString()
  shopId: string;

  @IsString()
  shopName: string;

  @IsString()
  client_id: string;

  @IsArray()
  domains: string[];

  @IsArray()
  redirectUrls: string[];
}
