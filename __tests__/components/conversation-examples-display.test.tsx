import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversationExamplesDisplay } from '@/components/conversation-examples-display'

describe('ConversationExamplesDisplay Component', () => {
  const mockExamples = [
    {
      id: '1',
      userMessage: 'こんにちは',
      characterResponse: 'こんにちは！今日はいい天気ですね。',
      scenario: '挨拶',
      isHighlighted: true,
    },
    {
      id: '2',
      userMessage: 'お元気ですか？',
      characterResponse: 'はい、とても元気です。ありがとうございます。',
      scenario: '日常会話',
      isHighlighted: false,
    },
    {
      id: '3',
      userMessage: '今日の予定は？',
      characterResponse: '今日は買い物に行く予定です。',
      isHighlighted: false,
    },
  ]

  it('should render null when no examples are provided', () => {
    const { container } = render(<ConversationExamplesDisplay examples={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render null when examples is null/undefined', () => {
    const { container } = render(<ConversationExamplesDisplay examples={null as any} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render conversation examples with title and count', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    expect(screen.getByText('会話例')).toBeInTheDocument()
    expect(screen.getByText('3個')).toBeInTheDocument()
  })

  it('should display all conversation examples', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    // User messages
    expect(screen.getByText('こんにちは')).toBeInTheDocument()
    expect(screen.getByText('お元気ですか？')).toBeInTheDocument()
    expect(screen.getByText('今日の予定は？')).toBeInTheDocument()
    
    // Character responses
    expect(screen.getByText('こんにちは！今日はいい天気ですね。')).toBeInTheDocument()
    expect(screen.getByText('はい、とても元気です。ありがとうございます。')).toBeInTheDocument()
    expect(screen.getByText('今日は買い物に行く予定です。')).toBeInTheDocument()
  })

  it('should show scenario badges when showScenarios is true', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} showScenarios={true} />)
    
    expect(screen.getByText('挨拶')).toBeInTheDocument()
    expect(screen.getByText('日常会話')).toBeInTheDocument()
  })

  it('should hide scenario badges when showScenarios is false', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} showScenarios={false} />)
    
    expect(screen.queryByText('挨拶')).not.toBeInTheDocument()
    expect(screen.queryByText('日常会話')).not.toBeInTheDocument()
  })

  it('should show scenario badges by default', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    expect(screen.getByText('挨拶')).toBeInTheDocument()
    expect(screen.getByText('日常会話')).toBeInTheDocument()
  })

  it('should highlight recommended examples', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    const recommendedBadge = screen.getByText('おすすめ')
    expect(recommendedBadge).toBeInTheDocument()
    
    // Check if the highlighted example has special styling by finding the conversation card container
    const highlightedCard = screen.getByText('こんにちは').closest('.space-y-3')?.parentElement
    expect(highlightedCard).toHaveClass('ring-2', 'ring-primary/30', 'border-primary/50')
  })

  it('should limit displayed examples when maxDisplay is set', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} maxDisplay={2} />)
    
    // Should show first 2 examples
    expect(screen.getByText('こんにちは')).toBeInTheDocument()
    expect(screen.getByText('お元気ですか？')).toBeInTheDocument()
    
    // Should not show the third example
    expect(screen.queryByText('今日の予定は？')).not.toBeInTheDocument()
    
    // Should show "more" message
    expect(screen.getByText('他に 1 個の会話例があります')).toBeInTheDocument()
  })

  it('should not show "more" message when all examples are displayed', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} maxDisplay={5} />)
    
    expect(screen.queryByText(/他に.*個の会話例があります/)).not.toBeInTheDocument()
  })

  it('should show help text at the bottom', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    expect(screen.getByText('💡 これらの会話例を参考に、あなただけの会話を楽しんでください！')).toBeInTheDocument()
  })

  it('should handle examples without scenarios', () => {
    const examplesWithoutScenarios = [
      {
        id: '1',
        userMessage: 'テストメッセージ',
        characterResponse: 'テストレスポンス',
        isHighlighted: false,
      },
    ]
    
    render(<ConversationExamplesDisplay examples={examplesWithoutScenarios} />)
    
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
    expect(screen.getByText('テストレスポンス')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <ConversationExamplesDisplay 
        examples={mockExamples} 
        className="custom-class" 
      />
    )
    
    const container = screen.getByText('会話例').closest('div')?.parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('should render correct message and bot icons', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    // We can't easily test for specific lucide icons, but we can check the structure
    const userMessages = screen.getAllByText(/こんにちは|お元気ですか？|今日の予定は？/)
    const characterResponses = screen.getAllByText(/こんにちは！今日はいい天気ですね。|はい、とても元気です。|今日は買い物に行く予定です。/)
    
    expect(userMessages).toHaveLength(3)
    expect(characterResponses).toHaveLength(3)
    
    // Check for proper icon containers - each conversation has user and bot icons
    const conversationContainers = screen.getAllByText(/こんにちは|お元気ですか？|今日の予定は？/)
    expect(conversationContainers).toHaveLength(3)
  })

  it('should handle single example correctly', () => {
    const singleExample = [mockExamples[0]]
    
    render(<ConversationExamplesDisplay examples={singleExample} />)
    
    expect(screen.getByText('会話例')).toBeInTheDocument()
    expect(screen.getByText('1個')).toBeInTheDocument()
    expect(screen.getByText('こんにちは')).toBeInTheDocument()
    expect(screen.getByText('こんにちは！今日はいい天気ですね。')).toBeInTheDocument()
  })

  it('should not show recommended badge for non-highlighted examples', () => {
    const nonHighlightedExample = [
      {
        id: '1',
        userMessage: 'テスト',
        characterResponse: 'レスポンス',
        isHighlighted: false,
      },
    ]
    
    render(<ConversationExamplesDisplay examples={nonHighlightedExample} />)
    
    expect(screen.queryByText('おすすめ')).not.toBeInTheDocument()
  })

  it('should handle maxDisplay edge cases', () => {
    // maxDisplay = 0
    render(<ConversationExamplesDisplay examples={mockExamples} maxDisplay={0} />)
    
    // Should show title and "more" message but no individual examples
    expect(screen.getByText('会話例')).toBeInTheDocument()
    expect(screen.getByText('3個')).toBeInTheDocument()
    
    // Should not show individual conversation examples
    expect(screen.queryByText('こんにちは')).not.toBeInTheDocument()
    
    // Should show "more" message
    expect(screen.getByText('他に 3 個の会話例があります')).toBeInTheDocument()
  })

  it('should handle empty string messages', () => {
    const exampleWithEmptyStrings = [
      {
        id: '1',
        userMessage: '',
        characterResponse: '',
        isHighlighted: false,
      },
    ]
    
    render(<ConversationExamplesDisplay examples={exampleWithEmptyStrings} />)
    
    expect(screen.getByText('会話例')).toBeInTheDocument()
    expect(screen.getByText('1個')).toBeInTheDocument()
  })

  it('should render with proper structure and styling classes', () => {
    render(<ConversationExamplesDisplay examples={mockExamples} />)
    
    // Check for proper structure
    const titleSection = screen.getByText('会話例').closest('div')
    expect(titleSection).toHaveClass('flex', 'items-center', 'gap-2', 'mb-4')
    
    // Check for conversation structure
    const conversations = screen.getAllByText(/こんにちは|お元気ですか？|今日の予定は？/)
    conversations.forEach(conversation => {
      const conversationCard = conversation.closest('div')
      // Should have proper card styling
      expect(conversationCard?.classList.toString()).toMatch(/rounded-lg|border|bg-card|p-4/)
    })
  })

  it('should handle very long messages', () => {
    const longMessageExample = [
      {
        id: '1',
        userMessage: 'これは非常に長いメッセージです。'.repeat(10),
        characterResponse: 'これは非常に長いレスポンスです。'.repeat(10),
        isHighlighted: false,
      },
    ]
    
    render(<ConversationExamplesDisplay examples={longMessageExample} />)
    
    expect(screen.getByText(/これは非常に長いメッセージです。/)).toBeInTheDocument()
    expect(screen.getByText(/これは非常に長いレスポンスです。/)).toBeInTheDocument()
  })
})