import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/use-cases/user/enums/roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
