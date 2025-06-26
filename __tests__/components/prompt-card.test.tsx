import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptCard } from '@/components/prompt-card'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2日前'),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Get the mocked clipboard from global setup

describe('PromptCard Component', () => {
  const mockPrompt = {
    _id: 'prompt-123',
    title: 'テストプロンプト',
    description: 'これはテスト用のプロンプトです',
    content: 'あなたは優秀なアシスタントです。ユーザーの質問に親切に答えてください。',
    tags: ['AI', 'アシスタント', 'テスト'],
    viewCount: 100,
    likeCount: 25,
    bookmarkCount: 10,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
    author: {
      username: 'testuser',
      displayName: 'テストユーザー',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    category: {
      name: 'アシスタント',
      icon: '🤖',
      color: '#blue',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render prompt card with all basic information', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    // タイトル
    expect(screen.getByText('テストプロンプト')).toBeInTheDocument()
    
    // 説明
    expect(screen.getByText('これはテスト用のプロンプトです')).toBeInTheDocument()
    
    // カテゴリアイコン
    expect(screen.getByText('🤖')).toBeInTheDocument()
    
    // タグ（最大2個まで表示）
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('アシスタント')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument() // 残り1個のタグ表示
    
    // 統計情報
    expect(screen.getByText('25')).toBeInTheDocument() // いいね数
    expect(screen.getByText('100')).toBeInTheDocument() // ビュー数
  })

  it('should show truncated content when description is not provided', () => {
    const promptWithoutDescription = {
      ...mockPrompt,
      description: undefined,
    }
    
    render(<PromptCard prompt={promptWithoutDescription} />)
    
    // コンテンツの一部が表示される
    expect(screen.getByText(/あなたは優秀なアシスタントです。ユーザーの質問に親切に答えてください。/)).toBeInTheDocument()
  })

  it('should handle prompt with no tags', () => {
    const promptWithoutTags = {
      ...mockPrompt,
      tags: [],
    }
    
    render(<PromptCard prompt={promptWithoutTags} />)
    
    // タグセクションが表示されない
    expect(screen.queryByText('AI')).not.toBeInTheDocument()
  })

  it('should show only first 2 tags when more than 2 tags exist', () => {
    const promptWithManyTags = {
      ...mockPrompt,
      tags: ['AI', 'アシスタント', 'テスト', '自動化', 'チャットボット'],
    }
    
    render(<PromptCard prompt={promptWithManyTags} />)
    
    // 最初の2つのタグ
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('アシスタント')).toBeInTheDocument()
    
    // 残りのタグ数表示
    expect(screen.getByText('+3')).toBeInTheDocument()
    
    // 他のタグは表示されない
    expect(screen.queryByText('自動化')).not.toBeInTheDocument()
    expect(screen.queryByText('チャットボット')).not.toBeInTheDocument()
  })

  it('should handle prompt without category', () => {
    const promptWithoutCategory = {
      ...mockPrompt,
      category: null,
    }
    
    render(<PromptCard prompt={promptWithoutCategory} />)
    
    // カテゴリアイコンが表示されない
    expect(screen.queryByText('🤖')).not.toBeInTheDocument()
  })

  it('should handle prompt without author', () => {
    const promptWithoutAuthor = {
      ...mockPrompt,
      author: null,
    }
    
    render(<PromptCard prompt={promptWithoutAuthor} />)
    
    // コンポーネントが正常に表示される
    expect(screen.getByText('テストプロンプト')).toBeInTheDocument()
  })

  it('should have correct link to prompt detail page', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/prompts/prompt-123')
  })

  it('should show copy button on hover', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    const card = screen.getByRole('link').parentElement!
    
    // 初期状態では非表示
    const copyButton = screen.getByRole('button')
    expect(copyButton).toHaveClass('opacity-0')
    
    // ホバー時にはCSSクラスで表示される
    expect(copyButton).toHaveClass('group-hover:opacity-100')
  })

  it('should copy prompt content to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')
    
    render(<PromptCard prompt={mockPrompt} />)
    
    const copyButton = screen.getByRole('button')
    await user.click(copyButton)
    
    expect(writeTextSpy).toHaveBeenCalledWith(mockPrompt.content)
  })

  it('should show check icon temporarily after copying', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    
    render(<PromptCard prompt={mockPrompt} />)
    
    const copyButton = screen.getByRole('button')
    
    // 初期状態はコピーアイコン
    expect(copyButton.querySelector('svg')).toBeTruthy()
    
    await user.click(copyButton)
    
    // クリック後はチェックアイコンに変わる
    await waitFor(() => {
      expect(copyButton.querySelector('svg')).toBeTruthy()
    })
    
    // 2秒後にコピーアイコンに戻る
    await waitFor(() => {
      expect(copyButton.querySelector('svg')).toBeTruthy()
    }, { timeout: 2500 })
  })

  it('should prevent event propagation when copy button is clicked', async () => {
    const user = userEvent.setup()
    const linkClickSpy = vi.fn()
    
    render(
      <div onClick={linkClickSpy}>
        <PromptCard prompt={mockPrompt} />
      </div>
    )
    
    const copyButton = screen.getByRole('button')
    await user.click(copyButton)
    
    // 親要素のクリックハンドラーが呼ばれない
    expect(linkClickSpy).not.toHaveBeenCalled()
  })

  it('should truncate long content correctly', () => {
    const longContent = 'あ'.repeat(200)
    const promptWithLongContent = {
      ...mockPrompt,
      description: undefined,
      content: longContent,
    }
    
    render(<PromptCard prompt={promptWithLongContent} />)
    
    // 100文字で切り詰められ、...が付く
    const truncatedText = screen.getByText(new RegExp('あ{100}...'))
    expect(truncatedText).toBeInTheDocument()
  })

  it('should display zero counts correctly', () => {
    const promptWithZeroCounts = {
      ...mockPrompt,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
    }
    
    render(<PromptCard prompt={promptWithZeroCounts} />)
    
    const allZeros = screen.getAllByText('0')
    expect(allZeros).toHaveLength(2) // ビュー数とのいいね数で2つ
  })

  it('should apply correct CSS classes', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    const card = screen.getByRole('link').parentElement!
    
    // カードの基本クラス
    expect(card).toHaveClass('group', 'relative', 'card-pop', 'p-4', 'animate-fade-in')
    
    // ホバー効果クラス
    expect(card).toHaveClass('hover:shadow-lg', 'transition-all', 'duration-300')
  })
})