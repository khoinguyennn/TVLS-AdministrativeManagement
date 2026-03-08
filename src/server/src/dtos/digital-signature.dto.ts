import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class SetSignaturePinDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Mã PIN phải đúng 6 số' })
  @Matches(/^\d{6}$/, { message: 'Mã PIN phải đúng 6 số' })
  public pin: string;
}

export class ChangeSignaturePinDto {
  @IsString()
  @IsNotEmpty()
  public currentPin: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Mã PIN phải đúng 6 số' })
  @Matches(/^\d{6}$/, { message: 'Mã PIN phải đúng 6 số' })
  public newPin: string;
}

export class VerifySignaturePinDto {
  @IsString()
  @IsNotEmpty()
  public pin: string;
}
