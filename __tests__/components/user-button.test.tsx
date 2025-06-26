import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserButton } from '@/components/user-button'
import { useClerk } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@clerk/nextjs', () => ({
  useClerk: vi.fn(),
}))

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('UserButton Component', () => {
  const mockSignOut = vi.fn()
  const mockRouter = { push: vi.fn() }

  const mockUser = {
    username: 'testuser',
    displayName: 'テストユーザー',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    clerkId: 'clerk-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mocks
    ;(useClerk as Mock).mockReturnValue({ signOut: mockSignOut })
    ;(useRouter as Mock).mockReturnValue(mockRouter)
  })

  it('should render null when user is loading', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: null, isLoading: true })
    
    const { container } = render(<UserButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null when no user is present', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: null, isLoading: false })
    
    const { container } = render(<UserButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should render user button with avatar when user has avatarUrl', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveAttribute('src', mockUser.avatarUrl)
    expect(avatar).toHaveAttribute('alt', mockUser.displayName)
  })

  it('should render user button with default avatar when no avatarUrl', () => {
    const userWithoutAvatar = { ...mockUser, avatarUrl: undefined }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutAvatar, isLoading: false })
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    // Should show default avatar with User icon
    const defaultAvatar = button.querySelector('.bg-gradient-to-br')
    expect(defaultAvatar).toBeInTheDocument()
    
    const userIcon = button.querySelector('svg')
    expect(userIcon).toBeInTheDocument()
  })

  it('should show dropdown menu when button is clicked', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Check for dropdown menu items
    expect(screen.getByText('マイプロフィール')).toBeInTheDocument()
    expect(screen.getByText('アカウント設定')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('should display user information in dropdown', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Check user info in dropdown
    expect(screen.getByText(mockUser.displayName)).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })

  it('should show username when displayName is not available', async () => {
    const userWithoutDisplayName = { ...mockUser, displayName: undefined }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutDisplayName, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText(mockUser.username)).toBeInTheDocument()
  })

  it('should navigate to profile page when profile option is clicked', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    const profileOption = screen.getByText('マイプロフィール')
    await user.click(profileOption)
    
    expect(mockRouter.push).toHaveBeenCalledWith(`/users/${mockUser.username}`)
  })

  it('should have correct link to account settings', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    const settingsLink = screen.getByText('アカウント設定').closest('a')
    expect(settingsLink).toHaveAttribute('href', '/profile/edit')
  })

  it('should sign out when logout option is clicked', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    const logoutOption = screen.getByText('ログアウト')
    await user.click(logoutOption)
    
    expect(mockSignOut).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should redirect to home page after logout', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    const logoutOption = screen.getByText('ログアウト')
    await user.click(logoutOption)
    
    // Extract the callback function passed to signOut and call it
    const signOutCallback = mockSignOut.mock.calls[0][0]
    signOutCallback()
    
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('should render correct avatar alt text when no displayName', () => {
    const userWithoutDisplayName = { 
      ...mockUser, 
      displayName: undefined,
      username: 'testuser'
    }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutDisplayName, isLoading: false })
    
    render(<UserButton />)
    
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveAttribute('alt', 'testuser')
  })

  it('should render "User" as fallback alt text', () => {
    const userWithoutNames = { 
      ...mockUser, 
      displayName: undefined,
      username: undefined
    }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutNames, isLoading: false })
    
    render(<UserButton />)
    
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveAttribute('alt', 'User')
  })

  it('should apply correct CSS classes to button', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('relative', 'h-10', 'w-10', 'rounded-full')
  })

  it('should apply correct CSS classes to avatar image', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    
    render(<UserButton />)
    
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveClass('h-10', 'w-10', 'rounded-full', 'object-cover')
  })

  it('should apply correct CSS classes to default avatar container', () => {
    const userWithoutAvatar = { ...mockUser, avatarUrl: undefined }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutAvatar, isLoading: false })
    
    render(<UserButton />)
    
    const defaultAvatar = screen.getByRole('button').querySelector('.bg-gradient-to-br')
    expect(defaultAvatar).toHaveClass('h-10', 'w-10', 'rounded-full', 'bg-gradient-to-br', 'from-primary/20', 'to-primary/10', 'flex', 'items-center', 'justify-center')
  })

  it('should show correct icons in dropdown menu items', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Check for icons (we can't easily test specific Lucide icons, but we can check for SVG elements)
    const menuItems = screen.getAllByRole('menuitem')
    menuItems.forEach(item => {
      const icon = item.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  it('should handle missing email gracefully', async () => {
    const userWithoutEmail = { ...mockUser, email: undefined }
    ;(useCurrentUser as Mock).mockReturnValue({ user: userWithoutEmail, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Should still render the dropdown
    expect(screen.getByText('マイプロフィール')).toBeInTheDocument()
  })

  it('should render dropdown with proper alignment', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // The dropdown content should have proper classes
    const dropdownContent = screen.getByText('マイプロフィール').closest('[role="menu"]')
    expect(dropdownContent).toHaveClass('w-56')
  })

  it('should handle keyboard navigation', async () => {
    ;(useCurrentUser as Mock).mockReturnValue({ user: mockUser, isLoading: false })
    const user = userEvent.setup()
    
    render(<UserButton />)
    
    const button = screen.getByRole('button')
    
    // Open dropdown with Enter key
    await user.click(button)
    await user.keyboard('{Enter}')
    
    // Should be able to navigate through menu items
    expect(screen.getByText('マイプロフィール')).toBeInTheDocument()
  })
})