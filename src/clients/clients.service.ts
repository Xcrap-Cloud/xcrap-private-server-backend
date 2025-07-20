import { createPaginator, PaginateOptions } from "prisma-pagination"
import { Injectable, NotFoundException } from "@nestjs/common"
import { Client, ClientType, Prisma } from "@prisma/client"

import { createClient } from "@xcrap/factory"

import { UpdateClientDto } from "./dto/update-client.dto"
import { CreateClientDto } from "./dto/create-client.dto"
import { PrismaService } from "../prisma/prisma.service"
import messagesHelper from "../helpers/messages.helper"
import configHelper from "../helpers/config.helper"

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, createClientDto: CreateClientDto) {
        return await this.prisma.client.create({
            data: {
                name: createClientDto.name,
                type: createClientDto.type,
                description: createClientDto.description,
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

        return await paginate<Client, Prisma.ClientFindManyArgs>(this.prisma.client, {
            orderBy: {
                createdAt: "desc",
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })
    }

    async findOne(id: string) {
        const client = await this.prisma.client.findUnique({
            where: {
                id: id,
            },
        })

        if (!client) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "Client",
                    value: id,
                }),
            )
        }

        return client
    }

    async update(id: string, updateClientDto: UpdateClientDto) {
        const existingClient = await this.prisma.client.findUnique({
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
                    name: "Client",
                    property: "id",
                    value: id,
                }),
            )
        }

        return await this.prisma.client.update({
            where: {
                id: id,
            },
            data: {
                name: updateClientDto.name,
                type: updateClientDto.type,
                description: updateClientDto.description,
            },
        })
    }

    async remove(id: string) {
        const existingClient = await this.prisma.client.findUnique({
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
                    name: "Client",
                    property: "id",
                    value: id,
                }),
            )
        }

        await this.prisma.client.delete({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })
    }

    async createHttpClient(id: string) {
        const client = await this.findOne(id)

        const httpClient = createClient({
            config: configHelper.factory.createClientConfig,
            type: client.type,
            options: {},
        })

        return httpClient
    }

    async createDynamicHttpClient(type: string) {
        const httpClient = createClient({
            config: configHelper.factory.createClientConfig,
            type: type as ClientType,
            options: {},
        })

        return httpClient
    }
}
