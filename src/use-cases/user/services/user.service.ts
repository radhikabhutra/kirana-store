import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/roles';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  private readonly SALT_ROUNDS = 10;

  /**
   * Creates a new user associated with the admin's store.
   *
   * This function checks if the admin has a valid store ID and ensures
   * that a user with the given email does not already exist. If a user
   * with the same email is found, a ConflictException is thrown.
   *
   * @param admin - The admin user creating the new user.
   * @param payload - The data for the user to be created.
   * @throws UnauthorizedException if the admin does not have a store ID.
   * @throws ConflictException if a user with the same email already exists.
   * @returns The newly created user.
   */
  async createUser(admin: User, payload: CreateUserDto) {
    if (!admin.storeId?.toString()?.length) {
      throw new UnauthorizedException(
        'You are not authorized to create a user',
      );
    }

    const checkUserExists = await this.userRepository.findByEmail(
      payload.email,
    );

    if (checkUserExists) {
      throw new ConflictException('User already exists, please login');
    }

    const user = {
      ...payload,
      storeId: admin.storeId,
      password: await bcrypt.hash(payload.password, this.SALT_ROUNDS),
    };

    return this.userRepository.create(user);
  }

  /**
   * Gets a user by ID.
   *
   * This function checks if the admin user has access to the user's store
   * by comparing the admin's store ID with the user's store ID. If the
   * IDs do not match, an UnauthorizedException is thrown.
   *
   * @param admin - The admin user retrieving the user.
   * @param _id - The ID of the user to be retrieved.
   * @throws UnauthorizedException if the admin does not have access to the user's store.
   * @returns The user with the given ID.
   */
  async getUserById(admin: User, _id: string) {
    const user = await this.userRepository.findById(_id);

    if (user.storeId.toString() !== admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to view this user',
      );
    }
    return user;
  }

  /**
   * Retrieves a paginated list of users associated with the admin's store.
   *
   * This function checks if the admin has a valid store ID. If the admin
   * does not have a store ID, an UnauthorizedException is thrown.
   *
   * @param admin - The admin user retrieving the store users.
   * @param page - The page number for pagination.
   * @param limit - The number of users to return per page.
   * @throws UnauthorizedException if the admin does not have a store ID.
   * @returns A paginated list of users belonging to the admin's store.
   */
  async getStoreUsers(admin: User, page: number, limit: number) {
    if (!admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to view this store',
      );
    }
    return this.userRepository.getPaginatedCollection(
      { storeId: admin.storeId.toString() },
      limit,
      (page - 1) * limit,
      {
        _id: -1,
      },
    );
  }

  /**
   * Updates a user with the given ID and data.
   *
   * This function checks if the admin user has access to the user's store
   * by comparing the admin's store ID with the user's store ID. If the
   * IDs do not match, an UnauthorizedException is thrown.
   *
   * @param admin - The admin user updating the user.
   * @param id - The ID of the user to be updated.
   * @param payload - The data for updating the user.
   * @throws UnauthorizedException if the admin does not have access to the user's store.
   * @returns The updated user.
   */
  async updateUser(admin: User, id: string, payload: UpdateUserDto) {
    const user = await this.userRepository.findById(id);

    if (user.storeId.toString() !== admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    return this.userRepository.update(user._id.toString(), payload);
  }

  /**
   * Grants write access to a user.
   *
   * This function checks if the admin user has access to the user's store
   * by comparing the admin's store ID with the user's store ID. If the
   * IDs do not match, an UnauthorizedException is thrown.
   * @param admin - The admin user granting write access to the user.
   * @param _id - The ID of the user to grant write access to.
   * @throws UnauthorizedException if the admin does not have access to the user's store.
   * @returns The updated user with write access.
   */
  async grantUserWriteAccess(admin: User, _id: string) {
    const user = await this.userRepository.findById(_id);

    if (user.storeId.toString() !== admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    return this.userRepository.update(_id, {
      roles: [...new Set([...user.roles, UserRole.READ_WRITE])],
    });
  }

  /**
   * Deactivates a user.
   *
   * This function checks if the admin user has access to the user's store
   * by comparing the admin's store ID with the user's store ID. If the
   * IDs do not match, an UnauthorizedException is thrown.
   *
   * @param admin - The admin user deactivating the user.
   * @param _id - The ID of the user to be deactivated.
   * @throws UnauthorizedException if the admin does not have access to the user's store.
   * @returns A promise that resolves when the user is deactivated.
   */
  async deactivateUser(admin: User, _id: string) {
    const user = await this.userRepository.findById(_id);

    if (user.storeId.toString() !== admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    return this.userRepository.deactivate(_id);
  }

  /**
   * Removes a user's association with a store.
   *
   * This function checks if the admin user has access to the user's store
   * by comparing the admin's store ID with the user's store ID. If the
   * IDs do not match, an UnauthorizedException is thrown.
   *
   * @param admin - The admin user removing the user from the store.
   * @param _id - The ID of the user to be removed from the store.
   * @throws UnauthorizedException if the admin does not have access to the user's store.
   * @returns A promise that resolves when the user's store association is removed.
   */
  async removeUserFromStore(admin: User, _id: string) {
    const user = await this.userRepository.findById(_id);

    if (user.storeId.toString() !== admin.storeId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    await this.userRepository.update(_id, {
      storeId: null,
    });
  }
}
