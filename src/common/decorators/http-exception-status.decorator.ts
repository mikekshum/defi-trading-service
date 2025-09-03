// Adds http status to service-level exceptions to separate concepts
export function HttpExceptionStatus(status: number) {
    return function (target: Function) {
        Reflect.defineMetadata("httpExceptionStatus", status, target);
    }
}