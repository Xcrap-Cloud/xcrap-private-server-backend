import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    UseGuards,
} from "@nestjs/common"
import { ApiQuery } from "@nestjs/swagger"
import { UserRole } from "@prisma/client"

import { OwnershipGuardFactory } from "../common/factories/ownership-guard.factory"
import { MinValueValidationPipe } from "../common/pipes/min-number.pipe"
import { MaxValueValidationPipe } from "../common/pipes/max-number.pipe"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { RolesGuard } from "../auth/guards/roles.guard"
import { UpdateUserDto } from "./dto/update-user.dto"
import { CreateUserDto } from "./dto/create-user.dto"
import configHelper from "../helpers/config.helper"
import { UsersService } from "./users.service"

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto)
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiQuery({
        name: "page",
        required: false,
        type: Number,
        minimum: configHelper.pagination.minPage,
    })
    @ApiQuery({
        name: "perPage",
        required: false,
        type: Number,
        minimum: configHelper.pagination.minPerPage,
        maximum: configHelper.pagination.maxPerPage,
    })
    async findAll(
        @Query(
            "page",
            new DefaultValuePipe(configHelper.pagination.defaultPage),
            ParseIntPipe,
            new MinValueValidationPipe(configHelper.pagination.minPage),
        )
        page: number,
        @Query(
            "perPage",
            new DefaultValuePipe(configHelper.pagination.defaultPerPage),
            ParseIntPipe,
            new MinValueValidationPipe(configHelper.pagination.minPerPage),
            new MaxValueValidationPipe(configHelper.pagination.maxPerPage),
        )
        perPage: number,
    ) {
        return await this.usersService.findAll({
            page: page,
            perPage: perPage,
        })
    }

    @Get(":id")
    async findOne(@Param("id", ParseUUIDPipe) id: string) {
        return await this.usersService.findOne(id)
    }

    @Patch(":id")
    @UseGuards(OwnershipGuardFactory("id"))
    async update(@Param("id", ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.update(id, updateUserDto)
    }

    @Delete(":id")
    @Roles(UserRole.ADMIN)
    async remove(@Param("id", ParseUUIDPipe) id: string) {
        return await this.usersService.remove(id)
    }
}
