import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { MemberService } from './member.service'
import { CreateFamilyMemberDto, PatchFamilyMemberDto, DetailedPersonDto, UploadMemberImageResponseDto } from '@treely/dto'
import { memoryStorage } from 'multer'
import type { FlatPersonDto } from '@treely/dto/family/family-response.dto'

@Controller('trees')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  @Post(':id/person')
  async createPerson(
    @Param('id') id: string,
    @Body() dto: CreateFamilyMemberDto,
    @GetUser() user: UserFromToken,
  ): Promise<FlatPersonDto> {
    return await this.memberService.create({ ...dto }, id, user.uid)
  }

  @Get(':id/person/:personId')
  async getPerson(
    @Param('id') id: string,
    @Param('personId') personId: string,
    @GetUser() user: UserFromToken,
  ): Promise<{ person: DetailedPersonDto }> {
    const person = await this.memberService.findOneDetailed(id, personId, user.uid)

    return { person }
  }

  @Patch(':id/person/:personId')
  async patchPerson(
    @Param('id') id: string,
    @Param('personId') personId: string,
    @Body() dto: PatchFamilyMemberDto,
    @GetUser() user: UserFromToken,
  ): Promise<{ person: DetailedPersonDto }> {
    const person = await this.memberService.updateDetailed(id, personId, dto, user.uid)

    return { person }
  }

  @Post(':id/person/:personId/image')
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
  async uploadPersonImage(
    @Param('id') id: string,
    @Param('personId') personId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserFromToken,
  ): Promise<UploadMemberImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return this.memberService.updateMemberImage(id, personId, file, user.uid)
  }
}
