# Legacy Documentation and Design Decisions

> **Note:** This document contains archived historical documentation for reference purposes. The core, up-to-date project documentation is now maintained on the [GitHub Wiki](https://github.com/OpenReferralUk/oruk-standard-and-website/wiki).
>
> For current documentation, please visit the wiki at: **https://github.com/OpenReferralUk/oruk-standard-and-website/wiki**

**Archived Date:** January 28, 2026

---

## Table of Contents

1. [Technical Architecture](#technical-architecture-wiki)
2. [Requirements](#requirements-wiki)
3. [Strategy](#strategy-wiki)
4. [Workplan](#workplan-wiki)

---

<a name="technical-architecture-wiki"></a>

# Technical Architecture (Wiki)

_Last edited: January 21, 2026 | 2 revisions_

## Overview

The Open Referral UK (ORUK) platform is a modern, full-stack web application built with Next.js 16, React 19, and TypeScript. It serves as the primary resource hub for the Open Referral UK data standard, providing documentation, developer tools, validation services, and community resources. The platform is an open standard that provides a consistent way to publish, find, and use community services data across the UK.

**Key Objectives:**

- Provide comprehensive documentation and resources for the ORUK standard
- Offer developer tools for validation, testing, and integration
- Support local authorities in adopting the standard
- Build and maintain a community around open service data

## Technology Stack

### Core Framework

- **Next.js 16.1.2** - React framework with App Router architecture
  - Server Components for optimal performance
  - File-based routing system
  - Server Actions for data mutations
  - Built-in redirects and headers configuration
  - Experimental HMR cache disabled for development
- **React 19.2.3** - Latest React with enhanced server component capabilities
- **TypeScript 5.9.3** - Strict type checking for code quality and developer experience

### Styling & UI

- **CSS Modules** - Component-scoped styling with design tokens
- **Design System** - Custom token-based design system (tokens.css)
- **Inter Font** - Google Fonts integration for consistent typography
- **React Icons 5.5.0** - Icon library for UI elements
- **Color Interpolate 2.0.0** - Color gradient generation utilities

### Data & Validation

- **MongoDB 7.0.0** - Document database for service registry and dashboard data
- **Zod 4.3.5** - Runtime schema validation and type safety
- **gray-matter 4.0.3** - Frontmatter parsing for markdown content
- **marked 17.0.1** - Markdown to HTML conversion
- **html-react-parser 5.2.11** - HTML string parsing for React components

### Developer Experience

- **ESLint 9.39.2** - Code linting with Next.js configuration
- **Prettier 3.8.0** - Code formatting
- **Jest 30.2.0** - Unit testing framework with React Testing Library
- **Playwright 1.57.0** - End-to-end testing across browsers
- **TypeScript Compiler 5.9.3** - Strict mode for maximum type safety
- **Husky 9.1.7** - Git hooks for pre-commit validation
- **lint-staged 16.2.7** - Run linters on staged files

### Infrastructure & Deployment

- **Vercel** - Serverless deployment platform with CI/CD
- **Vercel Analytics 1.6.1** - Performance and usage monitoring
- **GitHub** - Version control and issue tracking integration
- **Octokit 5.0.5** - GitHub REST API client
- **@octokit/auth-app 8.1.2** - GitHub App authentication

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│                     (React 19 + Next.js)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Vercel Edge Network                         │
│                    (CDN + Edge Functions)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
┌────────────────▼─────────┐  ┌─────────▼──────────────┐
│  Next.js App Router      │  │   Static Assets        │
│  (Server Components)     │  │   (CSS, Images, JSON)  │
└────────────────┬─────────┘  └────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
│ Content  │ │ MongoDB   │ │  External  │
│ (Files)  │ │ Database  │ │  APIs      │
└──────────┘ └───────────┘ └────────────┘
```

### Application Layers

#### 1. Presentation Layer (`src/app/`, `src/components/`)

Handles all user-facing interfaces and routing:

- **App Router Pages** - File-based routing with dynamic segments
- **Server Components** - Default rendering mode for optimal performance
- **Client Components** - Interactive UI elements (forms, modals, validators)
- **Layout System** - Hierarchical layouts with shared navigation
- **Component Library** - Reusable, composable UI components
- **Toast Notifications** - react-hot-toast 2.6.0 for user feedback
- **Cookie Management** - react-cookie 8.0.1 and react-cookie-consent 10.0.0

**Key Components:**

- `Header` - Global navigation with dynamic menu
- `Crumbtrail` - Breadcrumb navigation
- `Dashboard` - Service feed monitoring dashboard
- `Validator` - API validation interface
- `Documentation` - Interactive API documentation viewer
- `DataModel` - Schema visualization and explorer
- `APIModel` - JSON visualization with @microlink/react-json-view 1.27.1

#### 2. Business Logic Layer (`src/lib/`, `src/repositories/`, `src/models/`)

Core application logic and data access:

- **Repositories** - Data access patterns with type safety
- **Models** - Zod schemas for runtime validation
- **Services** - Business logic encapsulation
- **Utilities** - Shared helper functions

**Key Patterns:**

```typescript
// Repository Pattern - Type-safe data access
BaseRepository<TDocument, TResponse, TInsert>
  → ServiceRepository extends BaseRepository

// Zod Validation - Runtime type safety
serviceInputSchema → validated data → ServiceDocument
```

#### 3. Data Layer (`src/lib/mongodb.ts`)

MongoDB integration with connection pooling:

- **Singleton Pattern** - Single shared MongoClient across hot reloads
- **Global Caching** - Reuses connections in development
- **Typed Collections** - Type-safe database operations
- **Error Handling** - Custom error types for MongoDB operations

#### 4. Content Management (`content/`, utilities)

File-based content system for documentation:

- **Markdown Files** - Version-controlled documentation
- **Frontmatter** - Metadata and configuration in YAML
- **Dynamic Loading** - Runtime content loading and parsing
- **Versioning** - Support for multiple specification versions

## Core Features & Implementation

### 1. Service Registry & Dashboard

**Purpose:** Track and monitor verified ORUK API feeds for health and compliance.

**Architecture:**

```
User → Dashboard Page → ServiceRepository → MongoDB → Service Documents
                     ↓
              External API Calls (validation/health checks)
                     ↓
              Status Updates → Real-time Display
```

**Implementation:**

- **Data Model** - `ServiceDocument` with nested fields for status tracking
- **Repository** - `ServiceRepository` with custom queries for filtering
- **Server Actions** - `createMessage()` for service registration
- **GitHub Integration** - Automated issue creation for verification

**Key Fields:**

- `statusIsUp` - Endpoint availability
- `statusIsValid` - ORUK compliance
- `statusOverall` - Combined health status
- `lastTested` - Last validation timestamp

### 2. API Validator Tool

**Purpose:** Real-time validation of ORUK API feeds against specification.

**Architecture:**

```
User Input (URL) → Validator Component (Client)
                         ↓
              Server Action → External Validator Service
                         ↓
              Validation Results → Formatted Display
```

**Features:**

- Real-time validation feedback
- Error highlighting and messages
- Compliance checking against ORUK schema
- Support for multiple specification versions

### 3. Content Management System

**Purpose:** Flexible, version-controlled documentation and resources.

**Architecture:**

```
Markdown Files → gray-matter (frontmatter) → marked (HTML)
     ↓                                            ↓
Metadata Extraction                      Rendered Content
     ↓                                            ↓
Dynamic Routing ← Next.js App Router → Page Components
```

**Content Structure:**

```
content/
├── metadata.json          # Site-wide configuration
├── sitemap.json          # Navigation structure
├── about/                # About pages with frontmatter
├── adopt/                # Adoption resources
│   ├── gantt/           # Project planning tools
│   └── use-cases/       # Implementation examples
├── case-studies/        # Real-world implementations
├── community/           # Community resources
│   ├── directory/       # Service provider directory
│   └── join/            # Onboarding information
├── developers/          # Technical documentation
│   ├── api/             # API documentation
│   ├── specification/   # ORUK specification
│   ├── schemata/        # Schema documentation
│   └── validator/       # Validation tools
└── info/                # Legal and site info
```

**Key Utilities:**

- `loadMarkdownContent()` - Load and parse markdown with frontmatter
- `parseMarkdown()` - Convert markdown to HTML with extensions
- `getPageByPath()` - Dynamic page resolution
- `getAllContentVersions()` - Version management

### 4. API Documentation System

**Purpose:** Interactive OpenAPI specification viewer.

**Architecture:**

```
OpenAPI Specs (JSON) → Version Selection → Dynamic Component
        ↓                                         ↓
specifications/                          Interactive Viewer
├── 1.0/                                        ↓
│   └── openapi.json                  Schema Explorer + Examples
└── 3.0/
    └── openapi.json
```

**Features:**

- Version-specific documentation
- Interactive schema browser
- Request/response examples
- Model definitions with relationships

### 5. Middleware & Proxying

**Purpose:** Hostname-based routing and redirects.

**Implementation:**

```typescript
// src/proxy.ts - Middleware for subdomain routing
export function proxy(req: NextRequest) {
  const { hostname } = req.nextUrl
  const targetPath = redirects[hostname]
  if (targetPath) {
    return NextResponse.redirect(redirectUrl, 308)
  }
  return NextResponse.next()
}
```

**Use Cases:**

- Subdomain management (e.g., forum.openreferraluk.org)
- Legacy URL redirects
- Multi-tenancy support

## Data Models & Schema

### Service Document Schema

```typescript
interface ServiceDocument {
  _id: ObjectId
  name: { value: string }
  publisher: { value: string; url: string }
  developer: { value: string; url: string }
  service: { value: string; url: string }
  description: { value: string }
  email: { value: string }
  status: 'pending' | 'approved' | 'rejected'
  statusNote?: string
  schemaVersion: { value: string }
  statusIsUp: { value: boolean }
  statusIsValid: { value: boolean }
  statusOverall: { value: boolean }
  lastTested: { value: Date | null }
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Design Rationale:**

- Nested objects for complex fields (maintains flexibility)
- Status fields for multi-dimensional health tracking
- Timestamps for audit trail
- Zod schemas for runtime validation

### Content Frontmatter Schema

```yaml
---
title: "Page Title"
description: "Page description for SEO"
version: "3.0"
layout: "two-column" | "single-column"
published: true
lastUpdated: "2025-01-09"
---
```

## Routing & Navigation

### File-Based Routing Structure

```
src/app/
├── layout.tsx                    # Root layout (wraps all pages)
├── page.tsx                      # Homepage (/)
├── not-found.tsx                 # 404 page
├── actions.tsx                   # Server actions
├── [section]/                    # Dynamic catch-all routes
│   └── page.js                   # Handles dynamic content pages
├── about/
│   └── [slug]/
│       └── page.tsx              # /about/* pages
├── adopt/
│   └── [slug]/
│       └── page.tsx              # /adopt/* pages
├── case-studies/
│   └── [id]/
│       └── page.tsx              # /case-studies/* pages
├── community/
│   └── [slug]/
│       └── page.tsx              # /community/* pages
├── developers/
│   ├── page.tsx                  # /developers
│   ├── api/
│   ├── dashboard/
│   ├── validator/
│   └── schemata/
└── sitemap/
    └── page.tsx                  # XML sitemap generation
```

### Navigation Hierarchy

```typescript
// Navigation built from sitemap.json and metadata.json
{
  "about": {
    "label": "About",
    "children": ["introducing", "steering", "benefits", ...]
  },
  "developers": {
    "label": "Developers",
    "children": ["overview", "specification", "api", "validator", ...]
  },
  ...
}
```

**Features:**

- Dynamic breadcrumbs based on current path
- Hierarchical menus with active state
- Configurable via `USE_NAV` environment variable

## State Management & Data Flow

### Server-Side State

- **Server Components** - Default rendering mode, no client-side JavaScript
- **Server Actions** - Form submissions and data mutations
- **MongoDB** - Persistent state storage

### Client-Side State

- **React State** - Local component state (forms, modals)
- **Cookies** - User preferences (cookie consent, analytics)
- **URL State** - Navigation and filtering

### Data Flow Patterns

#### 1. Server Component Data Fetching

```typescript
// Direct database access in server components
export default async function DashboardPage() {
  const repo = new ServiceRepository()
  const services = await repo.findAll()
  return <Dashboard services={services} />
}
```

#### 2. Server Actions for Mutations

```typescript
'use server'
export async function createMessage(formState, formData) {
  const data = serviceInputSchema.parse(values)
  const repo = new ServiceRepository()
  const service = await repo.create(data)
  revalidatePath('/developers/dashboard')
  return toFormState(service)
}
```

#### 3. Client Components for Interactivity

```typescript
'use client'
export function ValidatorForm() {
  const [result, setResult] = useState(null)
  const handleSubmit = async (url) => {
    const response = await fetch('/api/validate', { ... })
    setResult(await response.json())
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

## Security & Authentication

### Current Implementation

- **No authentication required** - Public documentation site
- **Server-side validation** - All inputs validated with Zod schemas
- **GitHub App Authentication** - Secure API integration for issue creation
- **Environment Variables** - Sensitive configuration not in VCS

### Security Measures

1. **Input Validation** - Zod schemas prevent malformed data
2. **MongoDB Injection Protection** - Typed queries and parameterization
3. **HTTPS Only** - Enforced by Vercel
4. **Content Security** - No user-generated content execution
5. **Rate Limiting** - Vercel platform-level protection

### GitHub Integration Security

```typescript
// Using GitHub App authentication (more secure than PAT)
import { createAppAuth } from '@octokit/auth-app'
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
  installationId: process.env.GITHUB_INSTALLATION_ID
})
```

## Testing Strategy

### Unit Testing (Jest)

**Framework:** Jest 30 with React Testing Library and ts-jest

**Configuration:**

```typescript
// jest.config.ts
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

**Test Coverage:**

- Component rendering and behavior
- Utility functions
- Data transformations
- Schema validation
- Repository methods

**Example Structure:**

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
├── lib/
│   └── __tests__/
│       ├── mongodb.test.ts
│       └── query-builder.test.ts
└── repositories/
    └── __tests__/
        └── service-repository.test.ts
```

### End-to-End Testing (Playwright)

**Framework:** Playwright 1.57 with multiple browser support

**Configuration:**

```typescript
// playwright.config.ts
{
  testDir: 'src/e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120000,
  },
  projects: [
    { name: 'Desktop Chrome', use: devices['Desktop Chrome'] }
  ]
}
```

**Test Scenarios:**

- Page navigation and routing
- Form submissions
- Dashboard functionality
- Validator tool workflow
- Content rendering
- Mobile responsiveness

**Example Test:**

```typescript
test('should submit service registration form', async ({ page }) => {
  await page.goto('/developers/register')
  await page.fill('[name="name"]', 'Test Service')
  await page.fill('[name="serviceUrl"]', 'https://api.example.com')
  await page.click('button[type="submit"]')
  await expect(page.locator('.success-message')).toBeVisible()
})
```

### Testing Scripts

```bash
# Unit tests
yarn test              # Run all tests
yarn test:watch        # Watch mode for development
yarn test:ci           # CI mode with coverage

# E2E tests
yarn e2e               # Run Playwright tests
```

## Performance Optimization

### Build-Time Optimizations

1. **Static Generation** - Pre-render static pages at build time
2. **Incremental Static Regeneration** - Update static pages on demand
3. **Image Optimization** - Next.js automatic image optimization
4. **Code Splitting** - Automatic route-based splitting
5. **Tree Shaking** - Remove unused code

### Runtime Optimizations

1. **Server Components** - Zero JavaScript for static content
2. **MongoDB Connection Pooling** - Reuse database connections
3. **React Suspense** - Streaming server rendering
4. **Font Optimization** - Inter font with subset loading
5. **CSS Modules** - Scope styles and eliminate unused CSS

### Caching Strategy

```typescript
// Next.js caching configuration
export const revalidate = 3600 // 1 hour

// Dynamic revalidation
revalidatePath('/developers/dashboard')
```

### Performance Metrics

- **First Contentful Paint (FCP)** - Target: < 1.5s
- **Largest Contentful Paint (LCP)** - Target: < 2.5s
- **Time to Interactive (TTI)** - Target: < 3.0s
- **Cumulative Layout Shift (CLS)** - Target: < 0.1

## Deployment & Infrastructure

### Vercel Deployment

**Platform Features:**

- **Serverless Functions** - Automatic scaling for API routes
- **Edge Network** - Global CDN for static assets
- **Preview Deployments** - Automatic for pull requests
- **Environment Variables** - Secure configuration management
- **Analytics** - Built-in performance monitoring

**Next.js Configuration:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  experimental: {
    serverComponentsHmrCache: false
  },
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  redirects: async () => [
    {
      source: '/dashboard',
      destination: '/developers/dashboard',
      permanent: true
    }
  ],
  headers: async () => [
    {
      source: '/specifications/:path*',
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Cache-Control', value: 'public, max-age=3600, immutable' }
      ]
    }
  ]
}
```

**Vercel Configuration:**

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "staging.openreferraluk.org" }],
      "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }]
    }
  ]
}
```

### Build Process

```bash
1. Install dependencies: yarn install
2. Git hooks setup: yarn prepare (Husky)
3. Type checking: yarn type-check (tsc --noEmit)
4. Linting: yarn lint:check
5. Unit tests: yarn test:ci
6. Build: yarn build (next build)
7. Deploy: vercel deploy --prod

# Or use combined validation:
yarn validate  # Runs lint, type-check, and test:ci
```

### Environment Variables

**Required:**

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=oruk-production
VALIDATOR_ENDPOINT=https://validator.openreferraluk.org/api/validate
DASHBOARD_DETAILS_ENDPOINT=https://api.openreferraluk.org/dashboard
```

**Optional:**

```bash
USE_NAV=true                    # Enable navigation menu
USE_COOKIES=true                # Enable cookie consent
USE_NOWARRANTY=true            # Show warranty disclaimer
GITHUB_APP_ID=123456           # GitHub App integration
GITHUB_PRIVATE_KEY=...         # GitHub authentication
GITHUB_INSTALLATION_ID=...     # GitHub installation ID
```

### Multi-Environment Strategy

- **Production** - openreferraluk.org
- **Staging** - staging.openreferraluk.org (noindex header)
- **Preview** - Auto-generated URLs for PRs
- **Local** - localhost:3000 with .env.local

## Monitoring & Observability

### Vercel Analytics

- **Real User Monitoring** - Performance metrics from actual users
- **Deployment Insights** - Build times and success rates
- **Function Execution** - Serverless function performance

### Application Logging

```typescript
// Console logging in server components
console.log('Creating new MongoClient connection...', MONGODB_URI)
console.error('Failed to create GitHub issue:', error)
```

### Error Handling

```typescript
// Custom error types
class ValidationError extends Error { ... }
class MongoDBError extends Error { ... }

// Try-catch with logging
try {
  const service = await repo.create(data)
} catch (error) {
  console.error('Service creation failed:', error)
  return fromErrorToFormState(error)
}
```

### Health Checks

- **Dashboard Service** - Monitors all registered feeds
- **Validator Service** - Checks endpoint availability
- **Database Connection** - Connection pooling with timeout

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/OpenReferralUK/oruk-standard-and-website.git
cd oruk-standard-and-website

# 2. Install dependencies
yarn install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB credentials

# 4. Start development server
yarn dev

# 5. Open browser
open http://localhost:3000
```

### Development Commands

```bash
# Development
yarn dev              # Start dev server with hot reload (NODE_OPTIONS=--no-webstorage)
yarn dev:ci           # Start dev server without custom options

# Building
yarn build            # Production build
yarn start            # Serve production build

# Code Quality
yarn lint             # Run ESLint with auto-fix
yarn lint:check       # Run ESLint without fixing
yarn tidy             # Format with Prettier
yarn type-check       # Run TypeScript compiler checks
yarn validate         # Run lint, type-check, and tests

# Testing
yarn test             # Run Jest unit tests
yarn test:watch       # Jest watch mode
yarn test:ci          # Jest in CI mode
yarn test:coverage    # Jest with coverage report
yarn e2e              # Run Playwright E2E tests

# Content Management
yarn upd              # Update frontmatter metadata

# Git Hooks
yarn prepare          # Install Husky git hooks
```

### Git Workflow

**Branching Strategy:**

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Production hotfixes

**Commit Convention:**

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: component, page, api, etc.

Example:
feat(dashboard): add status filter dropdown
fix(validator): handle timeout errors gracefully
docs(architecture): update deployment section
```

## Code Organization & Standards

### Directory Structure Philosophy

```
src/
├── app/              # Pages (co-located with routes)
├── components/       # Reusable UI components
├── lib/              # Core infrastructure (DB, utilities)
├── models/           # Data schemas and types
├── repositories/     # Data access layer
├── actions/          # Server actions
├── utilities/        # Pure helper functions
├── specifications/   # OpenAPI specs (data, not code)
├── e2e/              # End-to-end tests
└── styles/           # Global styles and tokens
```

### Component Organization Pattern

```
components/
├── Button/
│   ├── Button.tsx          # Component implementation
│   ├── Button.module.css   # Component styles
│   └── __tests__/
│       └── Button.test.tsx # Component tests
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── Dashboard.module.css
│   ├── DashboardFilters.tsx
│   ├── DashboardTable.tsx
│   └── __tests__/
```

### TypeScript Standards

**TypeScript Compiler Options:**

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "forceConsistentCasingInFileNames": true,
  "target": "ES2020",
  "module": "esnext",
  "moduleResolution": "bundler"
}
```

**Type Safety:**

```typescript
// Use strict types, avoid 'any'
const repo: ServiceRepository = new ServiceRepository()

// Prefer interfaces for objects
interface ServiceProps {
  name: string
  url: string
}

// Use Zod for runtime validation
const schema = z.object({
  name: z.string().min(1),
  url: z.string().url()
})
```

**Naming Conventions:**

- **Components** - PascalCase (e.g., `DashboardTable`)
- **Files** - Match component name (e.g., `DashboardTable.tsx`)
- **Utilities** - camelCase (e.g., `loadMarkdownContent`)
- **Constants** - UPPER_SNAKE_CASE (e.g., `MONGODB_URI`)
- **Types/Interfaces** - PascalCase (e.g., `ServiceDocument`)

### CSS Standards

**Design Tokens:**

```css
/* tokens.css - Single source of truth */
:root {
  --color-primary: #0066cc;
  --spacing-unit: 0.5rem;
  --font-family-base: 'Inter', sans-serif;
  --breakpoint-mobile: 768px;
}
```

**Module Pattern:**

```css
/* Component.module.css */
.container {
  display: flex;
  gap: var(--spacing-unit);
}

.button {
  background: var(--color-primary);
}
```

## API Integration

### External API Services

#### 1. ORUK Validator Service

```typescript
// Endpoint: process.env.VALIDATOR_ENDPOINT
POST /api/validate
{
  "url": "https://api.example.com/services",
  "version": "3.0"
}

Response:
{
  "valid": boolean,
  "errors": [...],
  "warnings": [...]
}
```

#### 2. Dashboard Details Service

```typescript
// Endpoint: process.env.DASHBOARD_DETAILS_ENDPOINT
GET /dashboard?id={serviceId}

Response:
{
  "status": "up" | "down",
  "lastChecked": "2025-01-09T10:00:00Z",
  "responseTime": 150,
  "validationStatus": "passed"
}
```

#### 3. GitHub API

```typescript
// Using Octokit for GitHub App authentication
const octokit = new Octokit({ authStrategy: createAppAuth, ... })

// Create verification issue
await octokit.rest.issues.create({
  owner: 'OpenReferralUK',
  repo: 'human-services',
  title: `Service Verification: ${serviceName}`,
  body: issueTemplate,
  labels: ['verification', 'pending']
})
```

## Future Architecture Considerations

### Potential Enhancements

1. **Authentication & Authorization**
   - User accounts for service providers
   - Role-based access control (RBAC)
   - OAuth integration for GitHub/Google

2. **Real-Time Features**
   - WebSocket integration for live dashboard updates
   - Real-time validation feedback
   - Collaborative editing

3. **Advanced Search**
   - Full-text search with Elasticsearch
   - Faceted filtering
   - Natural language queries

4. **API Gateway**
   - Centralized API management
   - Rate limiting per user/organization
   - API key management

5. **Content Delivery**
   - Multi-language support (i18n)
   - Content versioning system
   - Editorial workflow

6. **Analytics & Reporting**
   - Custom analytics dashboard
   - Service health trends
   - Adoption metrics

7. **Microservices Architecture**
   - Separate validator service
   - Dedicated dashboard service
   - Independent scaling

## Appendix

### Key Dependencies

| Package           | Version | Purpose            |
| ----------------- | ------- | ------------------ |
| next              | 16.1.2  | React framework    |
| react             | 19.2.3  | UI library         |
| react-dom         | 19.2.3  | React DOM renderer |
| typescript        | 5.9.3   | Type system        |
| mongodb           | 7.0.0   | Database driver    |
| zod               | 4.3.5   | Schema validation  |
| marked            | 17.0.1  | Markdown parser    |
| gray-matter       | 4.0.3   | Frontmatter parser |
| jest              | 30.2.0  | Testing framework  |
| playwright        | 1.57.0  | E2E testing        |
| eslint            | 9.39.2  | Code linting       |
| prettier          | 3.8.0   | Code formatter     |
| octokit           | 5.0.5   | GitHub API client  |
| @vercel/analytics | 1.6.1   | Analytics          |
| uuid              | 13.0.0  | UUID generation    |

### Configuration Files

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| next.config.ts       | Next.js configuration       |
| tsconfig.json        | TypeScript compiler options |
| jest.config.ts       | Jest testing configuration  |
| playwright.config.ts | Playwright E2E setup        |
| eslint.config.mjs    | ESLint rules                |
| vercel.json          | Deployment configuration    |
| package.json         | Dependencies and scripts    |

### Environment Configuration

See `.env.example` for full list of environment variables and their descriptions.

### Related Documentation

- [README.md](../README.md) - Project overview and quick start
- [Managing Content](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/Managing-Content) - Content authoring guide
- [Testing](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/Testing) - Testing guidelines
- [GitHub Integration](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/GitHub-Issue-Creation-for-Service-Verification) - GitHub App setup

**Document Version:** 2.0  
**Last Updated:** January 20, 2026  
**Maintainer:** iStandUK Technical Team

---

<a name="requirements-wiki"></a>

# Requirements (Wiki)

_Last edited: March 24, 2025 | 19 revisions_

## 1.0 Dashboard

### 1.1 Use cases

#### a) ✅ **Must** support the needs of a consumer of services looking for services to integrate into their system.

This user is interested in the content of feeds, e.g. their coverage and richness.

#### b) ✅ **Must** support the needs of a commissioner of services

This user may e.g. be interested in who developed the feed etc.

#### c) ✅ **Must** support the needs of quality assurance for the incentive scheme

Validity and availability of the feed are criteria contributory to award of incentives.

#### d) ✅ **Must** support the project goal of building an enthusiastic and informed community

For a general audience, it is important to give a sense that ORUK is active and is increasingly widely adopted.

### 1.2 Functional requirements

#### a) ✅ **May** partition / specialise the dashboard functionality

i.e. to target use cases separately eg with a browsable directory of services (cases a,b,d) and a dashboard to monitor availability (case c)

#### b) ✅ **Must** present a tabular display for users with in-band browsers

#### c) ✅ **May** provide a non-tabular equivalent for users of smaller screens

#### d) ✅ ❌ **May** offer sorting and/or filtering of tabular display

Particularly useful to support directory functionality. Sorting is implemented, filtering not - this is because the function is not needed.

#### e) ✅ **Must** paginate tabular display past a certain number of rows.

#### f) ✅ **Must** enable click-through to a detail view of validation for a chosen table row

#### g) ✅ **May** make detail views available at a bookmarkable permalink

To support use case 1.1(c)

#### h) **Must** provide a simple administrator CRUD interface for creating and updating dashboard organisation

Not public-facing, does not need to be branded.

#### i) ❌ **May** provide UI to configure preferences for notification of service administrator if validation fails

Not doing, notifications are out of scope.

#### j) ✅ **May** extend the UK profile to include extra fields so we can fully populate the Dashboard from feeds. Extra fields would be: Organisation name and URL, Developer name and URL, and summary text

This is being done via a submission form through the website instead.

## 2.0 Validator

### 2.1 Use cases

#### a) ✅ **Must** support the needs of feed developers

#### b) ✅ **Must** support the needs of feed owners hoping to be eligible for incentive scheme. Could be large or small depending on the terms of the scheme

#### c) ✅ **Must** interoperate with the dashboard

#### d) ❌ **May** support the needs of feed consumers looking to understand the richness of feeds

This use case may better be served by directory functionality in the dashboard (instead). Also out of scope as not needed and affected processing time.

### 2.2 Functional requirements

#### a) ❌ **Must** offer a choice of at least two levels of validation.

Note that multiple levels are no longer needed as we have improved performance. We now offer full validation at all times.

#### b) ❌ **May** offer multiple configurable levels of validation and / or…

**no longer needed**

#### c) ❌ **May** allow opt-in/out to specific validations

**no longer needed**

#### d) ✅ **Must** show pass or fail of each validation

#### e) ✅ **Must** explain failures

#### f) ✅ **Must** integrate validation documentation

#### g) ❌ **Must** show number of records reported for endpoint

Removed from requirements (conflicts with (i) below)

#### h) ❌ **May** provide a full verbatim copy of the data returned from the server (ie to support use case 2.1a).

ie If you are debugging a service you're developing, you might be returning eg JSON that doesn't parse. To help you debug this, we may round trip a copy of the document your feed returned, so you can investigate.

#### i) ❌ **May** provide richness metrics

Same as 1.2d which is out of scope.

#### j) ✅ **Must** validate against version 3.0 UK profile

#### k) ✅ **May** validate against ORUK version 1

#### l) ✅ **May** validate against other profiles of version 3.x"

Would require some soft-coding to accommodate other profiles.

#### m) ✅ **May** allow choice of validation according to v1.0 or v3.0 specification

Alternatively may be better handled by dashboard.

#### n) ❌ **May** provide up-to-dateness metrics

✅ Alternatively may be better handled by dashboard.

#### n) ❌ **May** notify specific people when scheduled validations fail

Possibly by email. After every failure or persistent failures. Not doing as notifications are out of scope.

## 3.0 General

### 3.1 Functional requirements

#### a) **May** support user appearance preferences

e.g. dark mode

#### b) ✅ **Must** upgrade online documentation to v3.0 of specification

#### c) ✅ **May** provide documentation of the legacy 1.0 specification

#### d) ✅ **Must** integrate documentation website with main website

#### e) ✅ **Must** integrate dashboard and validator into main website

#### f) ✅ **Must** make necessary changes to website navigation

#### g) ✅ **May** retain existing visual styling

#### h) ✅ **May** revise information architecture for some or all of the website

#### i) ✅ **May** provide one of more directories of the website which work as 'content dumps' where arbitrary new materials can be added (eg documents, minutes, news stories etc)

#### j) ✅ **May** deprecate existing api query tool

#### k) ✅ **May** deprecate existing service packaging tool

#### l) ✅ **Must** retain compatibility with existing subdomains

We have implemented a wildcard domain so that any .openreferraluk.org site will direct to the homepage.

### 3.2 Non-functional requirements

#### a) ✅ will not support non-English (eg Welsh, Gaelic) language content

#### b) ✅ make source available under an open licence

ie in this repository

#### c) ✅ publish transparently on a public GitHub repository, with ownership to be relinquished at end of project

ie this repository

#### d) include a test suite

For more details see [Testing](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/Testing)

#### e) ✅ be accessible

For more details see [A11y](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/A11y)

---

<a name="strategy-wiki"></a>

# Strategy (Wiki)

_Last edited: July 18, 2024 | 5 revisions_

## Summary

The site is a [Next.js](https://nextjs.org/) application.

Although numerous hosting scenarios are possible, we are hosting our proof-of-concept site on [Netlify](https://www.netlify.com/).

The previous 'Developer' site is now part of this site.

Content management - which previously used Strapi - has been simplified to use [Markdown](https://www.markdownguide.org/basic-syntax/) files stored in this repository.

## System architecture

(under construction)

![Image](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/images/architecture.png)

This file is also available as a [PDF (right click to download)](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/files/architecture-0_2.pdf).

## Hosting requirements

The web host must provide:

- Next.js runtime
- configuration of subdomains (to point legacy subdomains to new URIs with an HTTP code 301)
- continuous build every time the main branch on GitHub receives a push.

---

<a name="workplan-wiki"></a>

# Workplan (Wiki)

_Last edited: July 18, 2024 | 1 revision_

## Project setup

1. Github repository ✅
2. Netlify ✅
3. Monorepo ✅
4. Next.js app ✅
5. External placeholder components ✅
6. Configure Prettier ✅
7. Configure ESLint ✅
8. Configure Cypress ✅
9. Configure Storybook ✅
10. Configure Jest ✅
11. ...

## Dashboard

1. App route ✅
2. Hello world page ✅
3. Proof of concept Github action to get JSON from API ✅
4. ...

## Validator

1. App route ✅
2. Hello world page ✅
3. Proof of concept get json from API ✅
4. ...

## Website

1. ...

---

**End of Legacy Documentation**

_For current documentation, please visit the project wiki:_

- _[GitHub Wiki Home](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki) - Main documentation hub_
- _[Architecture](https://github.com/OpenReferralUK /oruk-standard-and-website/wiki) - Current technical architecture_
- _[Managing Content](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/Managing-Content) - Content authoring guide_
- _[Testing](https://github.com/OpenReferralUK/oruk-standard-and-website/wiki/Testing) - Testing guidelines_
- _[README.md](../README.md) - Project overview and getting started_
