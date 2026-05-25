export interface UserEntity {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUserEntity = Omit<UserEntity, 'password'>;
