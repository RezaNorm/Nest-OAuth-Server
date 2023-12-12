// oauth-key.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientCrudGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const expectedOAuthKey = this.configService.get<string>('OAUTH_KEY');
    console.log("here")
    if (!expectedOAuthKey)
      throw new InternalServerErrorException('oauth key hasnt been set');

    console.log(request.headers['x-oauth-key'])

    const oauthKeyHeader = request.headers['x-oauth-key'];

    if (!oauthKeyHeader || oauthKeyHeader !== expectedOAuthKey) {
      return false;
    }

    console.log("true")
    return true;
  }
}
