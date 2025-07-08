import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { UserRole } from "@prisma/client"
import { Reflector } from "@nestjs/core"

import { JwtAuthenticatedRequest } from "../interfaces/jwt-authenticated-request.interface"
import messagesHelper from "../../helpers/messages.helper"
import { ROLES_KEY } from "../decorators/roles.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!requiredRoles || requiredRoles.length === 0) {
            return true
        }

        const request = context.switchToHttp().getRequest() as JwtAuthenticatedRequest

        if (!request.user) {
            throw new UnauthorizedException(messagesHelper.UNAUTHORIZED_USER)
        }

        return requiredRoles.includes(request.user.role)
    }
}
