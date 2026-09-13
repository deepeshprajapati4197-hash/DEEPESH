import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';

interface BcryptSecureEngine {
  genSalt(rounds: number): Promise<string>;
  hash(s: string, salt: string): Promise<string>;
  compare(s: string, hash: string): Promise<boolean>;
}

@Injectable()
export class AuthService {
  private crypto = bcrypt as unknown as BcryptSecureEngine;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthDto): Promise<AuthResponseDto> {
    if (!dto.name) {
      throw new BadRequestException(
        'Account name is required for registration.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        'An account with this email is already registered.',
      );
    }

    const salt = await this.crypto.genSalt(10);
    const hashedPassword = await this.crypto.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return new AuthResponseDto(user);
  }

  async login(dto: AuthDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email credentials.');
    }

    const isPasswordMatching = await this.crypto.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return new AuthResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    });
  }
}
