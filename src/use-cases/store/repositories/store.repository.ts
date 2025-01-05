import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGenericRepository } from 'src/core/abstracts';
import { MongoGenericRepository } from 'src/core/repositories/mongo-generic.repository';
import { Store } from '../entities/store.entity';

@Injectable()
export class StoreRepository {
  data: IGenericRepository<Store>;

  constructor(@InjectModel(Store.name) storeModel: Model<Store>) {
    this.data = new MongoGenericRepository(storeModel);
  }

  /**
   * Creates a new store document.
   * @param user The data of the store to be created.
   * @returns A promise that resolves to the created store document.
   */
  async create(user: Partial<Store>): Promise<Store> {
    return this.data.create(user);
  }

  /**
   * Retrieves a store document by its ID.
   * @param _id The ID of the store document to be retrieved.
   * @returns A promise that resolves to the store document, or null if not found.
   */
  async find(_id: string): Promise<Store> {
    return this.data.findOne({ _id });
  }

  /**
   * Updates a store document.
   * @param _id The ID of the store document to be updated.
   * @param store The updated store data.
   * @returns A promise that resolves to the updated store document.
   */
  async update(_id: string, store: Partial<Store>): Promise<Store> {
    return this.data.findOneAndUpdate({ _id }, store);
  }

  /**
   * Deactivates a store document.
   * @param _id The ID of the store document to be deactivated.
   * @returns A promise that resolves to the deactivated store document.
   */
  async deactivate(_id: string): Promise<Store> {
    return this.data.update({ _id }, { active: false });
  }
}
