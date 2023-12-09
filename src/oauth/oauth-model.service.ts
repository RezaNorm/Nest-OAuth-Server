import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientService } from './client/client.service';
import OAuth2Server, {
  AuthorizationCode,
  AuthorizationCodeModel,
  Client as OAuthClient,
  ClientCredentialsModel,
  RefreshTokenModel,
  Token,
  User as OAuthUser,
} from 'oauth2-server';
import { AuthorizationCodeService } from './authorization-code/authorization-code.service';
import { ClientOauth } from './client/client.entity';
import { User } from './user/user.entity';
import { AccessTokenService } from './access-token/access-token.service';
import { AccessTokenOauth } from './access-token/access-token.entity';

import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { RefreshTokenOauth } from './refresh-token/entities/refresh-token.entity';

@Injectable()
export class OauthModelService
  implements AuthorizationCodeModel, ClientCredentialsModel, RefreshTokenModel
{
  constructor(
    private configService: ConfigService,
    private clientService: ClientService,
    private authorizationCodeService: AuthorizationCodeService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  getClient(clientId: string) {
    console.log('get client');
    return this.clientService.getClient(clientId).catch(() => {
      throw new UnauthorizedException();
    });
  }

  saveToken(token: Token, client, user): any {
    console.log("save token")
    /* This is where you insert the token into the database */
    const dto = {
      accessToken: token.accessToken,
      expiresAt: token.accessTokenExpiresAt,
      client: Object.assign(new ClientOauth(), { id: client.id }),
      user: Object.assign(new User(), { id: user.id }),
    } as Partial<AccessTokenOauth>;

    if (token.refreshToken) {
      const dto = {
        refreshToken: token.refreshToken,
        expiresAt: token.refreshTokenExpiresAt,
        client: Object.assign(new ClientOauth(), { id: client.id }),
        user: Object.assign(new User(), { id: user.id }),
      } as Partial<RefreshTokenOauth>;

      this.refreshTokenService.save(dto);
    }
    this.accessTokenService.save(dto);
    return {
      accessToken: token.accessToken,

      accessTokenExpiresAt: token.accessTokenExpiresAt,

      refreshToken: token.refreshToken,

      refreshTokenExpiresAt: token.refreshTokenExpiresAt,

      scope: token.scope,

      client: { id: client.id },

      user: { id: user.id },
    };
  }

  getAccessToken(token) {
    return this.accessTokenService.findOne(token);
  }

  generateAccessToken(
    client: OAuthClient,
    user: OAuth2Server.User,
    scope: string | string[],
  ): Promise<string> {
    console.log("gen acc")
    const secret = this.configService.get('JWT_SECRET');
    return Promise.resolve(
      jwt.sign({ ...user, scope }, secret, {
        expiresIn: 1800,
      }),
    );
  }

  generateRefreshToken(
    client: OAuthClient,
    user: OAuth2Server.User,
    scope: string | string[],
  ): Promise<string> {
    console.log("generate ref")
    const secret = this.configService.get('JWT_SECRET');
    return Promise.resolve(
      jwt.sign({ ...user, scope }, secret, {
        expiresIn: '7d',
      }),
    );
  }

  getRefreshToken(refreshToken) {
    console.log({refreshToken})
    return this.refreshTokenService.findOne(refreshToken);
  }

  revokeToken(token: AccessTokenOauth) {
    return this.accessTokenService
      .revoke(token.accessToken)
      .then((res) => !!res);
  }

  saveAuthorizationCode(
    code: Pick<
      AuthorizationCode,
      'authorizationCode' | 'expiresAt' | 'redirectUri' | 'scope'
    >,
    client: OAuthClient,
    user: OAuthUser,
  ) {
    return this.authorizationCodeService
      .save({
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        client: Object.assign(new ClientOauth(), { id: client.id }),
        user: Object.assign(new User(), { id: user.id }),
      })
      .then((code) => {
        console.log(code);
        return code;
      });
  }

  getAuthorizationCode(authorizationCode) {
    /* this is where we fetch the stored data from the code */
    return this.authorizationCodeService
      .findOne(authorizationCode)
      .then((code) => {
        delete code.redirectUri;
        return code;
      });
  }

  revokeAuthorizationCode(authorizationCode: AuthorizationCode) {
    console.log({ authorizationCode });
    return this.authorizationCodeService
      .revoke(authorizationCode.authorizationCode)
      .then((res) => !!res);
  }

  verifyScope(token, scope) {
    return Promise.resolve(true);
  }

  getUserFromClient() {
    return Promise.resolve({});
  }
}
