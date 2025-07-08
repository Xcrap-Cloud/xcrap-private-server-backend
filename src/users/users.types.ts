import { User } from "@prisma/client"

export type UserWithoutSensitiveInfo = Omit<User, "password" | "apiKey">
