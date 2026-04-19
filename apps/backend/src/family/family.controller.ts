import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FamilyService } from './family.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CreateFamilyDto } from '@treely/dto/family/create-family.dto'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { UpdateFamilyDto } from '@treely/dto/family/update-family.dto'
import { memoryStorage } from 'multer'
import type { FlatTreeDto, UploadFamilyImageResponseDto } from '@treely/dto/family/family-response.dto'

@Controller('trees')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) { }

  @Post()
  async create(@Body() createFamilyDto: CreateFamilyDto, @GetUser() user: UserFromToken): Promise<FlatTreeDto> {
    return await this.familyService.create(createFamilyDto, user)
  }

  @Get()
  async find(@Query('search') search: string, @GetUser() user: UserFromToken) {
    return await this.familyService.findAll(search, user.uid)
  }

  @Get(':id')
  async get(@Param('id') id: string, @GetUser() user: UserFromToken) {
    return await this.familyService.getTree(id, user.uid)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto, @GetUser() user: UserFromToken) {
    return await this.familyService.update(id, updateFamilyDto, user.uid)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: UserFromToken) {
    return await this.familyService.delete(id, user.uid)
  }

  @Post(':treeId/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false)
        }
      },
    }),
  )
  async uploadTreeImage(
    @Param('treeId') treeId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserFromToken,
  ): Promise<UploadFamilyImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return this.familyService.uploadFamilyImage(treeId, file, user.uid)
  }
}
