import { FamilyNode } from '@/components/list.type'
import { BaseService } from './base'

export class FamilyService extends BaseService {
  async fetchFamiliesList(params: { search?: string } = {}): Promise<{ data: FamilyNode[] }> {
    return FamilyService.get('/families/list', params)
  }
}
