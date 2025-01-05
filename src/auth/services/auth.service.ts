import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { getCurrentTime } from 'src/common/utils/date';
import { User } from 'src/use-cases/user/entities/user.entity';
import { UserRepository } from 'src/use-cases/user/repositories/user.repository';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  private readonly SALT_ROUNDS = 10;

  /**
   * Register a new user with the given data.
   * @param payload - The data of the user to register.
   * @returns The newly created user.
   * @throws ConflictException if a user with the same email already exists.
   */
  async register(payload: RegisterDto): Promise<User> {
    const checkUserExists = await this.userRepository.findByEmail(
      payload.email,
    );

    if (checkUserExists) {
      throw new ConflictException('User already exists, please login');
    }

    const user = {
      ...payload,
      password: await bcrypt.hash(payload.password, this.SALT_ROUNDS),
    };

    return this.userRepository.create(user);
  }

  /**
   * Log in a user with the given email and password.
   * @param payload - The email and password of the user to log in.
   * @returns An object containing the access token.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  async login(payload: LoginDto) {
    const user = await this.userRepository.findByEmail(payload.email);

    const isPasswordValid = await this.checkPasswordValidity(
      payload.password,
      user.password,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtSignPayload = {
      sub: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      storeId: user.storeId,
      active: user.active,
    };

    await this.userRepository.update(user._id.toString(), {
      lastLoggedInAt: getCurrentTime(),
    });

    return {
      accessToken: this.jwtService.sign(jwtSignPayload),
    };
  }

  /**
   * Log out the user.
   * @returns An object containing a success message.
   */
  async logout() {
    return { message: 'User logged out successfully' };
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate and send reset password token (email implementation required)
    const resetToken = this.jwtService.sign({ sub: user._id });
    // Example: Send resetToken via email
    return { resetToken };
  }

  /**
   * Reset the user's password.
   * @param payload - The data to reset the user's password.
   * @returns An object containing a success message.
   * @throws NotFoundException if no user is found with the given email.
   * @throws BadRequestException if the new password is the same as the current one,
   * or if the email or current password is invalid.
   */
  async resetPassword(payload: ResetPasswordDto) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (payload.currentPassword === payload.newPassword) {
      throw new BadRequestException(
        'New password should not be the same as existing',
      );
    }

    const isPasswordValid = await this.checkPasswordValidity(
      payload.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password or email.');
    }

    const password = await bcrypt.hash(payload.newPassword, this.SALT_ROUNDS);

    await this.userRepository.update(user._id.toString(), {
      password,
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Compares a given password with the saved password.
   * @param payloadPassword - The given password to compare.
   * @param savedPassword - The saved password to compare with.
   * @returns A boolean indicating if the passwords match.
   */
  private async checkPasswordValidity(
    payloadPassword: string,
    savedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(payloadPassword, savedPassword);
  }
}
