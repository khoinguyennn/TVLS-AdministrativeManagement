import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class SetSignaturePinDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'Mã PIN chỉ chứa số' })
  public pin: string;
}

export class ChangeSignaturePinDto {
  @IsString()
  @IsNotEmpty()
  public currentPin: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'Mã PIN chỉ chứa số' })
  public newPin: string;
}

export class VerifySignaturePinDto {
  @IsString()
  @IsNotEmpty()
  public pin: string;
}
