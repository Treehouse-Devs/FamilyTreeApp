import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Response, Request } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')
  use(req: Request, res: Response, next: () => void) {
    const startTime = Date.now()
    const { ip, method, originalUrl } = req
    const userAgent = req.get('user-agent') || ''

    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime
      const { statusCode } = res
      const contentLength = res.get('content-length')

      this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${elapsedTime}ms : [${res.statusCode} ${res.statusMessage}]`)
    })

    next()
  }
}
