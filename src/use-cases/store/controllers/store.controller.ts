import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Active } from 'src/common/decorators/active.decorator';
import { Roles } from 'src/common/decorators/roles.decorators';
import { User } from 'src/common/decorators/user.decorator';
import { ActiveGuard } from 'src/common/guards/active.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { IUser } from '../../user/entities/user.entity';
import { UserRole } from '../../user/enums/roles';
import { CreateStoreDto, UpdateStoreDto } from '../dtos/store.dto';
import { StoreService } from '../services/store.service';

@Controller('store')
@UseGuards(JwtAuthGuard, RolesGuard, ActiveGuard)
@Active(true)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * Creates a new store for the current user.
   *
   * @param createStoreDto - The data transfer object containing store details.
   * @param user - The user object extracted from the request, representing the current user.
   * @returns A promise that resolves with the created store object.
   * @throws BadRequestException if the user already owns a store.
   */
  @Post()
  @Roles(UserRole.READ_ONLY, UserRole.READ_WRITE)
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @User() user: IUser,
  ) {
    return this.storeService.createStore(createStoreDto, user);
  }

  /**
   * Retrieves a store by ID.
   *
   * @param storeId - The store ID, extracted from the request, representing the store to retrieve.
   * @returns A promise that resolves with the store object.
   */
  @Get()
  @Roles(
    UserRole.READ_ONLY,
    UserRole.READ_WRITE,
    UserRole.STORE_ADMIN,
    UserRole.SYSTEM_ADMIN,
  )
  async getStoreById(@User('storeId') storeId: string) {
    return this.storeService.getStoreById(storeId);
  }

  /**
   * Updates a store.
   *
   * @param updateStoreDto - The data transfer object containing the store details to update.
   * @param user - The user object extracted from the request, representing the current user.
   * @returns A promise that resolves with the updated store object.
   */
  @Patch()
  @Roles(UserRole.READ_WRITE, UserRole.STORE_ADMIN)
  async updateStore(
    @Body() updateStoreDto: UpdateStoreDto,
    @User() user: IUser,
  ) {
    return this.storeService.updateStore(updateStoreDto, user);
  }

  /**
   * Deactivates a store.
   *
   * @param storeId - The ID of the store to deactivate.
   * @returns A promise that resolves with the deactivated store object.
   * @throws UnauthorizedException if the current user is not a system admin.
   */
  @Delete(':storeId/deactivate')
  @Roles(UserRole.SYSTEM_ADMIN)
  async deactivateStore(@Param('storeId') storeId: string) {
    return this.storeService.deactivateStore(storeId);
  }
}
