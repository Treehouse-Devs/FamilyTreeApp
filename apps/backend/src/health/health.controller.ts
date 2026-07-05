import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('live')
  liveness(): { status: 'ok' } {
    return { status: 'ok' }
  }

  @Get('ready')
  async readiness(): Promise<{ status: 'ok' }> {
    try {
      await this.dataSource.query('SELECT 1')

      return { status: 'ok' }
    } catch {
      throw new ServiceUnavailableException('Database is unavailable')
    }
  }
}
