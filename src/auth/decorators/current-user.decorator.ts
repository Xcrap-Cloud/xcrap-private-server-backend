import { createParamDecorator, ExecutionContext } from "@nestjs/common"

import { JwtAuthenticatedRequest } from "../interfaces/jwt-authenticated-request.interface"

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as JwtAuthenticatedRequest
    return request.user
})
