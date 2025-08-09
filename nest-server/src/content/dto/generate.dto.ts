import { IsString, MinLength } from "class-validator"

export class GenerateDto {
  @IsString()
  @MinLength(3)
  prompt!: string
}
