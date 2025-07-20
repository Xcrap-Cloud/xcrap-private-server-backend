import { ConfigModule } from "@nestjs/config"
import { Module } from "@nestjs/common"

import { ScrapersModule } from "./scrapers/scrapers.module"
import { ClientsModule } from "./clients/clients.module"
import { ParserModule } from "./parser/parser.module"
import { UsersModule } from "./users/users.module"
import { AuthModule } from "./auth/auth.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UsersModule,
        ScrapersModule,
        ParserModule,
        ClientsModule,
    ],
})
export class AppModule {}
