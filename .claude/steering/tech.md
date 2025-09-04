# Technology Steering Document

## Technology Stack

### Core Framework

- **Next.js 15**: App Router architecture for modern full-stack development
- **TypeScript**: Type-safe development with strict configuration
- **React 19**: Latest React features and concurrent rendering
- **Node.js**: Server-side runtime environment

### Database & Data Layer

- **MySQL**: Primary database for production data storage
- **Prisma ORM**: Type-safe database access with migrations
- **Database Design**: Normalized schema with proper indexing for security data

### Authentication & Authorization

- **Current**: Simplified authentication system (migrated from complex RBAC)
- **Implementation**: NextAuth.js v5 + bcryptjs for password hashing
- **Session Management**: JWT tokens with secure cookie storage
- **Authorization**: Simple ownership-based data access control
- **Migration Note**: Simplified from over-engineered RBAC system (7000+ lines removed) following YAGNI principle

### Frontend Stack

- **UI Framework**: shadcn/ui component system
- **Styling**: Tailwind CSS v4 with utility-first approach
- **Component Library**: Radix UI primitives for accessibility
- **Forms**: React Hook Form + Zod for validation
- **Icons**: Tabler Icons + Lucide React
- **Animation**: Motion (formerly Framer Motion)

### State Management

- **Global State**: Zustand for client-side application state
- **URL State**: Nuqs for shareable and persistent URL state
- **Server State**: React Query patterns for API data caching

### Data Presentation

- **Tables**: TanStack Table for complex data grids
- **Charts**: Recharts for vulnerability analytics and reporting
- **Drag & Drop**: @dnd-kit for intuitive UI interactions
- **Date Handling**: date-fns for robust date operations

### User Experience

- **Command Palette**: Kbar (⌘+K) for power user workflows
- **Notifications**: Sonner for elegant toast messages
- **File Upload**: React Dropzone for secure file handling
- **Responsive Design**: React Responsive for device adaptation

### Development Tools

- **Linting**: ESLint with TypeScript-specific rules
- **Formatting**: Prettier with Tailwind CSS plugin
- **Pre-commit**: Husky + lint-staged for code quality gates
- **Type Checking**: Strict TypeScript configuration
- **Build Tool**: Next.js with Turbopack for fast development

### Monitoring & Observability

- **Error Tracking**: Sentry for production error monitoring
- **Performance**: Next.js built-in analytics and Core Web Vitals
- **Logging**: Structured logging for audit trails

## Architecture Principles

### Core Philosophy

1. **Progressive Enhancement**: Start simple, add complexity incrementally
2. **Learn from Existing Code**: Research and plan before implementing
3. **Pragmatic Approach**: Adapt to project reality over rigid adherence
4. **Clear Intent**: Code should be self-documenting and obvious

### Programming Principles

1. **DRY (Don't Repeat Yourself)**: Single source of truth for all knowledge
2. **YAGNI (You Aren't Gonna Need It)**: Build only what's currently needed
3. **Composition over Inheritance**: Prefer dependency injection patterns
4. **Explicit over Implicit**: Clear data flow and dependencies

### Security Architecture

1. **Data Sovereignty**: All data stored in controlled environments
2. **Zero Trust Security**: Verify every request and user action
3. **Minimum Privilege**: Users access only necessary resources
4. **Audit First**: Log all sensitive operations for compliance
5. **Defense in Depth**: Multiple layers of security controls

## Technical Decisions

### Framework Selection Rationale

- **Next.js 15**: Full-stack capability, excellent DX, strong ecosystem
- **TypeScript**: Essential for large-scale application reliability
- **Simplified Authentication**: Migrated from complex RBAC to basic ownership model (following YAGNI)
- **Tailwind CSS**: Rapid UI development with design system consistency
- **Prisma**: Type safety and excellent migration handling

### Database Considerations

- **MySQL**: Mature, reliable, excellent performance for relational data
- **Security Requirements**: Encryption at rest and in transit
- **Backup Strategy**: Automated backups with point-in-time recovery
- **Scalability**: Read replicas and connection pooling for growth

### Performance Requirements

- **Page Load**: < 2 seconds for initial load
- **Interactivity**: < 100ms for user interactions
- **API Response**: < 500ms for standard operations
- **Concurrent Users**: Support 100+ simultaneous users

### Integration Requirements

- **Penetration Testing Tools**: Future integration with Burp, OWASP ZAP, Nessus
- **Export Formats**: PDF, Word, Excel for reports
- **API Design**: RESTful with potential GraphQL for complex queries
- **Third-party Services**: Email, cloud storage, notification systems

## Development Standards

### Code Quality

- **Test Coverage**: Minimum 80% for business logic
- **Type Safety**: Strict TypeScript with no `any` types
- **ESLint Rules**: Max warnings = 0 for production
- **Code Review**: Required for all changes

### API Standards

- **REST Conventions**: Standard HTTP methods and status codes
- **JSend Format**: Consistent response structure (success/fail/error)
- **DTO Pattern**: Never expose Prisma models directly
- **Validation**: Zod schemas for all input validation

### Security Standards

- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection**: Parameterized queries only
- **XSS Prevention**: Content Security Policy and output encoding
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: API rate limits to prevent abuse

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="mysql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Monitoring
SENTRY_ORG="..."
SENTRY_PROJECT="..."

# Optional
NEXT_PUBLIC_SENTRY_DISABLED="true" # for development
```

### Deployment Considerations

- **Self-hosted Preferred**: For sensitive security data control
- **Container Ready**: Docker support for consistent deployments
- **Environment Separation**: Dev, staging, production isolation
- **SSL/TLS**: HTTPS required for all environments

## Future Technology Roadmap

### Phase 1 (Current)

- Complete core stack implementation
- Basic authentication and authorization
- Essential CRUD operations

### Phase 2 (Enhancement)

- Advanced security features
- Performance optimizations
- Extended monitoring and logging

### Phase 3 (Scale)

- Microservices architecture consideration
- Advanced caching strategies
- Enterprise integration capabilities

## Migration Paths

### Planned Migrations

1. **Complex RBAC → Simple Ownership**: Removed 7000+ lines of over-engineered permission system
2. **REST → GraphQL**: If complex query requirements emerge
3. **Monolith → Microservices**: If scaling demands require it

### Technical Debt Management

- Document all temporary solutions in `/docs/tech-debt.md`
- Regular refactoring sprints to address accumulated debt
- Architecture reviews before major feature additions

## Key Development Commands

```bash
# Initial setup
cp env.example.txt .env.local && npm install

# Development
npm run dev                                   # Start development server
npx prisma migrate dev                        # Database migrations
npx prisma studio                             # Database management UI

# Code quality
npm run typecheck && npm run lint:fix         # Type checking and linting
npm test                                      # Run tests
```
