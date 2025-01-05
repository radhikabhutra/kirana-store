import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { IGenericRepository } from '../abstracts';
import { PartialUntyped } from '../types';

/**
 * A generic MongoDB repository for managing documents of type T.
 */
export class MongoGenericRepository<T> implements IGenericRepository<T> {
  private _repository: Model<T>;

  /**
   * Creates an instance of MongoGenericRepository.
   * @param repository - The Mongoose model representing the collection.
   */
  constructor(repository: Model<T>) {
    this._repository = repository;
  }

  /**
   * Retrieves a single document by its ID.
   * @param id - The ID of the document to retrieve.
   * @returns A promise that resolves to the document, or null if not found.
   */
  get(id: Types.ObjectId | string): Promise<T | null> {
    return this._repository.findById(id).lean<T>().exec();
  }

  /**
   * Finds a single document by a query.
   * @param query - The query object to use for finding the document.
   * @returns A promise that resolves to the found document, or null if not found.
   */
  findBy(query: PartialUntyped<T>): Promise<T | null> {
    return this._repository.findOne(query).lean<T>().exec();
  }

  /**
   * Finds all documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @returns A promise that resolves to an array of found documents.
   */
  findAllBy(query: PartialUntyped<T>): Promise<T[]> {
    for (const key in query) {
      if (Array.isArray(query[key])) {
        query[key] = { $in: query[key] };
      }
    }

    return this._repository.find(query).lean<T[]>().exec();
  }

  /**
   * Finds all documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @returns A promise that resolves to an array of found documents.
   */
  findAll(query: any): Promise<T[]> {
    return this._repository.find(query).lean<T[]>().exec();
  }

  /**
   * Creates a new document in the collection.
   * @param item - The document to create.
   * @returns A promise that resolves to the created document.
   */
  create(item: T): Promise<T> {
    return this._repository.create(item);
  }

  /**
   * Updates a document by its ID.
   * @param id - The ID of the document to update.
   * @param item - The updated document data.
   * @returns A promise that resolves to the updated document, or null if not found.
   */
  update(id: Types.ObjectId | string, item: UpdateQuery<T>): Promise<T | null> {
    return this._repository
      .findByIdAndUpdate(id, item, { new: true })
      .lean<T>()
      .exec();
  }

  /**
   * Finds a single document by a query and updates it.
   * @param query - The query object to use for finding the document.
   * @param item - The updated document data.
   * @returns A promise that resolves to the updated document, or null if not found.
   */
  findOneAndUpdate(
    query: FilterQuery<T>,
    item: UpdateQuery<T>,
  ): Promise<T | null> {
    return this._repository
      .findOneAndUpdate(query, item, { new: true })
      .lean<T>()
      .exec();
  }

  /**
   * Updates multiple documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @param item - The updated document data.
   * @returns A promise that resolves to the result of the update operation.
   */
  updateMany(query: FilterQuery<T>, item: UpdateQuery<T>): Promise<T[]> {
    return this._repository
      .updateMany(query, item, { new: true })
      .lean<T[]>()
      .exec();
  }

  /**
   * Retrieves a paginated collection of documents.
   * @param filter - The filter query to use for finding the documents.
   * @param limit - The number of documents to return.
   * @param skip - The number of documents to skip.
   * @param sortFilter - The sort criteria.
   * @returns A promise that resolves to an array of documents.
   */
  getPaginatedCollection(
    filter: FilterQuery<T>,
    limit: number,
    skip: number,
    sortFilter: Record<string, any>,
  ): Promise<T[]> {
    return this._repository
      .find(filter, null, { skip, limit })
      .sort(sortFilter)
      .lean<T[]>()
      .exec();
  }

  /**
   * Retrieves the count of documents matching a filter.
   * @param filter - The filter query to use for counting the documents.
   * @returns A promise that resolves to the count of documents.
   */
  getCollectionCount(filter: FilterQuery<T>): Promise<number> {
    return this._repository.countDocuments(filter).lean().exec();
  }

  /**
   * Checks if any document exists matching a filter.
   * @param filter - The filter query to use for checking the documents.
   * @returns A promise that resolves to true if a document exists, false otherwise.
   */
  async exist(filter: FilterQuery<T>): Promise<boolean> {
    const exists = await this._repository.exists(filter).lean().exec();
    return exists?._id != null;
  }

  /**
   * Retrieves multiple documents by their IDs.
   * @param ids - The array of IDs of the documents to retrieve.
   * @returns A promise that resolves to an array of found documents.
   */
  getbyIds(ids: string[]): Promise<T[]> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return this._repository
      .find({ _id: { $in: objectIds } })
      .lean<T[]>()
      .exec();
  }

  /**
   * Deletes a single document by a filter.
   * @param where - The filter query to use for finding the document to delete.
   * @returns A promise that resolves to the result of the delete operation.
   */
  async deleteOne(
    where: PartialUntyped<T>,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this._repository.deleteOne(where).lean().exec();
  }

  /**
   * To insert items in bulk
   * @param items
   * @returns
   */
  async insertMany(items: Partial<T[]>) {
    return this._repository.create(items);
  }

  /**
   * Deletes all entries for input where condition
   * @param where
   */
  async deleteAllBy(where: PartialUntyped<T>): Promise<number> {
    const { deletedCount } = await this._repository
      .deleteMany(where)
      .lean()
      .exec();
    return deletedCount;
  }

  /**
   * Performs bulk write operations on the collection.
   * @param operations - An array of bulk write operations.
   * @returns A promise that resolves to the result of the bulk write operation.
   */
  bulkWrite(operations: any[]): Promise<any> {
    return this._repository.bulkWrite(operations);
  }

  /**
   * Performs bulk delete operations on the collection.
   * @param query
   * @returns
   */
  deleteMany(query: PartialUntyped<T>): Promise<{ deletedCount?: number }> {
    return this._repository.deleteMany(query).exec();
  }

  /**
   * Finds a single document that matches the query criteria.
   * @param query - The query object to use for finding the document.
   * @returns A promise that resolves to the found document, or null if no document matches.
   */
  findOne(query: FilterQuery<T>): Promise<T | null> {
    return this._repository.findOne(query).exec();
  }

  /**
   * Performs aggregation operations on the collection.
   * @param operations - An array of aggregation operations.
   * @returns A promise that resolves to the result of the aggregation operation.
   */
  aggregate(operations: any[]): Promise<any> {
    return this._repository.aggregate(operations);
  }
}
