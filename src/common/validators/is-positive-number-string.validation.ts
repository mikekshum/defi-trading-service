import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsPositiveNumberString(validationOptions?: ValidationOptions) {
    const numbericRegex = /^\d+$/;
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: "isPositiveNumberString",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== "string") return false;
                    if (value.includes('.')) return false;
                    if (value.includes(',')) return false;
                    if (!numbericRegex.test(value)) return false;

                    const num = BigInt(value);
                    return num > 0n;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a positive integer string`;
                },
            },
        });
    };
}