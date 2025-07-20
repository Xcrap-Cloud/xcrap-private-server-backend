import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    UseGuards,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from "@nestjs/common"

import { ApiQuery } from "@nestjs/swagger"

import { MultiAuthenticatedUser } from "../auth/interfaces/multi-authenticated-request.interface"
import { MinValueValidationPipe } from "../common/pipes/min-number.pipe"
import { MaxValueValidationPipe } from "../common/pipes/max-number.pipe"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { MultiAuthGuard } from "../auth/guards/multi-auth.guard"
import { UpdateClientDto } from "./dto/update-client.dto"
import { CreateClientDto } from "./dto/create-client.dto"
import configHelper from "../helpers/config.helper"
import { ClientsService } from "./clients.service"

@Controller("clients")
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    @UseGuards(MultiAuthGuard)
    async create(@Body() createClientDto: CreateClientDto, @CurrentUser() user: MultiAuthenticatedUser) {
        return await this.clientsService.create(user.id, createClientDto)
    }

    @Get()
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "perPage", required: false, type: Number })
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
        return await this.clientsService.findAll({ page: page, perPage: perPage })
    }

    @Get(":id")
    @UseGuards(MultiAuthGuard)
    async findOne(@Param("id", ParseUUIDPipe) id: string) {
        return await this.clientsService.findOne(id)
    }

    @Patch(":id")
    @UseGuards(MultiAuthGuard)
    async update(@Param("id", ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
        return await this.clientsService.update(id, updateClientDto)
    }

    @Delete(":id")
    @UseGuards(MultiAuthGuard)
    async remove(@Param("id", ParseUUIDPipe) id: string) {
        return await this.clientsService.remove(id)
    }
}
