import { IsEnum, IsOptional, IsUUID, ValidateNested, IsString, IsBoolean, IsUrl, ValidateIf } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

import { ClientType } from "@prisma/client"

import { IsQueryRequiredIfNested } from "../decorators/is-query-required-if-nested.decorator"
import { IsRecordOfParsingField } from "../decorators/is-record-of-parsing-field.decorator"
import { ParsingModelFieldType } from "../enums/parsing-model-field-type.enum"

class CreateDynamicModelDto {
    [key: string]: CreateParsingModelFieldDto
}

export class CreateParsingModelDto {
    @ApiProperty({ enum: ParsingModelFieldType, enumName: "ParsingModelFieldType" })
    @IsEnum(ParsingModelFieldType)
    type: ParsingModelFieldType

    @ApiProperty()
    @IsRecordOfParsingField({
        message: "model must be a Record<string, CreateParsingModelFieldDto>",
    })
    model: CreateDynamicModelDto
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
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    method?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    userAgent?: string
}

export class DynamicClientDto {
    @ApiProperty({ enum: ClientType, enumName: "ClientType" })
    @IsEnum(ClientType)
    type: ClientType
}

export class ExecuteOneDynamicScraperDto {
    @ApiProperty()
    @IsUrl()
    url: string

    @ApiProperty({ required: false })
    @ValidateIf((object) => object.client === undefined || object.client === null, {
        message: "Client ID is required if Client is not provided.",
    })
    @IsUUID()
    clientId?: string

    @ApiProperty({ required: false })
    @ValidateIf((object) => object.clientId === undefined || object.clientId === null, {
        message: "Client is required if clientId is not provided.",
    })
    @ValidateNested()
    @Type(() => DynamicClientDto)
    client?: DynamicClientDto

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateParsingModelDto)
    parsingModel?: CreateParsingModelDto

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateRequestConfigDto)
    requestConfig?: CreateRequestConfigDto
}
