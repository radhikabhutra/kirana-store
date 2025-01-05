import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Active } from 'src/common/decorators/active.decorator';
import { Roles } from 'src/common/decorators/roles.decorators';
import { User } from 'src/common/decorators/user.decorator';
import { ActiveGuard } from 'src/common/guards/active.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { IUser } from '../entities/user.entity';
import { UserRole } from '../enums/roles';
import { UserService } from '../services/user.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard, ActiveGuard)
@Roles(UserRole.STORE_ADMIN)
@Active(true)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user in the system.
   *
   * @param payload - The data transfer object containing user details.
   * @param user - The current user making the request.
   * @returns A promise that resolves to the created user entity.
   */
  @Post()
  async create(@Body() payload: CreateUserDto, @User() user: IUser) {
    return this.userService.createUser(user, payload);
  }

  /**
   * Retrieves a paginated list of users belonging to the same store as the
   * current user.
   *
   * @param user - The current user making the request.
   * @param page - The page number of the list to retrieve.
   * @param size - The number of items to return in the list.
   * @returns A promise that resolves to an array of user entities.
   */
  @Get()
  async getStoreUsers(
    @User() user: IUser,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.userService.getStoreUsers(user, page, size);
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param user - The current user making the request.
   * @param id - The ID of the user to retrieve.
   * @returns A promise that resolves to the user entity.
   * @throws {UnauthorizedException} if the user is not authorized to view the specified user.
   */
  @Get(':id')
  async getUser(@User() user: IUser, @Param('id') id: string) {
    return this.userService.getUserById(user, id);
  }

  /**
   * Grants READ_WRITE access to the user with the specified ID.
   *
   * @param user - The current user making the request.
   * @param id - The ID of the user to grant access to.
   * @returns A promise that resolves to the updated user entity.
   * @throws UnauthorizedException if the user is not authorized to update the specified user.
   */
  @Patch(':id/write-access')
  async updateWriteAcccess(@User() user: IUser, @Param('id') id: string) {
    return this.userService.grantUserWriteAccess(user, id);
  }

  /**
   * Updates a user with the specified ID.
   *
   * @param user - The current user making the request.
   * @param id - The ID of the user to update.
   * @param payload - The data transfer object containing user details to update.
   * @returns A promise that resolves to the updated user entity.
   * @throws UnauthorizedException if the user is not authorized to update the specified user.
   */
  @Patch(':id')
  async updateUser(
    @User() user: IUser,
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
  ) {
    return this.userService.updateUser(user, id, payload);
  }

  /**
   * Removes a user from their store.
   *
   * @param user - The current user making the request.
   * @param id - The ID of the user to remove.
   * @returns A promise that resolves to the updated user entity.
   * @throws UnauthorizedException if the user is not authorized to update the specified user.
   */
  @Delete(':id/remove-store')
  async removeUserFromStore(@User() user: IUser, @Param('id') id: string) {
    return this.userService.removeUserFromStore(user, id);
  }

  /**
   * Deactivates a user with the specified ID.
   *
   * @param user - The current user making the request.
   * @param id - The ID of the user to deactivate.
   * @returns A promise that resolves to the deactivated user entity.
   * @throws UnauthorizedException if the user is not authorized to deactivate the specified user.
   */
  @Delete(':id')
  async deactivateUser(@User() user: IUser, @Param('id') id: string) {
    return this.userService.deactivateUser(user, id);
  }
}
