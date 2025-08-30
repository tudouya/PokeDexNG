# Structure Steering Document

## Project Organization

### Directory Structure
```
project_root/
├── .claude/                   # Claude-specific configuration and steering
│   └── steering/              # Steering documents for spec development
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Prisma database models
│   └── migrations/            # Database migration history
├── src/                       # Application source code
│   ├── app/                   # Next.js 15 App Router
│   │   ├── api/               # API routes (backend controllers)
│   │   ├── (auth)/            # Authentication pages route group
│   │   ├── (dashboard)/       # Main application pages route group
│   │   └── globals.css        # Global styles
│   ├── features/              # Feature modules (business domains)
│   ├── components/            # Shared UI components (cross-feature reuse)
│   ├── lib/                   # Core shared libraries
│   │   ├── auth/              # Authentication configuration and utilities
│   │   ├── db/                # Database connection (Prisma Client)
│   │   ├── validations/       # Shared Zod validation schemas
│   │   ├── services/          # Shared business services
│   │   └── utils/             # General utility functions
│   ├── hooks/                 # Shared custom React hooks
│   ├── constants/             # Global application constants
│   ├── config/                # Application configuration
│   └── types/                 # Global TypeScript type definitions
└── docs/                      # Project documentation
    ├── decisions/             # Architecture Decision Records (ADRs)
    ├── templates/             # Code templates and patterns
    ├── ideas.md               # Feature ideas and experiments
    └── tech-debt.md           # Known issues and improvements
```

### Feature Module Structure
```
features/
└── [feature-name]/            # Example: vulnerability-management
    ├── __tests__/             # Feature-specific tests
    │   ├── services/          # Business logic unit tests
    │   └── components/        # Component tests
    ├── services/              # Feature-specific backend business logic
    ├── components/            # Feature-specific frontend components
    ├── hooks/                 # Feature-specific React hooks
    ├── validations/           # Feature-specific Zod schemas
    ├── types/                 # Feature-specific TypeScript types/DTOs
    └── index.ts               # Module unified exports
```

## Naming Conventions

### Files and Directories
- **File Names**: `kebab-case` (e.g., `vulnerability-form.tsx`, `user-profile.tsx`)
- **Directory Names**: `kebab-case` (e.g., `vulnerability-management/`, `user-settings/`)
- **Component Files**: `.tsx` extension for React components
- **Utility Files**: `.ts` extension for non-React code
- **Test Files**: `.test.ts` or `.test.tsx` extension

### Code Exports and Naming
- **React Components**: Named export + PascalCase
  ```typescript
  export function VulnerabilityForm() { ... }
  export function UserProfile() { ... }
  ```
- **Utility Functions**: Named export + camelCase
  ```typescript
  export function formatDate() { ... }
  export function validateEmail() { ... }
  ```
- **Custom Hooks**: Named export + camelCase with "use" prefix
  ```typescript
  export function useDebounce() { ... }
  export function useVulnerabilities() { ... }
  ```
- **Constants**: Named export + UPPER_SNAKE_CASE
  ```typescript
  export const MAX_FILE_SIZE = 10 * 1024 * 1024;
  export const API_ENDPOINTS = { ... };
  ```
- **Page Components**: Default export (Next.js requirement)
  ```typescript
  export default function HomePage() { ... }
  export default function VulnerabilityPage() { ... }
  ```

### Database and Data Layer
- **Prisma Models**: PascalCase (e.g., `User`, `Vulnerability`, `Project`)
- **Database Tables**: snake_case (e.g., `users`, `vulnerabilities`, `project_members`)
- **TypeScript Types/Interfaces**: PascalCase (e.g., `UserDTO`, `CreateVulnRequest`)
- **API Endpoints**: kebab-case (e.g., `/api/vulnerabilities`, `/api/user-profile`)

## Module Organization Principles

### Shared vs. Feature-Specific
1. **Shared First**: Place reusable logic in top-level directories
   - `lib/` for utilities, services, and configurations
   - `components/` for UI components used across features
   - `hooks/` for React hooks used in multiple places

2. **Feature-Specific Second**: Use `features/` only for tightly coupled code
   - Business logic specific to one domain
   - Components that won't be reused elsewhere
   - Feature-specific types and validations

3. **Test Co-location**: Keep tests close to the code they test
   - Feature tests in `features/[feature]/__tests__/`
   - Shared component tests in `components/__tests__/`

### Import and Export Strategy
- **Absolute Imports**: Always use `@/` prefix, never relative imports
  ```typescript
  // ✅ Correct
  import { VulnerabilityForm } from '@/features/vulnerability-management/components';
  import { formatDate } from '@/lib/utils';
  
  // ❌ Incorrect
  import { VulnerabilityForm } from '../../../features/vulnerability-management/components';
  ```

- **Index File Exports**: Each feature module must have unified exports
  ```typescript
  // features/vulnerability-management/index.ts
  export { VulnerabilityForm, VulnerabilityList } from './components';
  export { useVulnerabilities } from './hooks';
  export { vulnerabilityService } from './services';
  ```

## Next.js 15 App Router Conventions

### Route Organization
- **Route Groups**: `(name)/` for organization without URL impact
  ```
  app/
  ├── (auth)/
  │   ├── sign-in/
  │   └── sign-up/
  └── (dashboard)/
      ├── projects/
      └── vulnerabilities/
  ```

- **Dynamic Routes**: `[param]/` for URL parameters
  ```
  app/
  └── projects/
      └── [projectId]/
          ├── page.tsx
          └── vulnerabilities/
              └── [vulnId]/
                  └── page.tsx
  ```

- **Parallel Routes**: `@name/` for simultaneous rendering
  ```
  app/
  └── dashboard/
      ├── @analytics/
      ├── @projects/
      └── layout.tsx
  ```

### File Conventions
- **page.tsx**: Route page components (default export)
- **layout.tsx**: Nested layouts for route groups
- **loading.tsx**: Loading UI for Suspense boundaries
- **error.tsx**: Error boundaries for route segments
- **not-found.tsx**: 404 pages for route segments

## Coding Standards

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **No Implicit Any**: Prevent untyped variables
- **Exact Optional Properties**: Precise interface definitions
- **No Unused Variables**: Keep code clean

### Component Patterns
```typescript
// ✅ Preferred component structure
interface VulnerabilityFormProps {
  vulnerability?: Vulnerability;
  onSubmit: (data: VulnerabilityFormData) => void;
  onCancel: () => void;
}

export function VulnerabilityForm({ 
  vulnerability, 
  onSubmit, 
  onCancel 
}: VulnerabilityFormProps) {
  // Component implementation
}
```

### API Route Patterns
```typescript
// ✅ Preferred API route structure
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ status: 'fail', data: { message: 'Unauthorized' } }, { status: 401 });
    }
    
    const data = await vulnerabilityService.getAll(session.user);
    return Response.json({ status: 'success', data });
  } catch (error) {
    return Response.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
```

### Error Handling Standards
- **Fast Fail**: Provide descriptive error messages early
- **Context Inclusion**: Include debugging information in errors
- **Layered Handling**: Handle errors at appropriate abstraction levels
- **No Silent Failures**: Never ignore exceptions without logging

## Data Flow Architecture

### Frontend Data Flow
1. **UI Components** trigger actions
2. **Custom Hooks** manage API calls and state
3. **Services** handle business logic
4. **API Routes** process requests
5. **Database** stores/retrieves data

### Backend Service Pattern
```typescript
// Service layer handles business logic and DTO conversion
export const vulnerabilityService = {
  async create(user: User, input: CreateVulnDTO): Promise<VulnDTO> {
    // Business logic validation
    const vulnerability = await prisma.vulnerability.create({
      data: { ...input, userId: user.id }
    });
    
    // Convert to safe DTO
    return toVulnDTO(vulnerability);
  }
};
```

## Testing Strategy

### Test Organization
- **Unit Tests**: `*.test.ts` for individual functions
- **Component Tests**: `*.component.test.tsx` for React components  
- **Integration Tests**: `*.integration.test.ts` for feature workflows
- **E2E Tests**: `*.e2e.test.ts` for full user journeys

### Test Naming and Structure
```typescript
describe('VulnerabilityForm', () => {
  describe('when creating a new vulnerability', () => {
    it('should validate required fields', () => {
      // Test implementation
    });
    
    it('should submit form with valid data', () => {
      // Test implementation
    });
  });
});
```

## Decision Framework

When choosing between multiple valid approaches, prioritize by:

1. **Testability**: Can I easily write tests for this?
2. **Readability**: Will others understand this in 6 months?
3. **Consistency**: Does this follow existing project patterns?
4. **Simplicity**: Is this the simplest solution that works?
5. **Reversibility**: How expensive would it be to change this decision?

## Quality Gates

### Pre-commit Requirements
- **TypeScript Compilation**: All code must compile without errors
- **Linting**: ESLint must pass with zero warnings
- **Formatting**: Prettier must format all code consistently
- **Tests**: All existing tests must pass

### Pull Request Requirements
- **Code Review**: Required approval from team member
- **Test Coverage**: New features must include tests
- **Documentation**: Public APIs must be documented
- **No Breaking Changes**: Unless explicitly approved