import { Module } from "@nestjs/common"

import { ClientsController } from "./clients.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { ClientsService } from "./clients.service"

@Module({
    imports: [PrismaModule],
    controllers: [ClientsController],
    providers: [ClientsService],
    exports: [ClientsService],
})
export class ClientsModule {}
