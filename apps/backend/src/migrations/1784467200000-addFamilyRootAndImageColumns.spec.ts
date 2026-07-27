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
    const [[sql]] = query.mock.calls
    expect(sql).toMatch(/ALTER TABLE "families"/)
    expect(sql).toMatch(/ADD "rootId" uuid/)
    expect(sql).toMatch(/ADD "familyImageUrl" character varying/)
    expect(sql).not.toMatch(/NOT NULL/)
  })

  it('removes both family columns when reverted', async () => {
    await migration.down(queryRunner)

    expect(query).toHaveBeenCalledTimes(1)
    const [[sql]] = query.mock.calls
    expect(sql).toMatch(/ALTER TABLE "families"/)
    expect(sql).toMatch(/DROP COLUMN "familyImageUrl"/)
    expect(sql).toMatch(/DROP COLUMN "rootId"/)
    expect(sql.indexOf('DROP COLUMN "familyImageUrl"')).toBeLessThan(sql.indexOf('DROP COLUMN "rootId"'))
  })
})
