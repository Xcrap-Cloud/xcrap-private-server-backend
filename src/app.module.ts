import { ConfigModule } from "@nestjs/config"
import { Module } from "@nestjs/common"

import { UsersModule } from "./users/users.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UsersModule,
    ],
})
export class AppModule {}
