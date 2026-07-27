import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { BoundedValueSerializer } from './bounded-value.serializer'
import { FailureCaptureMiddleware } from './failure-capture.middleware'
import { FailureEventWriter, StdoutFailureEventSink } from './failure-event-writer.service'
import { FailureExceptionFilter } from './failure-exception.filter'
import { FailureRequestContextStore } from './failure-request-context.store'
import { FAILURE_EVENT_SINK, LOG_MONITOR_ENABLED, LOG_MONITOR_ENVIRONMENT } from './log-monitor.constants'

@Module({
  imports: [ConfigModule],
  providers: [
    BoundedValueSerializer,
    FailureCaptureMiddleware,
    FailureRequestContextStore,
    FailureEventWriter,
    StdoutFailureEventSink,
    {
      provide: FAILURE_EVENT_SINK,
      useExisting: StdoutFailureEventSink,
    },
    {
      provide: LOG_MONITOR_ENABLED,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get<boolean>('LOG_MONITOR_ENABLED', false),
    },
    {
      provide: LOG_MONITOR_ENVIRONMENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get<string>('LOG_MONITOR_ENVIRONMENT', 'development'),
    },
    {
      provide: APP_FILTER,
      useClass: FailureExceptionFilter,
    },
  ],
})
export class LogMonitorModule { }
