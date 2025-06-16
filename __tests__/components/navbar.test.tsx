import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@clerk/nextjs'

vi.mock('@clerk/nextjs')

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render logo and navigation links', () => {
    (useAuth as Mock).mockReturnValue({ isSignedIn: false })
    
    render(<Navbar />)
    
    expect(screen.getByText('Character Bank')).toBeInTheDocument()
    expect(screen.getByText('探索')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  describe('when user is not signed in', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({ isSignedIn: false })
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
      (useAuth as jest.Mock).mockReturnValue({ isSignedIn: true })
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
    (useAuth as Mock).mockReturnValue({ isSignedIn: false })
    
    render(<Navbar />)
    
    const homeLink = screen.getByRole('link', { name: 'Character Bank' })
    expect(homeLink).toHaveAttribute('href', '/')
    
    const exploreLink = screen.getByRole('link', { name: '探索' })
    expect(exploreLink).toHaveAttribute('href', '/explore')
    
    const categoriesLink = screen.getByRole('link', { name: 'カテゴリ' })
    expect(categoriesLink).toHaveAttribute('href', '/categories')
  })
})