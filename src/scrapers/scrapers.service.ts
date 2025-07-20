import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common"
import { createPaginator, PaginateOptions } from "prisma-pagination"
import { ParsingModel as FactoryParsingModel } from "@xcrap/factory"
import { instanceToPlain } from "class-transformer"
import { HttpResponse } from "@xcrap/core"

import { ExecuteOneDynamicScraperDto } from "./dto/execute-one-dynamic-scraper.dto"
import { ExecuteScraperDto } from "./dto/execute-scraper.dto"
import { ClientsService } from "../clients/clients.service"
import { UpdateScraperDto } from "./dto/update-scraper.dto"
import { CreateScraperDto } from "./dto/create-scraper.dto"
import { PrismaService } from "../prisma/prisma.service"
import messagesHelper from "../helpers/messages.helper"

@Injectable()
export class ScrapersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly clientsService: ClientsService,
    ) {}

    async create(userId: string, createScraperDto: CreateScraperDto) {
        const { clientId, ...data } = createScraperDto

        return await this.prisma.scraper.create({
            data: {
                ...data,
                parsingModel: instanceToPlain(data.parsingModel),
                client: {
                    connect: {
                        id: clientId,
                    },
                },
                owner: {
                    connect: {
                        id: userId,
                    },
                },
            },
        })
    }

    async findAll({ page, perPage }: PaginateOptions) {
        const paginate = createPaginator({
            page: page,
            perPage: perPage,
        })

        return await paginate(this.prisma.scraper, {
            orderBy: {
                createdAt: "desc",
            },
        })
    }

    async findOne(id: string) {
        const scraper = await this.prisma.scraper.findUnique({
            where: {
                id: id,
            },
            include: {
                client: true,
            },
        })

        if (!scraper) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Scraper",
                    value: id,
                }),
            )
        }

        return scraper
    }

    private async safeExecuteRequest(httpClient: any, url: string) {
        try {
            return await httpClient.fetch({ url: url })
        } catch {
            throw new InternalServerErrorException(messagesHelper.REQUEST_FAILED)
        }
    }

    private async safeExecuteParser(response: HttpResponse, parsingModel: any) {
        try {
        } catch {
            throw new BadGatewayException(messagesHelper.PARSING_ERROR)
        }
    }

    async executeOne(id: string, executeScraperDto: ExecuteScraperDto) {
        const scraper = await this.findOne(id)
        const url = executeScraperDto.url || scraper.defaultUrl

        if (!url) {
            throw new BadRequestException(messagesHelper.REQUIRED_FIELD_MISSING("url"))
        }

        const httpClient = await this.clientsService.createHttpClient(scraper.clientId)
        const response = await this.safeExecuteRequest(httpClient, url)
        const data = await this.safeExecuteParser(response, scraper.parsingModel)

        return data
    }

    async executeOneDynamic(executeOneDynamicScraperDto: ExecuteOneDynamicScraperDto) {
        const parsingModel = {
            ...instanceToPlain(executeOneDynamicScraperDto.parsingModel),
        } as FactoryParsingModel

        const client = executeOneDynamicScraperDto.clientId
            ? await this.clientsService.createHttpClient(executeOneDynamicScraperDto.clientId)
            : await this.clientsService.createDynamicHttpClient(executeOneDynamicScraperDto.client!.type)

        const response = await this.safeExecuteRequest(client, executeOneDynamicScraperDto.url)
        const data = await this.safeExecuteParser(response, parsingModel)

        return data
    }

    async update(id: string, updateScraperDto: UpdateScraperDto) {
        const existingClient = await this.prisma.scraper.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingClient) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Scraper",
                    property: "id",
                    value: id,
                }),
            )
        }

        return await this.prisma.scraper.update({
            where: {
                id: id,
            },
            data: updateScraperDto,
        })
    }

    async remove(id: string) {
        const existingClient = await this.prisma.scraper.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingClient) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Scraper",
                    property: "id",
                    value: id,
                }),
            )
        }

        await this.prisma.scraper.delete({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })
    }
}
