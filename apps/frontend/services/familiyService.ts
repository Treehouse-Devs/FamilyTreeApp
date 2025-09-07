import { FamilyNode } from '@/components/custom//family-list/list.type'
import { BaseService } from './base'
import { BaseResponseData } from '@/types/api'

export class FamilyService extends BaseService {
  async fetchFamiliesList(params: { search?: string } = {}): Promise<BaseResponseData<FamilyNode[]>> {
    return FamilyService.get('/families/list', params)
  }

  async createFamily(data: { name: string }): Promise<BaseResponseData<FamilyNode>> {
    return FamilyService.post('/families/create', data)
  }

  async deleteFamily(id: string): Promise<void> {
    return FamilyService.delete(`/families/delete/${id}`)
  }
}
