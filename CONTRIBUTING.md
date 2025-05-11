# Contributing to Chillar Club

Thank you for your interest in contributing to Chillar Club! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We welcome contributions from everyone who wishes to improve Chillar Club.

## How to Contribute

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/chillar-club.git
   cd chillar-club
   ```
3. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Set up the development environment:
   ```bash
   ./setup.sh
   ```
5. Make your changes

### Code Style Guidelines

- Follow existing code style and patterns
- Use meaningful variable and function names
- Write comments for complex logic
- Include JSDoc comments for functions

### Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers in commit messages when applicable
- Keep commits focused on a single logical change

Example commit message:
```
Add user profile update functionality

- Implement form for updating user profile data
- Add validation for form fields
- Connect to API endpoint for saving changes

Fixes #42
```

### Pull Request Process

1. Update the README.md or documentation with details of changes, if applicable
2. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Submit a pull request to the original repository
4. Address any feedback or requested changes

## Development Workflow

### Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and schemas
- `/scripts` - Utility scripts for database operations

### Adding New Features

1. Create a new branch for your feature
2. Implement the feature with tests
3. Update documentation as needed
4. Submit a pull request

### Testing

- Run tests before submitting a pull request:
  ```bash
  npm test
  ```
- Add new tests for your feature or fix

### Database Changes

- Add model changes to `shared/schema.ts`
- Always use the ORM (Drizzle) for database operations
- Run migrations using `npm run db:push`

## Getting Help

If you need help with contributing to the project:

1. Check the documentation in the repository
2. Open an issue with your question or problem
3. Reach out to the maintainers

Thank you for contributing to Chillar Club!