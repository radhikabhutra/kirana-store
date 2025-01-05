import { UpdateQuery } from 'mongoose';
import { PartialUntyped } from '../types';

/**
 * An abstract class that defines the generic repository interface.
 */
export abstract class IGenericRepository<T> {
  /**
   * Retrieves a single document by its ID.
   * @param id - The ID of the document to retrieve.
   * @returns A promise that resolves to the document.
   */
  abstract get(id: string): Promise<T>;

  /**
   * Finds a single document by a query.
   * @param query - The query object to use for finding the document.
   * @returns A promise that resolves to the found document.
   */
  abstract findBy(query: PartialUntyped<T>): Promise<T>;

  /**
   * Finds all documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @returns A promise that resolves to an array of found documents.
   */
  abstract findAllBy(query: PartialUntyped<T>): Promise<T[]>;

  /**
   * Finds all documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @returns A promise that resolves to an array of found documents.
   */
  abstract findAll(query: any): Promise<T[]>;

  /**
   * Finds a single document that matches the query criteria.
   * @param query - The query object to use for finding the document, allowing MongoDB-style operators.
   * @returns A promise that resolves to the found document or null if no document matches.
   */
  abstract findOne(query: Record<string, any>): Promise<T | null>;

  /**
   * Creates a new document in the collection.
   * @param item - The document to create.
   * @returns A promise that resolves to the created document.
   */
  abstract create(item: Partial<T>): Promise<T>;

  /**
   * Updates a document by its ID.
   * @param id - The ID of the document to update.
   * @param item - The updated document data.
   * @returns A promise that resolves to the updated document.
   */
  abstract update(id: any, item: UpdateQuery<T>): Promise<T>;

  /**
   * Finds a single document by a query and updates it.
   * @param query - The query object to use for finding the document.
   * @param item - The updated document data.
   * @returns A promise that resolves to the updated document.
   */
  abstract findOneAndUpdate(query: any, item: any): Promise<T>;

  /**
   * Updates multiple documents matching a query.
   * @param query - The query object to use for finding the documents.
   * @param item - The updated document data.
   * @returns A promise that resolves to the result of the update operation.
   */
  abstract updateMany(query: any, item: any): Promise<T[]>;

  /**
   * Retrieves a paginated collection of documents.
   * @param filter - The filter query to use for finding the documents.
   * @param limit - The number of documents to return.
   * @param skip - The number of documents to skip.
   * @param sortFilter - The sort criteria.
   * @returns A promise that resolves to an array of documents.
   */
  abstract getPaginatedCollection(
    filter: any,
    limit?: number,
    skip?: number,
    sortFilter?: any,
  ): Promise<T[]>;

  /**
   * Retrieves the count of documents matching a filter.
   * @param filter - The filter query to use for counting the documents.
   * @returns A promise that resolves to the count of documents.
   */
  abstract getCollectionCount(filter: any): Promise<number>;

  /**
   * Checks if any document exists matching a filter.
   * @param filter - The filter query to use for checking the documents.
   * @returns A promise that resolves to true if a document exists, false otherwise.
   */
  abstract exist(filter: any): Promise<boolean>;

  /**
   * Retrieves multiple documents by their IDs.
   * @param id - The array of IDs of the documents to retrieve.
   * @returns A promise that resolves to an array of found documents.
   */
  abstract getbyIds(id: string[]): Promise<T[]>;

  /**
   * Deletes a single document based on a query.
   * @param query - The query object used to match the document to be deleted.
   * @returns A promise that resolves to the result of the deletion operation.
   */
  abstract deleteOne(query: any): Promise<any>;

  /**
   * Retrieves multiple documents by their IDs.
   * @param id - The array of IDs of the documents to retrieve.
   * @returns A promise that resolves to an array of found documents.
   */
  abstract bulkWrite(operation: any[]): Promise<T[]>;

  /**
   * To insert items at bulk
   * @param items
   */
  abstract insertMany(items: Partial<T[]>);

  /**
   * Deletes all entries for input where condition
   * @param where
   */
  abstract deleteAllBy(where: PartialUntyped<T>): Promise<number>;

  /* Deletes multiple documents based on a query.
   *
   * @param query - The query object used to match the documents to be deleted. The structure of the query depends on the underlying database or storage system.
   * @returns A promise that resolves to an object containing the count of deleted documents. The `deletedCount` property will be undefined if the deletion operation does not provide this information.
   */
  abstract deleteMany(
    query: PartialUntyped<T>,
  ): Promise<{ deletedCount?: number }>;

  /**
   * Aggregates documents based on the provided operations.
   * @param operations
   */
  abstract aggregate(operations: any[]): Promise<any>;
}
