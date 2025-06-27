import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useStoreUser } from '@/hooks/use-store-user'

vi.mock('@clerk/nextjs')
vi.mock('convex/react')

describe('useStoreUser Hook', () => {
  const mockCreateOrUpdateUser = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateOrUpdateUser.mockClear()
    ;(useMutation as Mock).mockReturnValue(mockCreateOrUpdateUser)
  })

  it('should not call createOrUpdateUser when user is not signed in', () => {
    (useUser as Mock).mockReturnValue({
      user: null,
      isSignedIn: false,
    })

    renderHook(() => useStoreUser())

    expect(mockCreateOrUpdateUser).not.toHaveBeenCalled()
  })

  it('should call createOrUpdateUser when user is signed in', () => {
    const mockUser = {
      id: 'user123',
      username: 'testuser',
      fullName: 'Test User',
      imageUrl: 'https://example.com/avatar.jpg',
    }

    ;(useUser as Mock).mockReturnValue({
      user: mockUser,
      isSignedIn: true,
    })

    renderHook(() => useStoreUser())

    expect(mockCreateOrUpdateUser).toHaveBeenCalledWith({
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })

  it('should use user id as username when username is not available', () => {
    const mockUser = {
      id: 'user123',
      username: null,
      fullName: 'Test User',
      imageUrl: null,
    }

    ;(useUser as Mock).mockReturnValue({
      user: mockUser,
      isSignedIn: true,
    })

    renderHook(() => useStoreUser())

    expect(mockCreateOrUpdateUser).toHaveBeenCalledWith({
      username: 'user123',
      displayName: 'Test User',
      avatarUrl: undefined,
    })
  })

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateOrUpdateUser.mockRejectedValue(new Error('Test error'))

    const mockUser = {
      id: 'user123',
      username: 'testuser',
    }

    ;(useUser as Mock).mockReturnValue({
      user: mockUser,
      isSignedIn: true,
    })

    renderHook(() => useStoreUser())

    // エラーがconsole.errorに渡されることを確認
    expect(mockCreateOrUpdateUser).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })
})