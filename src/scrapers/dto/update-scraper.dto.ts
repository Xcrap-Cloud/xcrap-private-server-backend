import { ApiProperty, PartialType } from "@nestjs/swagger"

import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator"

import { CreateScraperDto } from "./create-scraper.dto"

export class UpdateScraperDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    defaultUrl?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    clientId?: string
}
