import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: 'Please provide a valid shop email address.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be blank.' })
  name?: string;
}
