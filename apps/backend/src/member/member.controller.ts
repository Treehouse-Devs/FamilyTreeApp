import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { MemberService } from './member.service'
import { CreateFamilyMemberDto } from '@treely/dto/member/create-family-member.dto'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { FamilyMember } from './entities/family-member.entity'
import { PatchFamilyMemberDto } from '@treely/dto/member/patch-family-member-dto'

@Controller('family-member')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
  ) { }

  @Post()
  async create(@Body() createFamilyMemberDto: CreateFamilyMemberDto, @GetUser() user: UserFromToken): Promise<FamilyMember> {
    return await this.memberService.create(createFamilyMemberDto, user.uid)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: UserFromToken): Promise<FamilyMember | null> {
    return await this.memberService.findOne(id, user.uid)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() patchFamilyMemberDto: PatchFamilyMemberDto, @GetUser() user: UserFromToken): Promise<FamilyMember | null> {
    return await this.memberService.update(id, patchFamilyMemberDto, user.uid)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: UserFromToken): Promise<void> {
    await this.memberService.delete(id, user.uid)
  }
}
