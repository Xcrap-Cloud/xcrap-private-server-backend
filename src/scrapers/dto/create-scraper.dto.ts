import {
    IsEnum,
    IsOptional,
    IsUUID,
    ValidateNested,
    IsString,
    IsBoolean,
    IsObject,
    IsUrl,
    IsNotEmpty,
} from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

import { IsQueryRequiredIfNested } from "../decorators/is-query-required-if-nested.decorator"
import { ParsingModelFieldType } from "../enums/parsing-model-field-type.enum"

export class CreateParsingModelDto {
    @ApiProperty({ enum: ParsingModelFieldType, enumName: "ParsingModelFieldType" })
    @IsEnum(ParsingModelFieldType)
    type: ParsingModelFieldType

    @ApiProperty()
    @IsObject()
    @ValidateNested({ each: true })
    @Type(() => CreateParsingModelFieldDto)
    model: Record<string, CreateParsingModelFieldDto>
}

export class CreateParsingModelFieldDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsQueryRequiredIfNested("nested", {
        message: "`query` is required when `nested` is present.",
    })
    query?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    extractor?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    multiple?: boolean

    @ApiProperty({ required: false })
    @IsOptional()
    default?: any

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateParsingModelDto)
    nested?: CreateParsingModelDto
}

export class CreateRequestConfigDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    method?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    userAgent?: string
}

export class CreateScraperDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    defaultUrl?: string

    @ApiProperty()
    @IsUUID()
    clientId: string

    @ApiProperty()
    @ValidateNested()
    @Type(() => CreateParsingModelDto)
    parsingModel: CreateParsingModelDto

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateRequestConfigDto)
    requestConfig?: CreateRequestConfigDto
}
