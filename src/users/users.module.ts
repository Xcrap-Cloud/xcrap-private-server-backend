import { Module } from "@nestjs/common"

import { PrismaModule } from "../prisma/prisma.module"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
    imports: [PrismaModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: "RESOURCE_SERVICE",
            useClass: UsersService,
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
