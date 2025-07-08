import { IsString, MaxLength, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

import configHelper from "../../helpers/config.helper"

export class UpdateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(configHelper.users.minNameLength)
    @MaxLength(configHelper.users.maxNameLength)
    name: string
}
