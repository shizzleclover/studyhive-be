# Contributing to StudyHive API

First off, thank you for considering contributing to StudyHive! It's people like you that make StudyHive such a great tool for students.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the problem
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear title and description**
- **Use case** explaining why this enhancement would be useful
- **Possible implementation** approach (optional)

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit** with clear messages
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push** to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## Development Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/studyhive/api.git
   cd api
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Coding Standards

### JavaScript Style Guide

We follow a consistent code style. Use ESLint and Prettier:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format code
```

### Best Practices

1. **Naming Conventions**
   - Use camelCase for variables and functions
   - Use PascalCase for classes and models
   - Use UPPER_CASE for constants
   - Use descriptive names

2. **Code Structure**
   ```javascript
   // Good
   const getUserById = async (userId) => {
     const user = await User.findById(userId);
     return user;
   };

   // Bad
   const getU = async (id) => {
     return await User.findById(id);
   };
   ```

3. **Error Handling**
   ```javascript
   // Always use try-catch for async operations
   try {
     const result = await someAsyncOperation();
     return result;
   } catch (error) {
     throw new ApiError(500, 'Operation failed');
   }
   ```

4. **Comments**
   - Write self-documenting code
   - Add comments for complex logic
   - Use JSDoc for functions

### Module Structure

Each module should follow this structure:

```
module-name/
├── moduleName.model.js      # Mongoose schema
├── moduleName.service.js    # Business logic
├── moduleName.controller.js # Request handlers
├── moduleName.validator.js  # Joi schemas
├── moduleName.routes.js     # Express routes
└── index.js                 # Export router
```

### Writing Tests

1. **Test File Naming**
   - Unit tests: `tests/unit/<module>.test.js`
   - Integration tests: `tests/integration/<module>.test.js`

2. **Test Structure**
   ```javascript
   describe('Feature Name', () => {
     describe('Functionality', () => {
       it('should do something', async () => {
         // Arrange
         const input = setupTestData();
         
         // Act
         const result = await functionUnderTest(input);
         
         // Assert
         expect(result).toBeDefined();
       });
     });
   });
   ```

3. **Test Coverage**
   - Aim for >80% coverage
   - Test happy paths and error cases
   - Test edge cases

### API Documentation

When adding new endpoints:

1. **Add Swagger/JSDoc comments**
   ```javascript
   /**
    * @swagger
    * /api/endpoint:
    *   get:
    *     summary: Description
    *     tags: [Tag Name]
    *     parameters:
    *       - in: query
    *         name: param
    *         schema:
    *           type: string
    *     responses:
    *       200:
    *         description: Success
    */
   ```

2. **Update API_REFERENCE.md** if adding major features

3. **Update README.md** if needed

### Database

1. **Mongoose Models**
   - Use proper validation
   - Add indexes for frequently queried fields
   - Include timestamps
   - Add virtuals when needed

2. **Migrations**
   - Create migration scripts in `src/scripts/`
   - Document breaking changes

### Security

1. **Never commit sensitive data**
   - Use `.env` for secrets
   - Add sensitive files to `.gitignore`

2. **Validate all input**
   - Use Joi schemas
   - Sanitize user input

3. **Authentication**
   - Always verify JWT tokens
   - Check user permissions

## Commit Messages

Write clear, meaningful commit messages:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add email verification

Implement email verification using nodemailer.
Users must verify email before accessing protected resources.

Closes #123

fix(quiz): correct scoring calculation

The quiz scoring was incorrectly calculating percentages.
Changed formula from (correct/total)*10 to (correct/total)*100

Fixes #456
```

## Review Process

1. **Self-review** your changes before submitting
2. **Address feedback** promptly and professionally
3. **Keep discussions** focused and respectful
4. **Update your PR** based on review comments

## Getting Help

- **Documentation**: Check README.md and API_REFERENCE.md
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Email**: dev@studyhive.com for private inquiries

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for contributor badges

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to StudyHive! 🎓✨

