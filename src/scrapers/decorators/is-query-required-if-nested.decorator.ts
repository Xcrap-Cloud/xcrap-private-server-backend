import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator"

export function IsQueryRequiredIfNested(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isQueryRequiredIfNested",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(_: any, args: ValidationArguments) {
                    const obj = args.object as any
                    return !obj[property] || !!obj[propertyName]
                },
                defaultMessage(args: ValidationArguments) {
                    return "`query` is required when `nested` is present."
                },
            },
        })
    }
}
