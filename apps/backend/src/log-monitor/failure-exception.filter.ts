import { ArgumentsHost, Catch, Injectable } from '@nestjs/common'
import type { ExceptionFilter } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import type { Request } from 'express'
import { BoundedValueSerializer } from './bounded-value.serializer'
import { FailureRequestContextStore } from './failure-request-context.store'
import { EXCEPTION_STACK_MAX_BYTES } from './log-monitor.constants'

function exceptionMessage(exception: unknown): string {
  if (exception instanceof Error) {
    return exception.message
  }

  return String(exception)
}

@Catch()
@Injectable()
export class FailureExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  constructor(
    adapterHost: HttpAdapterHost,
    private readonly contexts: FailureRequestContextStore,
    private readonly serializer: BoundedValueSerializer,
  ) {
    super(adapterHost.httpAdapter)
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'http') {
      const request = host.switchToHttp().getRequest<Request>()
      this.contexts.setException(request, {
        name: exception instanceof Error ? exception.name : 'UnknownException',
        message: exceptionMessage(exception),
        stack: exception instanceof Error && exception.stack
          ? this.serializer.serializeText(exception.stack, EXCEPTION_STACK_MAX_BYTES)
          : undefined,
      })
    }

    super.catch(exception, host)
  }
}
