import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isSignedIn: false,
    userId: null,
  }),
  useUser: () => ({
    user: null,
    isSignedIn: false,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
  SignIn: () => null,
  SignUp: () => null,
}))

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue(undefined),
  useQuery: () => null,
  ConvexReactClient: vi.fn(),
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => children,
}))