import { ConsoleLogger, Injectable, LoggerService, Scope } from "@nestjs/common";

// An implementation of LoggerService, imported and set context in modules
// Scope: Scope.TRANSIENT makes it possible to use different context in each module
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger implements LoggerService { }