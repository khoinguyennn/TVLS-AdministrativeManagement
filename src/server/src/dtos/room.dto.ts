import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateRoomDto {
  @IsInt()
  @IsNotEmpty()
  public buildingId: number;

  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsInt()
  public buildingId?: number;

  @IsOptional()
  @IsString()
  public name?: string;
}
