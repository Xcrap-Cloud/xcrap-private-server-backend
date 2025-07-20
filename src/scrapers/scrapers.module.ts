import { Module } from "@nestjs/common"

import { ScrapersController } from "./scrapers.controller"
import { ClientsModule } from "../clients/clients.module"
import { PrismaModule } from "../prisma/prisma.module"
import { ParserModule } from "../parser/parser.module"
import { ScrapersService } from "./scrapers.service"

@Module({
    imports: [PrismaModule, ClientsModule, ParserModule],
    controllers: [ScrapersController],
    providers: [
        ScrapersService,
        {
            provide: "RESOURCE_SERVICE",
            useExisting: ScrapersService,
        },
    ],
})
export class ScrapersModule {}
