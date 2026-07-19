import type { QueryRunner } from 'typeorm'
import { AddFamilyRootAndImageColumns1784467200000 } from './1784467200000-addFamilyRootAndImageColumns'

describe('AddFamilyRootAndImageColumns1784467200000', () => {
  const query = jest.fn<Promise<unknown>, [string]>()
  const queryRunner = { query } as unknown as QueryRunner
  const migration = new AddFamilyRootAndImageColumns1784467200000()

  beforeEach(() => {
    query.mockReset()
    query.mockResolvedValue(undefined)
  })

  it('adds the nullable family columns required by the entity', async () => {
    await migration.up(queryRunner)

    expect(query).toHaveBeenCalledTimes(1)
    expect(query.mock.calls[0][0]).toMatch(/ALTER TABLE "families"/)
    expect(query.mock.calls[0][0]).toMatch(/ADD "rootId" uuid/)
    expect(query.mock.calls[0][0]).toMatch(/ADD "familyImageUrl" character varying/)
    expect(query.mock.calls[0][0]).not.toMatch(/NOT NULL/)
  })

  it('removes both family columns when reverted', async () => {
    await migration.down(queryRunner)

    expect(query).toHaveBeenCalledTimes(1)
    expect(query.mock.calls[0][0]).toMatch(/ALTER TABLE "families"/)
    expect(query.mock.calls[0][0]).toMatch(/DROP COLUMN "familyImageUrl"/)
    expect(query.mock.calls[0][0]).toMatch(/DROP COLUMN "rootId"/)
  })
})
