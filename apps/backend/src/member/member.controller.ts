import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { MemberService } from './member.service'
import { PatchFamilyMemberDto, DetailedPersonDto, UploadMemberImageResponseDto } from '@treely/dto'
import { memoryStorage } from 'multer'

@Controller('trees')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  @Get(':treeId/person/:personId')
  async getPerson(
    @Param('treeId') treeId: string,
    @Param('personId') personId: string,
    @GetUser() user: UserFromToken,
  ): Promise<{ person: DetailedPersonDto }> {
    const person = await this.memberService.findOneDetailed(treeId, personId, user.uid)

    return { person }
  }

  @Patch(':treeId/person/:personId')
  async patchPerson(
    @Param('treeId') treeId: string,
    @Param('personId') personId: string,
    @Body() dto: PatchFamilyMemberDto,
    @GetUser() user: UserFromToken,
  ): Promise<{ person: DetailedPersonDto }> {
    const person = await this.memberService.updateDetailed(treeId, personId, dto, user.uid)

    return { person }
  }

  @Post(':treeId/person/:personId/image')
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
    @Param('treeId') treeId: string,
    @Param('personId') personId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserFromToken,
  ): Promise<UploadMemberImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return this.memberService.updateMemberImage(treeId, personId, file, user.uid)
  }
}
