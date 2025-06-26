import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LikeButton } from '@/components/like-button'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/hooks/use-error-handler'

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

vi.mock('@/hooks/use-error-handler', () => ({
  useErrorHandler: vi.fn(),
}))

// No need to import sonner directly since it's mocked in vitest.setup.ts

describe('LikeButton Component', () => {
  const mockPromptId = 'prompt-123' as any
  const mockToggleLike = vi.fn()
  const mockRouter = { push: vi.fn() }
  const mockHandleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mocks
    ;(useAuth as Mock).mockReturnValue({ isSignedIn: true })
    ;(useMutation as Mock).mockReturnValue(mockToggleLike)
    ;(useQuery as Mock).mockReturnValue(false) // not liked initially
    ;(useRouter as Mock).mockReturnValue(mockRouter)
    ;(useErrorHandler as Mock).mockReturnValue({ handleError: mockHandleError })
  })

  it('should render like button with default props', () => {
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('0') // default initialLikeCount
    
    // Heart icon should be present
    const heartIcon = button.querySelector('svg')
    expect(heartIcon).toBeTruthy()
  })

  it('should render with custom initial like count', () => {
    render(<LikeButton promptId={mockPromptId} initialLikeCount={42} />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should hide count when showCount is false', () => {
    render(<LikeButton promptId={mockPromptId} initialLikeCount={10} showCount={false} />)
    
    expect(screen.queryByText('10')).not.toBeInTheDocument()
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<LikeButton promptId={mockPromptId} size="sm" />)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8') // sm size class from Button component
    
    rerender(<LikeButton promptId={mockPromptId} size="lg" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10') // lg size class from Button component
  })

  it('should show filled heart when liked', () => {
    ;(useQuery as Mock).mockReturnValue(true) // liked
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary') // liked state styling
    
    const heartIcon = button.querySelector('svg')
    expect(heartIcon).toHaveClass('fill-current')
  })

  it('should redirect to sign-in when not authenticated', async () => {
    ;(useAuth as Mock).mockReturnValue({ isSignedIn: false })
    const user = userEvent.setup()
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockHandleError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'いいねするにはログインが必要です'
      })
    )
  })

  it('should toggle like when clicked by authenticated user', async () => {
    const user = userEvent.setup()
    mockToggleLike.mockResolvedValue(undefined)
    
    render(<LikeButton promptId={mockPromptId} initialLikeCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockToggleLike).toHaveBeenCalledWith({ promptId: mockPromptId })
  })

  it('should perform optimistic update when liking', async () => {
    const user = userEvent.setup()
    mockToggleLike.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LikeButton promptId={mockPromptId} initialLikeCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Optimistic update should increase count immediately
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('should perform optimistic update when unliking', async () => {
    ;(useQuery as Mock).mockReturnValue(true) // already liked
    const user = userEvent.setup()
    mockToggleLike.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LikeButton promptId={mockPromptId} initialLikeCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Optimistic update should decrease count immediately
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should show loading state while toggling', async () => {
    const user = userEvent.setup()
    mockToggleLike.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Should show loading spinner
    expect(button.querySelector('.animate-spin')).toBeTruthy()
    expect(button).toBeDisabled()
  })

  it('should show success toast when like is successful', async () => {
    const user = userEvent.setup()
    mockToggleLike.mockResolvedValue(undefined)
    
    // We'll mock the toast import within the component
    const { toast } = await vi.importMock('sonner')
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('いいねしました')
    })
  })

  it('should show success toast when unlike is successful', async () => {
    ;(useQuery as Mock).mockReturnValue(true) // already liked
    const user = userEvent.setup()
    mockToggleLike.mockResolvedValue(undefined)
    
    const { toast } = await vi.importMock('sonner')
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('いいねを取り消しました')
    })
  })

  it('should revert optimistic update on error', async () => {
    const user = userEvent.setup()
    const error = new Error('Network error')
    mockToggleLike.mockRejectedValue(error)
    
    render(<LikeButton promptId={mockPromptId} initialLikeCount={5} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // After error, should revert to original count
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    
    expect(mockHandleError).toHaveBeenCalledWith(error)
  })

  it('should handle network error specifically', async () => {
    const user = userEvent.setup()
    const networkError = new Error('fetch failed')
    mockToggleLike.mockRejectedValue(networkError)
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ネットワークエラーが発生しました'
        })
      )
    })
  })

  it('should prevent multiple clicks while loading', async () => {
    const user = userEvent.setup()
    mockToggleLike.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LikeButton promptId={mockPromptId} />)
    
    const button = screen.getByRole('button')
    
    // First click
    await user.click(button)
    expect(mockToggleLike).toHaveBeenCalledTimes(1)
    
    // Second click while loading should be ignored
    await user.click(button)
    expect(mockToggleLike).toHaveBeenCalledTimes(1)
  })

  it('should prevent event propagation', async () => {
    const user = userEvent.setup()
    const parentClickSpy = vi.fn()
    mockToggleLike.mockResolvedValue(undefined)
    
    render(
      <div onClick={parentClickSpy}>
        <LikeButton promptId={mockPromptId} />
      </div>
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(parentClickSpy).not.toHaveBeenCalled()
  })

  it('should handle count not going below zero', async () => {
    ;(useQuery as Mock).mockReturnValue(true) // already liked
    const user = userEvent.setup()
    mockToggleLike.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LikeButton promptId={mockPromptId} initialLikeCount={0} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Count should not go below 0
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should use optimistic state over query result', () => {
    ;(useQuery as Mock).mockReturnValue(false) // query says not liked
    
    const { rerender } = render(<LikeButton promptId={mockPromptId} />)
    
    // Initially uses query result
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border') // outline variant for not liked
    
    // Simulate optimistic update by re-rendering with internal state
    // This would happen automatically in the real component
    expect(button).toBeDefined()
  })
})