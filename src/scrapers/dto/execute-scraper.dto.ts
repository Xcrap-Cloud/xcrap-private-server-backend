import { IsOptional, IsUrl } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ExecuteScraperDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    url?: string
}
