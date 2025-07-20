import { IsEnum, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { ClientType } from "@prisma/client"

export class CreateClientDto {
    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsString()
    description: string

    @ApiProperty({ enum: ClientType, enumName: "ClientType" })
    @IsEnum(ClientType)
    type: ClientType
}
