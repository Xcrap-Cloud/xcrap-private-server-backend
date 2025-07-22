import { Prisma, PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import * as bcrypt from "bcrypt"

import { ParsingModelFieldType } from "../src/scrapers/enums/parsing-model-field-type.enum"
import * as crypto from "node:crypto"

dotenv.config()

const prisma = new PrismaClient()

function env(name: string): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Environment variable ${name} is missing`)
    }

    return value
}

function encryptApiKey(apiKey: string): string {
    const encryptionAlgorithm = env("ENCRYPTION_ALGORITHM")
    const encryptionKey = Buffer.from(env("ENCRYPTION_KEY"), "hex")
    const encryptionIv = Buffer.from(env("ENCRYPTION_IV"), "hex")
    const cipher = crypto.createCipheriv(encryptionAlgorithm, encryptionKey, encryptionIv)
    return `${cipher.update(apiKey, "utf8", "hex")}${cipher.final("hex")}`
}

const adminData = {
    username: env("ADMIN_DEFAULT_USERNAME"),
    email: env("ADMIN_DEFAULT_EMAIL"),
    name: env("ADMIN_DEFAULT_NAME"),
    password: env("ADMIN_DEFAULT_PASSWORD"),
    apiKey: env("ADMIN_DEFAULT_API_KEY"),
}

const adminId = env("ADMIN_DEFAULT_ID")

const axiosClientId = "3a58a5e2-9b08-4860-b8bd-501898d57317"
const gotScrapingClientId = "49f7f7a8-8634-4dfa-b12e-15af53ba532b"
const httpCoreClientId = "d19a8915-c110-456e-8d9d-8097283a2097"

const clients: Prisma.ClientCreateInput[] = [
    {
        id: axiosClientId,
        type: "axios",
        name: "Axios Client",
        description: "Basic Axios Client",
        owner: {
            connect: {
                id: adminId,
            },
        },
    },
    {
        id: gotScrapingClientId,
        type: "got_scraping",
        name: "Got Scraping Client",
        description: "Basic Got Scraping Client",
        owner: {
            connect: {
                id: adminId,
            },
        },
    },
    {
        id: httpCoreClientId,
        type: "http_core",
        name: "HTTP Core Client",
        description: "Basic HTTP Core Client",
        owner: {
            connect: {
                id: adminId,
            },
        },
    },
]

const scrapers: Prisma.ScraperCreateInput[] = [
    {
        name: "Metadata Scraper",
        description: "Metadata Scraper",
        client: {
            connect: {
                id: httpCoreClientId,
            },
        },
        defaultUrl: "https://google.com",
        owner: {
            connect: {
                id: adminId,
            },
        },
        parsingModel: {
            type: ParsingModelFieldType.HTML,
            model: {
                metadata: {
                    query: "head",
                    nested: {
                        type: ParsingModelFieldType.HTML,
                        model: {
                            title: {
                                query: "title",
                                extractor: "innerText",
                                default: "null",
                            },
                            description: {
                                query: "meta[name='description']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            keywords: {
                                query: "meta[name='keywords']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            author: {
                                query: "meta[name='author'], meta[property='article:author']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            viewport: {
                                query: "meta[name='viewport']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            charset: {
                                query: "meta[charset]",
                                extractor: "attribute:charset",
                                default: "null",
                            },
                            robots: {
                                query: "meta[name='robots']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            ogTitle: {
                                query: "meta[property='og:title']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            ogDescription: {
                                query: "meta[property='og:description']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            ogType: {
                                query: "meta[property='og:type']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            ogImage: {
                                query: "meta[property='og:image']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            ogUrl: {
                                query: "meta[property='og:url']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            twitterCard: {
                                query: "meta[name='twitter:card']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            twitterTitle: {
                                query: "meta[name='twitter:title']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            twitterDescription: {
                                query: "meta[name='twitter:description']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            twitterImage: {
                                query: "meta[name='twitter:image']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            canonical: {
                                query: "link[rel='canonical']",
                                extractor: "attribute:href",
                                default: "null",
                            },
                            favicon: {
                                query: "link[rel='icon'], link[rel='shortcut icon']",
                                extractor: "attribute:href",
                                default: "null",
                            },
                            themeColor: {
                                query: "meta[name='theme-color']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            contentLanguage: {
                                query: "meta[http-equiv='content-language']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                            contentType: {
                                query: "meta[http-equiv='content-type']",
                                extractor: "attribute:content",
                                default: "null",
                            },
                        },
                    },
                },
            },
        },
    },
]

async function seedAdminUser() {
    console.log("Checking for existing admin user...")

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminData.email },
        select: { id: true },
    })

    if (existingAdmin) {
        console.log("Admin already exists!")
        return
    }

    console.log("Creating admin user...")

    const hashSalts = parseInt(env("BCRYPT_SALT_ROUNDS"))
    const hashedPassword = await bcrypt.hash(adminData.password, hashSalts)
    const encryptedApiKey = encryptApiKey(adminData.apiKey)

    await prisma.user.create({
        data: {
            name: adminData.name,
            username: adminData.username,
            email: adminData.email,
            role: "ADMIN",
            password: hashedPassword,
            apiKey: encryptedApiKey,
        },
    })

    console.log("Admin created successfully!")
}

async function seedClients() {
    for (const client of clients) {
        const existingClient = await prisma.client.findFirst({
            where: {
                name: client.name,
                ownerId: adminId,
                type: client.type,
            },
            select: {
                id: true,
            },
        })

        if (existingClient) {
            console.log(`Client '${client.name}' já existe, pulando.`)
            continue
        }

        await prisma.client.create({ data: client })
        console.log(`Client '${client.name}' criado com sucesso.`)
    }
}

async function seedScrapers() {
    for (const scraper of scrapers) {
        const existingScraper = await prisma.scraper.findFirst({
            where: {
                name: scraper.name,
                ownerId: scraper.id,
                clientId: scraper.client.connect?.id,
            },
        })

        if (existingScraper) {
            console.log(`Scraper '${scraper.name}' já existe, pulando.`)
            continue
        }

        await prisma.scraper.create({ data: scraper })
        console.log(`Scraper '${scraper.name}' criado com sucesso.`)
    }
}

async function main() {
    console.log("Starting database seeding...")

    try {
        await seedAdminUser()
        await seedClients()
        await seedScrapers()

        console.log("Database seeding completed successfully")
    } catch (error) {
        console.error("Seeding failed:", error)
        throw error
    } finally {
        console.log("Disconnecting Prisma client...")

        await prisma.$disconnect()

        console.log("Prisma client disconnected")
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
