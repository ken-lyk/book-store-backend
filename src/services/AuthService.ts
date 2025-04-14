import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken, JwtPayload } from '../utils/jwtUtils';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../validators/authValidators'; // Assuming you have these types exported
import { Repository } from 'typeorm';

// Define a type for the user data returned (excluding password)
export type SafeUser = Omit<User, 'password'>;

export class AuthService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async registerUser(userData: RegisterInput): Promise<SafeUser> {
        const { email, password, name } = userData;

        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new AppError('Email already in use', 409); // 409 Conflict
        }

        const hashedPassword = await hashPassword(password);

        const newUser = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.USER, // Default role for registration
        });

        await this.userRepository.save(newUser);

         
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async loginUser(
        credentials: LoginInput
    ): Promise<{ user: SafeUser; token: string }> {
        const { email, password } = credentials;

        // Find user and explicitly select password for comparison
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password') // Make sure password is selected
            .getOne();


        if (!user) {
            throw new AppError('Invalid email or password', 401); // Use generic error for security
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const tokenPayload: JwtPayload = { id: user.id, role: user.role };
        const token = generateToken(tokenPayload);

         
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    async findUserById(id: string): Promise<SafeUser | null> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            return null;
        }
         
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

// Export an instance or use dependency injection framework
export const authService = new AuthService();