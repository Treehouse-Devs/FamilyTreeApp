import { ServiceUnavailableException } from '@nestjs/common'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  const dataSource = { query: jest.fn() }
  const controller = new HealthController(dataSource as never)

  beforeEach(() => jest.clearAllMocks())

  it('reports process liveness', () => {
    expect(controller.liveness()).toEqual({ status: 'ok' })
  })

  it('reports readiness when PostgreSQL responds', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }])

    await expect(controller.readiness()).resolves.toEqual({ status: 'ok' })
  })

  it('rejects readiness when PostgreSQL is unavailable', async () => {
    dataSource.query.mockRejectedValue(new Error('connection refused'))

    await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException)
  })
})
