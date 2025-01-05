import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser } from '../../user/entities/user.entity';
import { UserRole } from '../../user/enums/roles';
import { UserRepository } from '../../user/repositories/user.repository';
import { CreateStoreDto, UpdateStoreDto } from '../dtos/store.dto';
import { Store } from '../entities/store.entity';
import { StoreRepository } from '../repositories/store.repository';

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Creates a new store, given the CreateUserDto and the user who's creating the store.
   * The user is updated with the storeId and the STORE_ADMIN role.
   * If the user already owns a store, a BadRequestException is thrown.
   * @param createStoreDto The data for creating a new store
   * @param user The user creating the store
   * @returns The newly created store
   */
  async createStore(
    createStoreDto: CreateStoreDto,
    user: IUser,
  ): Promise<Store> {
    if (user.storeId) {
      throw new BadRequestException('You already own a store');
    }

    const store = await this.storeRepository.create({
      ...createStoreDto,
      adminId: user?._id,
    });

    await this.userRepository.update(user._id.toString(), {
      roles: [...new Set([...user.roles, UserRole.STORE_ADMIN])],
      storeId: store._id,
    });

    return store;
  }

  /**
   * Gets a store by id.
   * @param storeId The id of the store to be retrieved
   * @returns The store with the given id
   */
  async getStoreById(storeId: string): Promise<Store> {
    return this.storeRepository.find(storeId);
  }

  /**
   * Updates a store, given the UpdateStoreDto and the user who's making the update.
   * The user must be the store's admin, otherwise a BadRequestException is thrown.
   * @param updateStoreDto The data for updating the store
   * @param user The user making the update
   * @returns The updated store
   */
  async updateStore(
    updateStoreDto: UpdateStoreDto,
    user: IUser,
  ): Promise<Store> {
    return await this.storeRepository.update(
      user.storeId.toString(),
      updateStoreDto,
    );
  }

  /**
   * Deactivates a store.
   * @param storeId The id of the store to be deactivated
   */
  async deactivateStore(storeId: string): Promise<void> {
    await this.storeRepository.deactivate(storeId);
  }
}
