import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
}

interface NestRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { id: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<NestRequest>();
    const token = this.extractTokenFromHeader(request);

    // 🛑 STOP right here if token is missing
    if (!token) {
      throw new UnauthorizedException(
        'Access token is missing. Please log in.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_LEDGER_KEY_2026',
      });

      request.user = { id: String(payload.sub) };
    } catch {
      // 🛑 STOP right here if token is invalid or expired
      throw new UnauthorizedException(
        'Session token has expired or is invalid.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: NestRequest): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization || typeof authorization !== 'string') return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
