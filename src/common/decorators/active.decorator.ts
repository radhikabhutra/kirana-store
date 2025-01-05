import { SetMetadata } from '@nestjs/common';

export const ACTIVE_KEY = 'active';
export const Active = (active: boolean) => SetMetadata(ACTIVE_KEY, active);
