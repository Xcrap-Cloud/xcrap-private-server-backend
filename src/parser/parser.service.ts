import { ParsingModel as FactoryParsingModel, createParsingModel } from "@xcrap/factory"
import { BadRequestException, Injectable } from "@nestjs/common"
import { HttpResponse } from "@xcrap/core"

import configHelper from "../helpers/config.helper"

@Injectable()
export class ParserService {
    async parse(response: HttpResponse, parsingModel: FactoryParsingModel) {
        const model = createParsingModel({
            config: configHelper.factory.createParsingModelConfig,
            model: parsingModel,
        })

        const parserConstructor = configHelper.scrapers.parsers[parsingModel.type]

        if (!parserConstructor) {
            throw new BadRequestException(`No parser found for type: ${parsingModel.type}`)
        }

        const parser = new parserConstructor(response.text)

        if (parsingModel.type === "json") {
            return await parser.parseModel(model)
        } else if (["html", "markdown"].includes(parsingModel.type)) {
            return await parser.extractFirst({ model: model })
        } else {
            throw new Error(`Unsupported parsing model type: ${parsingModel.type}`)
        }
    }
}
