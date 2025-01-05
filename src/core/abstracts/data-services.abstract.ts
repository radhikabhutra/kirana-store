import { User } from 'src/use-cases/user/entities/user.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IDataServices {
  abstract user: IGenericRepository<User>;
}
