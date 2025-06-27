import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkButton } from '@/components/bookmark-button'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('BookmarkButton Component', () => {
  const mockPromptId = 'prompt-123' as any
  const mockToggleBookmark = vi.fn()
  const mockRouter = { push: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mocks
    ;(useAuth as Mock).mockReturnValue({ isSignedIn: true })
    ;(useMutation as Mock).mockReturnValue(mockToggleBookmark)
    ;(useQuery as Mock).mockReturnValue(false) // not bookmarked initially
    ;(useRouter as Mock).mockReturnValue(mockRouter)
  })

  it('should render bookmark button with default props', () => {
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('0') // default initialBookmarkCount
    
    // Bookmark icon should be present
    const bookmarkIcon = button.querySelector('svg')
    expect(bookmarkIcon).toBeTruthy()
  })

  it('should render with custom initial bookmark count', () => {
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={15} />)
    
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should hide count when showCount is false', () => {
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={10} showCount={false} />)
    
    expect(screen.queryByText('10')).not.toBeInTheDocument()
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<BookmarkButton promptId={mockPromptId} size="sm" />)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8') // sm size class from Button component
    
    rerender(<BookmarkButton promptId={mockPromptId} size="lg" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10') // lg size class from Button component
  })

  it('should show filled bookmark when bookmarked', () => {
    ;(useQuery as Mock).mockReturnValue(true) // bookmarked
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary') // bookmarked state styling
    
    const bookmarkIcon = button.querySelector('svg')
    expect(bookmarkIcon).toHaveClass('fill-current')
  })

  it('should show outline bookmark when not bookmarked', () => {
    ;(useQuery as Mock).mockReturnValue(false) // not bookmarked
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border') // outline variant styling
    
    const bookmarkIcon = button.querySelector('svg')
    expect(bookmarkIcon).not.toHaveClass('fill-current')
  })

  it('should redirect to sign-in when not authenticated', async () => {
    ;(useAuth as Mock).mockReturnValue({ isSignedIn: false })
    const user = userEvent.setup()
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/sign-in')
    expect(mockToggleBookmark).not.toHaveBeenCalled()
  })

  it('should toggle bookmark when clicked by authenticated user', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)
    
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockToggleBookmark).toHaveBeenCalledWith({ promptId: mockPromptId })
  })

  it('should perform optimistic update when bookmarking', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Optimistic update should increase count immediately
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('should perform optimistic update when unbookmarking', async () => {
    ;(useQuery as Mock).mockReturnValue(true) // already bookmarked
    const user = userEvent.setup()
    mockToggleBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Optimistic update should decrease count immediately
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should show loading state while toggling', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Should show loading spinner
    expect(button.querySelector('.animate-spin')).toBeTruthy()
    expect(button).toBeDisabled()
  })

  it('should revert optimistic update on error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    const error = new Error('Network error')
    
    // Make the mutation fail after a short delay to see optimistic update first
    mockToggleBookmark.mockImplementation(() => 
      new Promise((_, reject) => setTimeout(() => reject(error), 50))
    )
    
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Wait for error and revert
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle bookmark:', error)
    consoleSpy.mockRestore()
  })

  it('should prevent multiple clicks while loading', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    
    // First click
    await user.click(button)
    expect(mockToggleBookmark).toHaveBeenCalledTimes(1)
    
    // Second click while loading should be ignored
    await user.click(button)
    expect(mockToggleBookmark).toHaveBeenCalledTimes(1)
  })

  it('should prevent event propagation', async () => {
    const user = userEvent.setup()
    const parentClickSpy = vi.fn()
    mockToggleBookmark.mockResolvedValue(undefined)
    
    render(
      <div onClick={parentClickSpy}>
        <BookmarkButton promptId={mockPromptId} />
      </div>
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(parentClickSpy).not.toHaveBeenCalled()
  })

  it('should handle count not going below zero', async () => {
    ;(useQuery as Mock).mockReturnValue(true) // already bookmarked
    const user = userEvent.setup()
    mockToggleBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<BookmarkButton promptId={mockPromptId} initialBookmarkCount={0} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Count should not go below 0
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should use optimistic state over query result when available', () => {
    ;(useQuery as Mock).mockReturnValue(false) // query says not bookmarked
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    // Initially uses query result - outline variant
    expect(button).toHaveClass('border')
  })

  it('should handle various button sizes correctly', () => {
    const { rerender } = render(<BookmarkButton promptId={mockPromptId} size="default" />)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-9') // default size
    
    rerender(<BookmarkButton promptId={mockPromptId} size="sm" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-8') // small size
    
    rerender(<BookmarkButton promptId={mockPromptId} size="lg" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10') // large size
  })

  it('should maintain correct icon classes', () => {
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    
    expect(icon).toHaveClass('h-4', 'w-4', 'transition-all')
  })

  it('should reset loading state after successful operation', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)
    
    render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Should not be disabled after operation completes
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
    
    // Should not show loading spinner
    expect(button.querySelector('.animate-spin')).toBeFalsy()
  })

  it('should apply correct CSS classes for different states', () => {
    const { rerender } = render(<BookmarkButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    
    // Base classes
    expect(button).toHaveClass('gap-1.5', 'transition-all')
    
    // Not bookmarked state
    expect(button).toHaveClass('border') // outline variant
    
    // Bookmarked state
    ;(useQuery as Mock).mockReturnValue(true)
    rerender(<BookmarkButton promptId={mockPromptId} />)
    
    expect(button).toHaveClass('bg-primary') // default variant
    expect(button).toHaveClass('text-white') // bookmarked text color
  })
})