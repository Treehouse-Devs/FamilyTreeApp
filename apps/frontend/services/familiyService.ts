import { FamilyNode } from '@/components/list.type'
import { BaseService } from './base'

export class FamilyService extends BaseService {
  async fetchFamiliesList(): Promise<{ families: FamilyNode[] }> {
    return FamilyService.get('/families/list')
  }
}
