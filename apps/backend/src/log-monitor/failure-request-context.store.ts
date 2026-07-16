import { Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type { FailureExceptionDetails } from './failure-event.types'
import { BoundedBodyCapture } from './bounded-body-capture'

export interface FailureRequestContext {
  requestId: string
  startedAt: number
  requestBody: BoundedBodyCapture
  responseBody: BoundedBodyCapture
  exception?: FailureExceptionDetails
}

@Injectable()
export class FailureRequestContextStore {
  private readonly contexts = new WeakMap<Request, FailureRequestContext>()

  create(request: Request, requestId: string): FailureRequestContext {
    const context: FailureRequestContext = {
      requestId,
      startedAt: Date.now(),
      requestBody: new BoundedBodyCapture(),
      responseBody: new BoundedBodyCapture(),
    }
    this.contexts.set(request, context)

    return context
  }

  setException(request: Request, exception: FailureExceptionDetails): void {
    const context = this.contexts.get(request)
    if (context) {
      context.exception = exception
    }
  }

  delete(request: Request): void {
    this.contexts.delete(request)
  }
}
