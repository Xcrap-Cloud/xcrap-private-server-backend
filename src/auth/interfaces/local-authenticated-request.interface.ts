import { User } from "@prisma/client"

import { Request } from "express"

export type LocalAuthenticatedUser = User

export interface LocalAuthenticatedRequest extends Request {
    user: LocalAuthenticatedUser
}
