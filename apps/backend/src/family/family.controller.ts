import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { FamilyService } from './family.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CreateFamilyDto } from '@treely/dto/family/create-family.dto'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { UpdateFamilyDto } from '@treely/dto/family/update-family.dto'

@Controller('family')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) { }

  @Post()
  async create(@Body() createFamilyDto: CreateFamilyDto, @GetUser() user: UserFromToken) {
    createFamilyDto.createdByUid = user.uid
    return await this.familyService.create(createFamilyDto)
  }

  @Get()
  async find(@Query('search') search: string, @GetUser() user: UserFromToken) {
    return await this.familyService.findAll(search, user.uid)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto, @GetUser() user: UserFromToken) {
    return await this.familyService.update(id, updateFamilyDto, user.uid)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: UserFromToken) {
    return await this.familyService.delete(id, user.uid)
  }
}
