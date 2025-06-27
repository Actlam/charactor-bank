import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import { useAuth, useUser } from '@clerk/nextjs'

// Clerk関連のモック
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
  useClerk: vi.fn(() => ({
    signOut: vi.fn()
  })),
  SignInButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  UserButton: () => <div data-testid="user-button">User Button</div>
}))

// Convexのモック
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => null)
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render logo and navigation links', () => {
    (useAuth as Mock).mockReturnValue({ isSignedIn: false });
    (useUser as Mock).mockReturnValue({ 
      user: null,
      isSignedIn: false,
      isLoaded: true
    })
    
    render(<Navbar />)
    
    expect(screen.getByText('Character Bank')).toBeInTheDocument()
    expect(screen.getByText('探索')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  describe('when user is not signed in', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({ isSignedIn: false });
      (useUser as Mock).mockReturnValue({ 
        user: null,
        isSignedIn: false,
        isLoaded: true
      })
    })

    it('should show login and signup buttons', () => {
      render(<Navbar />)
      
      expect(screen.getByText('ログイン')).toBeInTheDocument()
      expect(screen.getByText('新規登録')).toBeInTheDocument()
    })

    it('should not show new post button', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('新規投稿')).not.toBeInTheDocument()
    })
  })

  describe('when user is signed in', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({ isSignedIn: true });
      (useUser as Mock).mockReturnValue({ 
        user: { id: 'test-user-id', emailAddresses: [{ emailAddress: 'test@example.com' }] },
        isSignedIn: true,
        isLoaded: true
      })
    })

    it('should show new post button', () => {
      render(<Navbar />)
      
      expect(screen.getByText('新規投稿')).toBeInTheDocument()
    })

    it('should not show login and signup buttons', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('ログイン')).not.toBeInTheDocument()
      expect(screen.queryByText('新規登録')).not.toBeInTheDocument()
    })
  })

  it('should have correct links', () => {
    (useAuth as Mock).mockReturnValue({ isSignedIn: false });
    (useUser as Mock).mockReturnValue({ 
      user: null,
      isSignedIn: false,
      isLoaded: true
    })
    
    render(<Navbar />)
    
    const homeLink = screen.getByRole('link', { name: 'Character Bank' })
    expect(homeLink).toHaveAttribute('href', '/')
    
    const exploreLink = screen.getByRole('link', { name: '探索' })
    expect(exploreLink).toHaveAttribute('href', '/explore')
    
    const categoriesLink = screen.getByRole('link', { name: 'カテゴリ' })
    expect(categoriesLink).toHaveAttribute('href', '/categories')
  })
})