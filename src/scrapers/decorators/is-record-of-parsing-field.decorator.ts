import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator"
import { plainToInstance } from "class-transformer"
import { validateSync } from "class-validator"

import { CreateParsingModelFieldDto } from "../dto/execute-one-dynamic-scraper.dto"

@ValidatorConstraint({ async: false })
export class IsRecordOfParsingFieldConstraint implements ValidatorConstraintInterface {
    validate(value: any, _: ValidationArguments) {
        if (typeof value !== "object" || Array.isArray(value)) return false

        return Object.entries(value).every(([_, val]) => {
            const instance = plainToInstance(CreateParsingModelFieldDto, val)
            const errors = validateSync(instance)
            return errors.length === 0
        })
    }

    defaultMessage(_: ValidationArguments) {
        return "Each key in the model must be a valid CreateParsingModelFieldDto"
    }
}

export function IsRecordOfParsingField(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isRecordOfParsingField",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsRecordOfParsingFieldConstraint,
        })
    }
}
