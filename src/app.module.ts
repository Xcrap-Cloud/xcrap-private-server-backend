import { ConfigModule } from "@nestjs/config"
import { Module } from "@nestjs/common"

import { DiscordWebhookModule } from "./discord-webhook/discord-webhook.module"
import { StripeGlobalModule } from "./stripe-global.module"
import { MailerModule } from "./mailer/mailer.module"
import { PrismaModule } from "./prisma/prisma.module"
import { CryptoModule } from "./crypto/crypto.module"
import { UsersModule } from "./users/users.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        StripeGlobalModule,
        UsersModule,
        PrismaModule,
        CryptoModule,
        DiscordWebhookModule,
        MailerModule,
    ],
})
export class AppModule {}
