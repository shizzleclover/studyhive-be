const User = require('../../src/modules/user/user.model');
const userService = require('../../src/modules/user/user.service');

describe('User Service', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'student',
      isVerified: true,
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const user = await userService.getUserById(testUser._id);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should throw error for invalid user ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011';
      await expect(userService.getUserById(invalidId)).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'New bio',
      };

      const updatedUser = await userService.updateUserProfile(testUser._id, updateData);

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.bio).toBe('New bio');
    });

    it('should not allow updating email', async () => {
      const updateData = {
        email: 'newemail@example.com',
      };

      const updatedUser = await userService.updateUserProfile(testUser._id, updateData);

      expect(updatedUser.email).toBe('test@example.com'); // Email should not change
    });
  });

  describe('reputation system', () => {
    it('should update user reputation', async () => {
      await userService.updateUserReputation(testUser._id, 10);

      const user = await User.findById(testUser._id);
      expect(user.reputationScore).toBe(10);
    });

    it('should not allow negative reputation', async () => {
      await expect(
        userService.updateUserReputation(testUser._id, -5)
      ).rejects.toThrow();
    });
  });

  describe('role management', () => {
    it('should update user role', async () => {
      const updatedUser = await userService.updateUserRole(testUser._id, 'rep', testUser._id);

      expect(updatedUser.role).toBe('rep');
    });

    it('should throw error for invalid role', async () => {
      await expect(
        userService.updateUserRole(testUser._id, 'invalid', testUser._id)
      ).rejects.toThrow();
    });
  });
});

