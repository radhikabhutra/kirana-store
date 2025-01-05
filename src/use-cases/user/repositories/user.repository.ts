import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGenericRepository } from 'src/core/abstracts';
import { MongoGenericRepository } from 'src/core/repositories/mongo-generic.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  data: IGenericRepository<User>;

  constructor(@InjectModel(User.name) userModel: Model<User>) {
    this.data = new MongoGenericRepository(userModel);
  }

  /**
   * Creates a new user document.
   *
   * @param user - The partial user data to create.
   * @returns A promise that resolves to the created user document.
   */

  async create(user: Partial<User>): Promise<User> {
    return this.data.create(user);
  }

  /**
   * Updates a user document by its ID.
   *
   * @param _id - The ID of the user document to be updated.
   * @param user - The partial user data to update.
   * @returns A promise that resolves to the updated user document.
   */
  async update(_id: string, user: Partial<User>): Promise<User> {
    return this.data.findOneAndUpdate({ _id }, user);
  }

  /**
   * Updates a user document.
   *
   * @param _id - The ID of the user document to be updated.
   * @param user - The partial user data to update.
   * @returns A promise that resolves to the updated user document.
   */
  async deactivate(_id: string) {
    return this.data.update({ _id }, { active: false });
  }

  /**
   * Finds a single user document by its ID.
   *
   * @param _id - The ID of the user document to find.
   * @returns A promise that resolves to the found user document.
   */
  async findById(_id: string): Promise<User> {
    return this.data.findOne({ _id });
  }

  /**
   * Finds a single user document by its email.
   * @param email - The email to search for.
   * @returns A promise that resolves to the found user document, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.data.findOne({ email });
  }

  /**
   * Retrieves a paginated collection of user documents.
   *
   * @param query - The filter query to use for finding the documents.
   * @param limit - The number of documents to return.
   * @param skip - The number of documents to skip.
   * @param sortFilter - The sort criteria.
   * @returns A promise that resolves to an array of user documents.
   */
  async getPaginatedCollection(
    query: any,
    limit: number,
    skip: number,
    sortFilter: any,
  ) {
    return this.data.getPaginatedCollection(query, limit, skip, sortFilter);
  }
}
