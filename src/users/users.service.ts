import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { createPaginator, PaginateOptions } from "prisma-pagination"
import { InjectStripeClient } from "@golevelup/nestjs-stripe"
import { Prisma, User } from "@prisma/client"
import Stripe from "stripe"

import { generateApiKey } from "../utils/generate-api-key"
import { PrismaService } from "../prisma/prisma.service"
import { CryptoService } from "../crypto/crypto.service"
import messagesHelper from "../helpers/messages.helper"
import { UpdateUserDto } from "./dto/update-user.dto"
import { CreateUserDto } from "./dto/create-user.dto"

@Injectable()
export class UsersService {
    constructor(
        @InjectStripeClient() private readonly stripe: Stripe,
        private readonly prisma: PrismaService,
        private readonly cryptoService: CryptoService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const { password, ...rest } = createUserDto

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: createUserDto.email,
                username: createUserDto.username,
            },
            select: {
                email: true,
            },
        })

        if (existingUser) {
            const property = createUserDto.email === existingUser.email ? "email" : "username"

            throw new ConflictException(
                messagesHelper.OBJECT_ALREADY_EXISTS({
                    name: "User",
                    property: property,
                    value: createUserDto[property],
                }),
            )
        }

        const generatedApiKey = generateApiKey()
        const encryptedApiKey = this.cryptoService.encrypt(generatedApiKey)
        const hashedPassword = await this.cryptoService.hashPassword(password)

        return await this.prisma.user.create({
            data: {
                ...rest,
                apiKey: encryptedApiKey,
                password: hashedPassword,
            },
        })
    }

    async findAll({ page, perPage }: PaginateOptions) {
        const paginate = createPaginator({
            page: page,
            perPage: perPage,
        })

        return await paginate<User, Prisma.UserFindManyArgs>(this.prisma.user, {
            omit: {
                password: true,
                apiKey: true,
            },
        })
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            omit: {
                apiKey: true,
                password: true,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    value: id,
                }),
            )
        }

        return user
    }

    async findOneByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "email",
                    value: email,
                }),
            )
        }

        return user
    }

    async findOneByApiKey(apiKey: string) {
        const encryptedApiKey = this.cryptoService.encrypt(apiKey)

        const user = await this.prisma.user.findUnique({
            where: {
                apiKey: encryptedApiKey,
            },
        })

        if (!user) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "apiKey",
                    value: apiKey,
                }),
            )
        }

        return user
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingUser) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "id",
                    value: id,
                }),
            )
        }

        return await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                ...updateUserDto,
            },
        })
    }

    async remove(id: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
            },
        })

        if (!existingUser) {
            throw new NotFoundException(
                messagesHelper.OBJECT_NOT_FOUND({
                    name: "User",
                    property: "id",
                    value: id,
                }),
            )
        }

        await this.prisma.user.delete({
            where: {
                id: id,
            },
        })
    }
}
