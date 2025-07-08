import { ConfigModule } from "@nestjs/config"
import { Module } from "@nestjs/common"

import { StripeGlobalModule } from "./stripe-global.module"
import { UsersModule } from "./users/users.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        StripeGlobalModule,
        UsersModule,
    ],
})
export class AppModule {}
