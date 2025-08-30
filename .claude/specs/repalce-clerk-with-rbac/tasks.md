# Implementation Plan

## Task Overview

This implementation plan breaks down the Clerk to NextAuth.js v5 + RBAC migration into atomic, agent-friendly tasks. The approach follows a progressive enhancement strategy, installing dependencies first, then building core services, followed by component migration, and finally cleanup. Each task is designed to be completed independently while maintaining a working codebase at every step.

**Database Foundation:** ✅ RBAC schema already implemented and seeded with production data.
**Migration Strategy:** Complete Clerk removal with no rollback mechanism for clean future development.

## Steering Document Compliance

Tasks follow structure.md file organization conventions with feature-based components in src/features/auth/, shared services in src/lib/services/, and API routes in src/app/api/. Implementation adheres to tech.md patterns using NextAuth.js v5, TypeScript strict mode, and existing Prisma ORM patterns.

## Atomic Task Requirements

**Each task meets these criteria for optimal agent execution:**

- **File Scope**: Touches 1-3 related files maximum  
- **Time Boxing**: Completable in 15-30 minutes
- **Single Purpose**: One testable outcome per task
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching

## Tasks

### Phase 1: Dependencies and Configuration

- [ ] 1. Install NextAuth.js v5 dependencies

  - Files: package.json
  - Remove @clerk/nextjs and @clerk/themes packages
  - Install next-auth@beta, @auth/prisma-adapter, and related dependencies
  - Update package.json scripts if needed
  - Purpose: Establish NextAuth.js foundation and remove Clerk dependencies
  - _Leverage: Existing package.json structure_
  - _Requirements: 5.3_

- [ ] 2. Create NextAuth configuration file

  - Files: src/lib/auth/auth.ts
  - Configure NextAuth.js v5 with Credentials provider
  - Set up Prisma adapter connection to existing database
  - Configure JWT and session callbacks with role/permission inclusion
  - Purpose: Core authentication configuration
  - _Leverage: src/lib/auth/password.ts, existing Prisma models_
  - _Requirements: 1.2, 1.5, 1.6_

- [ ] 3. Create NextAuth API route handlers

  - Files: src/app/api/auth/[...nextauth]/route.ts
  - Implement GET and POST handlers for NextAuth.js
  - Import auth configuration and export handlers
  - Purpose: Enable NextAuth.js API endpoints
  - _Leverage: src/lib/auth/auth.ts_
  - _Requirements: 1.1, 1.8_

### Phase 2: Authentication Services

- [ ] 4. Create shared service utilities

  - Files: src/lib/services/shared.utils.ts
  - Create utility functions for common error handling and audit logging
  - Add helper functions for validation and response formatting
  - Include database transaction helpers
  - Purpose: DRY compliance using composition over inheritance
  - _Leverage: existing error handling patterns, AuditLog model_
  - _Requirements: All (shared functionality)_

- [ ] 5. Create authentication service

  - Files: src/lib/services/auth.service.ts
  - Use shared utilities for error handling and audit logging
  - Implement validateCredentials function using existing password utilities
  - Add updateLastLogin and basic login attempt tracking
  - Purpose: Core authentication business logic
  - _Leverage: src/lib/services/base.service.ts, src/lib/auth/password.ts, existing User model_
  - _Requirements: 1.3, 1.4, 4.1, 4.2_

- [ ] 6. Create permission service

  - Files: src/lib/services/permission.service.ts
  - Use shared utilities for error handling and audit logging
  - Implement hasPermission, getUserPermissions, and hasRole functions
  - Include error handling for permission verification failures
  - Purpose: RBAC permission checking for small team (30 users max)
  - _Leverage: src/lib/services/base.service.ts, existing Role, Permission, UserRole models_
  - _Requirements: 2.2, 2.3, 2.7_

- [ ] 7. Create user management service

  - Files: src/lib/services/user.service.ts
  - Use shared utilities for error handling and audit logging
  - Implement createUser, updateUserRoles, deactivateUser, resetPassword functions
  - Add audit logging for admin actions using BaseService methods
  - Include data consistency checks and error handling
  - Purpose: Administrative user lifecycle management
  - _Leverage: src/lib/services/base.service.ts, existing User, UserRole models, src/lib/auth/password.ts_
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8. Create authentication type definitions

  - Files: src/types/auth.ts
  - Define LoginCredentials, CreateUserDTO, UserDTO interfaces
  - Add NextAuth session extension types
  - Include AuthEvent and permission-related types
  - Purpose: Type safety for authentication system
  - _Leverage: existing Prisma model types_
  - _Requirements: All_

### Phase 3: Login Components

- [ ] 9. Create login form validation schema

  - Files: src/lib/validations/auth.ts
  - Create Zod schemas for login credentials and password complexity
  - Add form validation rules matching requirements
  - Purpose: Input validation and type safety for forms
  - _Leverage: existing Zod patterns, src/lib/auth/password.ts validation_
  - _Requirements: 1.1, 1.3_

- [ ] 10. Create login form component

  - Files: src/features/auth/components/login-form.tsx
  - Build login form using React Hook Form + Zod validation
  - Implement NextAuth signIn integration with error handling
  - Add loading states and user feedback
  - Purpose: Secure login interface with validation
  - _Leverage: src/components/ui/form.tsx, src/components/ui/button.tsx, src/components/ui/input.tsx_
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10a. Create login form component tests

  - Files: src/features/auth/components/__tests__/login-form.test.tsx
  - Test form validation, submission, error handling
  - Mock NextAuth signIn function
  - Test user interaction scenarios
  - Purpose: Component testing for login functionality
  - _Leverage: existing test patterns, React Testing Library_
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 11. Update sign-in page to use new login form

  - Files: src/app/auth/sign-in/[[...sign-in]]/page.tsx
  - Replace ClerkSignInForm with new LoginForm component
  - Maintain existing page layout and styling
  - Remove Clerk-specific imports and references
  - Purpose: Integrate new login form into existing page structure
  - _Leverage: src/features/auth/components/login-form.tsx, existing page layout_
  - _Requirements: 1.1, 5.6_

### Phase 4: Session Management

- [ ] 12. Create authentication hooks

  - Files: src/hooks/use-auth.ts
  - Create useAuth hook wrapping NextAuth useSession
  - Add permission checking utilities (usePermission, useRole)
  - Include loading and error states
  - Purpose: Convenient authentication state management
  - _Leverage: NextAuth useSession, src/lib/services/permission.service.ts_
  - _Requirements: 2.2, 2.4_

- [ ] 12a. Create authentication hooks tests

  - Files: src/hooks/__tests__/use-auth.test.ts
  - Test hook functionality with React Testing Library
  - Mock NextAuth useSession
  - Test permission and role checking logic
  - Purpose: Hook testing for authentication state management
  - _Leverage: existing test patterns, React Hooks Testing Library_
  - _Requirements: 2.2, 2.4_

- [ ] 13. Create authentication middleware

  - Files: src/lib/auth/middleware.ts
  - Implement NextAuth middleware for route protection
  - Add permission checking for API routes
  - Include basic rate limiting and security logging
  - Purpose: Secure route protection and API authentication
  - _Leverage: src/lib/services/permission.service.ts, src/lib/services/auth.service.ts_
  - _Requirements: 1.6, 1.7, 2.3_

- [ ] 14. Update main middleware configuration

  - Files: src/middleware.ts
  - Replace clerkMiddleware with NextAuth middleware
  - Maintain existing route protection patterns
  - Add new authentication logic
  - Purpose: Route protection using NextAuth instead of Clerk
  - _Leverage: src/lib/auth/middleware.ts_
  - _Requirements: 1.6, 2.3_

### Phase 5: Provider and Navigation Updates

- [ ] 14. Update providers configuration

  - Files: src/components/layout/providers.tsx
  - Replace ClerkProvider with NextAuth SessionProvider
  - Maintain existing theme integration
  - Remove Clerk imports and configuration
  - Purpose: Session provider migration while preserving functionality
  - _Leverage: existing theme and provider structure_
  - _Requirements: 5.5_

- [ ] 15. Update user navigation component

  - Files: src/components/layout/user-nav.tsx
  - Replace Clerk useUser with NextAuth useSession
  - Update user data access patterns
  - Maintain existing dropdown menu structure and styling
  - Purpose: User navigation using NextAuth session data
  - _Leverage: src/hooks/use-auth.ts, existing UI components_
  - _Requirements: 5.5_

- [ ] 16. Update app sidebar component

  - Files: src/components/layout/app-sidebar.tsx
  - Replace Clerk hooks with NextAuth useSession
  - Update user data access patterns for sidebar
  - Remove Clerk imports
  - Purpose: Migrate app sidebar to NextAuth
  - _Leverage: src/hooks/use-auth.ts_
  - _Requirements: 5.3_

- [ ] 17. Update nav user component

  - Files: src/components/nav-user.tsx
  - Replace Clerk hooks with NextAuth equivalents
  - Update user data display
  - Remove SignOutButton references
  - Purpose: Migrate nav user component to NextAuth
  - _Leverage: src/hooks/use-auth.ts_
  - _Requirements: 5.3_

- [ ] 18. Add basic session invalidation on user deactivation

  - Files: src/lib/services/user.service.ts
  - Add simple session invalidation when user is deactivated
  - Include basic audit logging for deactivation event
  - Purpose: Basic session security for user lifecycle
  - _Leverage: existing User model, NextAuth session handling_
  - _Requirements: 2.6_

- [ ] 19. Add basic login attempt tracking

  - Files: src/lib/services/auth.service.ts
  - Add simple failed login attempt counting in user record
  - Basic lockout after 5 attempts (simple boolean flag)
  - Purpose: Basic brute force protection
  - _Leverage: existing User model_
  - _Requirements: 1.4_

### Phase 6: User Management Interface

- [ ] 21. Create user management page

  - Files: src/app/dashboard/users/page.tsx
  - Build user list interface using TanStack Table
  - Add search, filtering, and sorting functionality
  - Include role display and status indicators
  - Purpose: Administrative user management interface
  - _Leverage: existing table components, src/lib/services/user.service.ts_
  - _Requirements: 3.1_

- [ ] 22. Create user management dialogs

  - Files: src/features/auth/components/user-management-dialogs.tsx
  - Create user creation dialog with role assignment
  - Add password reset and user deactivation dialogs
  - Include form validation and error handling
  - Purpose: User management actions in modal interface
  - _Leverage: src/components/ui/dialog.tsx, src/components/ui/form.tsx_
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 23. Create user details page

  - Files: src/app/dashboard/users/[userId]/page.tsx
  - Build user profile editing interface
  - Add role assignment/removal functionality
  - Include audit trail display for user actions
  - Purpose: Detailed user management and role administration
  - _Leverage: src/lib/services/user.service.ts, existing form components_
  - _Requirements: 3.3, 4.4_

### Phase 7: API Routes and Security

- [ ] 24. Create user list API route

  - Files: src/app/api/users/route.ts
  - Implement GET endpoint for user listing with pagination
  - Add permission checking middleware for admin access
  - Use JSend response format consistently
  - Purpose: Backend API for user list retrieval
  - _Leverage: src/lib/services/user.service.ts, src/lib/auth/middleware.ts_
  - _Requirements: 3.1_

- [ ] 25. Create individual user API routes

  - Files: src/app/api/users/[userId]/route.ts
  - Implement GET, PUT, DELETE for individual user operations
  - Add role assignment endpoint functionality
  - Include comprehensive error handling and validation
  - Purpose: Backend API for individual user management
  - _Leverage: src/lib/services/user.service.ts, src/lib/auth/middleware.ts_
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 26. Create audit log API routes

  - Files: src/app/api/audit/route.ts
  - Implement audit log querying and filtering
  - Add permission checks for audit access
  - Include pagination and search functionality
  - Purpose: Audit log access for security monitoring
  - _Leverage: existing AuditLog model, src/lib/services/permission.service.ts_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_


### Phase 8: Testing and Validation

- [ ] 27. Create authentication service tests

  - Files: src/lib/services/__tests__/auth.service.test.ts
  - Test credential validation, rate limiting, audit logging
  - Mock database calls and external dependencies
  - Purpose: Unit testing for authentication business logic
  - _Leverage: existing test patterns if available_
  - _Requirements: 1.3, 1.4, 4.1, 4.2_

- [ ] 28. Create permission service tests

  - Files: src/lib/services/__tests__/permission.service.test.ts
  - Test role and permission checking logic
  - Include error handling scenarios
  - Purpose: Unit testing for RBAC functionality
  - _Leverage: existing test patterns if available_
  - _Requirements: 2.2, 2.3, 2.7_

- [ ] 29. Create login form component tests

  - Files: src/features/auth/components/__tests__/login-form.test.tsx
  - Test form validation, submission, error handling
  - Mock NextAuth signIn function
  - Purpose: Component testing for login functionality
  - _Leverage: existing test patterns if available_
  - _Requirements: 1.1, 1.2, 1.3_

### Phase 9: Migration and Cleanup

- [ ] 30. Remove Clerk from profile component

  - Files: src/features/profile/components/profile-view-page.tsx
  - Search for and remove any Clerk references in profile components
  - Replace with NextAuth equivalents if needed
  - Remove Clerk imports and dependencies
  - Purpose: Clean up profile-related Clerk references
  - _Leverage: src/hooks/use-auth.ts_
  - _Requirements: 5.3_

- [ ] 31. Remove Clerk from dashboard components

  - Files: src/app/dashboard/page.tsx, src/app/page.tsx  
  - Search for and remove any Clerk references in dashboard
  - Update authentication checks to use NextAuth
  - Remove Clerk imports
  - Purpose: Clean up dashboard Clerk references
  - _Leverage: src/hooks/use-auth.ts_
  - _Requirements: 5.3_

- [ ] 32. Update environment configuration

  - Files: env.example
  - Remove Clerk environment variables (NEXT_PUBLIC_CLERK_*)
  - Add NextAuth configuration variables (NEXTAUTH_SECRET, NEXTAUTH_URL)
  - Update variable documentation and examples
  - Purpose: Environment configuration for NextAuth
  - _Leverage: existing environment setup patterns_
  - _Requirements: 5.3_

- [ ] 33. Run basic integration tests

  - Files: Create test script in scripts/test-auth-flow.ts
  - Test core authentication flow (login/logout)
  - Basic permission checking validation
  - Purpose: Validate core authentication functionality
  - _Leverage: All implemented components and services_
  - _Requirements: 1.2, 2.2_

- [ ] 34. Run type checking and final cleanup

  - Files: Run commands: npm run typecheck && npm run lint:fix
  - Execute TypeScript compilation check
  - Run ESLint with automatic fixes
  - Verify no compilation or linting errors
  - Purpose: Code quality validation and cleanup
  - _Leverage: Existing npm scripts and configuration_
  - _Requirements: All_