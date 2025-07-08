import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common"

import { LocalAuthenticatedRequest } from "./interfaces/local-authenticated-request.interface"
import { JwtAuthenticatedUser } from "./interfaces/jwt-authenticated-request.interface"
import { CurrentUser } from "./decorators/current-user.decorator"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { RefreshTokenDto } from "./dto/refresh-token.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { SignUpDto } from "./dto/sign-up.dto"
import { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("sign-in")
    @UseGuards(LocalAuthGuard)
    async signIn(@Req() req: LocalAuthenticatedRequest) {
        return await this.authService.signIn(req.user)
    }

    @Post("sign-up")
    async signUp(@Body() signUpDto: SignUpDto) {
        return await this.authService.signUp(signUpDto)
    }

    @Post("refresh-token")
    @UseGuards(JwtAuthGuard)
    async refreshToken(@CurrentUser() user: JwtAuthenticatedUser, @Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.refreshToken(user.id, refreshTokenDto)
    }
}
