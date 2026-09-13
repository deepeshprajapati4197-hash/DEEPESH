import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  accessToken?: string;

  constructor(partial: Record<string, unknown>) {
    Object.assign(this, partial);
  }
}
