import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserFromToken } from './auth.types'

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserFromToken } | { user: { data: UserFromToken } }>()

    return data ? 'data' in request.user ? request.user.data : undefined : 'user' in request ? request.user : undefined
  },
)
