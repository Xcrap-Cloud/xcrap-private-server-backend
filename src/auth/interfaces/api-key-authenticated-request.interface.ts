import { UserRole } from "@prisma/client"

import { Request } from "express"

export interface ApiKeyAuthenticatedUser {
    id: string
    email: string
    username: string
    role: UserRole
}

export interface ApiKeyAuthenticatedRequest extends Request {
    user: ApiKeyAuthenticatedUser
}
