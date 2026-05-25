import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1d'),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  it('should return access token when credentials are valid', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'admin@orders.local',
      password: 'hashed-password',
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await authService.login({
      email: 'admin@orders.local',
      password: 'Admin@123456',
    });

    expect(result).toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: '1d',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@orders.local',
        password: 'Admin@123456',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'admin@orders.local',
      password: 'hashed-password',
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'admin@orders.local',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
