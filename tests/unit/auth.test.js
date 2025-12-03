const User = require('../../src/modules/user/user.model');
const authService = require('../../src/modules/auth/auth.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Auth Service', () => {
  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const user = await authService.signup(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.name).toBe(userData.name);
      expect(user.password).toBeUndefined(); // Password should not be in response
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await authService.signup(userData);

      await expect(authService.signup(userData)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await authService.signup(userData);
      const user = await User.findOne({ email: userData.email });

      expect(user.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
      
      // Verify user
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { isVerified: true }
      );
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'Password123!');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login('invalid@example.com', 'Password123!')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.login('test@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for unverified user', async () => {
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { isVerified: false }
      );

      await expect(
        authService.login('test@example.com', 'Password123!')
      ).rejects.toThrow('Please verify your email');
    });

    it('should generate valid JWT tokens', async () => {
      const result = await authService.login('test@example.com', 'Password123!');
      
      const decodedAccess = jwt.verify(result.accessToken, process.env.JWT_SECRET);
      const decodedRefresh = jwt.verify(result.refreshToken, process.env.JWT_REFRESH_SECRET);

      expect(decodedAccess).toHaveProperty('userId');
      expect(decodedRefresh).toHaveProperty('userId');
    });
  });
});

