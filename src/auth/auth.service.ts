import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { User } from "@prisma/client"
import * as bcrypt from "bcrypt"

import { JwtAccessPayload, JwtRefreshPayload } from "./interfaces/jwt-payload.interface"
import { UserWithoutSensitiveInfo } from "../users/users.types"
import { RefreshTokenDto } from "./dto/refresh-token.dto"
import messagesHelper from "../helpers/messages.helper"
import { UsersService } from "../users/users.service"
import { SignUpDto } from "./dto/sign-up.dto"

@Injectable()
export class AuthService {
    private readonly refreshSignExpiresIn: string

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        configService: ConfigService,
    ) {
        this.refreshSignExpiresIn = configService.getOrThrow<string>("REFRESH_SIGN_EXPIRES_IN")
    }

    async signIn(user: User) {
        const accessPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        } satisfies JwtAccessPayload

        const refreshPayload = {
            sub: user.id,
        } satisfies JwtRefreshPayload

        return {
            accessToken: this.jwtService.sign(accessPayload),
            refreshToken: this.jwtService.sign(refreshPayload, {
                expiresIn: this.refreshSignExpiresIn,
            }),
        }
    }

    async signUp(signUpDto: SignUpDto) {
        return await this.usersService.create(signUpDto)
    }

    async refreshToken(userId: string, { refreshToken }: RefreshTokenDto) {
        let payload: JwtRefreshPayload

        try {
            payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken)
        } catch (error) {
            throw new UnauthorizedException(messagesHelper.INVALID_AUTHORIZATION_TOKEN)
        }

        if (payload.sub !== userId) {
            throw new UnauthorizedException(messagesHelper.INVALID_AUTHORIZATION_TOKEN)
        }

        const user = await this.usersService.findOne(payload.sub)

        const accessPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        } satisfies JwtAccessPayload

        const newRefreshPayload = {
            sub: user.id,
        } satisfies JwtRefreshPayload

        return {
            accessToken: this.jwtService.sign(accessPayload),
            refreshToken: this.jwtService.sign(newRefreshPayload, {
                expiresIn: this.refreshSignExpiresIn,
            }),
        }
    }

    async validateUser(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
        let user: User

        try {
            user = (await this.usersService.findOneByEmail(email)) as User
        } catch (error) {
            return null
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return null
        }

        const { password: _, ...rest } = user

        return rest
    }
}
