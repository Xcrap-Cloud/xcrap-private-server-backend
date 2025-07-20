import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseEnumPipe,
    DefaultValuePipe,
    ParseIntPipe,
    UseGuards,
} from "@nestjs/common"

import { ApiQuery } from "@nestjs/swagger"

import { MultiAuthenticatedUser } from "../auth/interfaces/multi-authenticated-request.interface"
import { OwnershipGuardFactory } from "../common/factories/ownership-guard.factory"
import { ExecuteOneDynamicScraperDto } from "./dto/execute-one-dynamic-scraper.dto"
import { MinValueValidationPipe } from "../common/pipes/min-number.pipe"
import { MaxValueValidationPipe } from "../common/pipes/max-number.pipe"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { ExecuteScraperDto } from "./dto/execute-scraper.dto"
import { UpdateScraperDto } from "./dto/update-scraper.dto"
import { CreateScraperDto } from "./dto/create-scraper.dto"
import { ScrapersService } from "./scrapers.service"
import configHelper from "../helpers/config.helper"

@Controller("scrapers")
// @UseGuards(MultiAuthGuard)
export class ScrapersController {
    constructor(private readonly scrapersService: ScrapersService) {}

    @Post()
    async create(@Body() createScraperDto: CreateScraperDto, @CurrentUser() user: MultiAuthenticatedUser) {
        return await this.scrapersService.create(user.id, createScraperDto)
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
        return await this.scrapersService.findAll({ page: page, perPage: perPage })
    }

    @Post("dynamic/execute")
    async executeOneDynamic(@Body() ExecuteOneDynamicScraperDto: ExecuteOneDynamicScraperDto) {
        return await this.scrapersService.executeOneDynamic(ExecuteOneDynamicScraperDto)
    }

    @Post(":id/execute")
    async executeOne(@Param("id") id: string, @Body() executeScraperDto: ExecuteScraperDto) {
        return await this.scrapersService.executeOne(id, executeScraperDto)
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        return await this.scrapersService.findOne(id)
    }

    @Patch(":id")
    @UseGuards(OwnershipGuardFactory("ownerId"))
    async update(@Param("id") id: string, @Body() updateScraperDto: UpdateScraperDto) {
        return await this.scrapersService.update(id, updateScraperDto)
    }

    @Delete(":id")
    async remove(@Param("id") id: string) {
        return await this.scrapersService.remove(id)
    }
}
