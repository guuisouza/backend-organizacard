import { User } from '../../../entities/user.entity';

// user without password
export type SafeUser = Omit<User, 'password'>;
