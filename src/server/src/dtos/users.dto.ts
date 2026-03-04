import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  public fullName: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'manager', 'staff'])
  public role?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  public password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  public fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(32)
  public password?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'locked'])
  public status?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  public refreshToken: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  public credential: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;
}

export class VerifyOTPDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  public otp: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  public otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  public newPassword: string;
}
