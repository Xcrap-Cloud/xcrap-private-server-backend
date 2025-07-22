import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common"
import { createPaginator, PaginateOptions } from "prisma-pagination"
import { ParsingModel as FactoryParsingModel } from "@xcrap/factory"
import { defaultUserAgent, HttpResponse } from "@xcrap/core"
import { instanceToPlain } from "class-transformer"

import { Prisma, Scraper } from "@prisma/client"

import { ExecuteOneDynamicScraperDto } from "./dto/execute-one-dynamic-scraper.dto"
import { ExecuteScraperDto } from "./dto/execute-scraper.dto"
import { ClientsService } from "../clients/clients.service"
import { UpdateScraperDto } from "./dto/update-scraper.dto"
import { CreateScraperDto } from "./dto/create-scraper.dto"
import { PrismaService } from "../prisma/prisma.service"
import { ParserService } from "../parser/parser.service"
import messagesHelper from "../helpers/messages.helper"

@Injectable()
export class ScrapersService {
    private readonly logger = new Logger(ScrapersService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly clientsService: ClientsService,
        private readonly parserService: ParserService,
    ) {}

    async create(userId: string, createScraperDto: CreateScraperDto) {
        const { clientId, ...data } = createScraperDto

        await this.clientsService.findOne(clientId)

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

        return await paginate<Scraper, Prisma.ScraperFindManyArgs>(this.prisma.scraper, {
            orderBy: {
                createdAt: "desc",
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        })
    }

    async findOne(id: string) {
        const scraper = await this.prisma.scraper.findUnique({
            where: {
                id: id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
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

    private async safeExecuteRequest(httpClient: any, url: string): Promise<HttpResponse> {
        try {
            return await httpClient.fetch({ url: url })
        } catch (error) {
            this.logger.error(`Failed to execute request for URL: ${url}`, error)
            throw new InternalServerErrorException(messagesHelper.REQUEST_FAILED)
        }
    }

    private async safeExecuteParser(response: HttpResponse, parsingModel: any) {
        try {
            return await this.parserService.parse(response, parsingModel)
        } catch (error) {
            this.logger.error(`Failed to execute parser for response: ${response}`, error)
            throw new BadGatewayException(messagesHelper.PARSING_ERROR)
        }
    }

    async executeOne(id: string, executeScraperDto: ExecuteScraperDto) {
        const scraper = await this.findOne(id)
        const url = executeScraperDto.url || scraper.defaultUrl

        if (!url) {
            throw new BadRequestException(messagesHelper.REQUIRED_FIELD_MISSING("url"))
        }

        const metadata: Record<string, any> = {}

        const httpClient = await this.clientsService.createHttpClient(scraper.clientId)
        const requestStartTime = Date.now()
        const response = await this.safeExecuteRequest(httpClient, url)
        const requestEndTime = Date.now()

        metadata.request = {
            url: url,
            startTime: requestStartTime,
            endTime: requestEndTime,
            duration: requestEndTime - requestStartTime,
            hadRetries: response.hadRetries(),
            attempts: response.attempts,
            userAgent: httpClient.userAgent ?? defaultUserAgent,
        }

        metadata.response = {
            status: response.status,
            statusText: response.statusText,
            contentType: response.getHeader("content-type"),
        }

        const parsingStartTime = Date.now()
        const data = await this.safeExecuteParser(response, scraper.parsingModel)
        const parsingEndTime = Date.now()

        metadata.parsing = {
            startTime: parsingStartTime,
            endTime: parsingEndTime,
            duration: parsingEndTime - parsingStartTime,
        }

        return {
            metadata: metadata,
            data: data,
        }
    }

    async executeOneDynamic(executeOneDynamicScraperDto: ExecuteOneDynamicScraperDto) {
        const parsingModel = {
            ...instanceToPlain(executeOneDynamicScraperDto.parsingModel),
        } as FactoryParsingModel

        const httpClient = executeOneDynamicScraperDto.clientId
            ? await this.clientsService.createHttpClient(executeOneDynamicScraperDto.clientId)
            : await this.clientsService.createDynamicHttpClient(executeOneDynamicScraperDto.client!.type)

        const metadata: Record<string, any> = {}

        const requestStartTime = Date.now()
        const response = await this.safeExecuteRequest(httpClient, executeOneDynamicScraperDto.url)
        const requestEndTime = Date.now()

        metadata.request = {
            url: executeOneDynamicScraperDto.url,
            startTime: requestStartTime,
            endTime: requestEndTime,
            duration: requestEndTime - requestStartTime,
            hadRetries: response.hadRetries(),
            attempts: response.attempts,
            userAgent: httpClient.userAgent ?? defaultUserAgent,
        }

        metadata.response = {
            status: response.status,
            statusText: response.statusText,
            contentType: response.getHeader("content-type"),
        }

        const parsingStartTime = Date.now()
        const data = await this.safeExecuteParser(response, parsingModel)
        const parsingEndTime = Date.now()

        metadata.parsing = {
            startTime: parsingStartTime,
            endTime: parsingEndTime,
            duration: parsingEndTime - parsingStartTime,
        }

        return {
            metadata: metadata,
            data: data,
        }
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
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
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
