import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagInput } from '@/components/tag-input'

describe('TagInput Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render input field with default placeholder', () => {
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    expect(input).toBeInTheDocument()
  })

  it('should render input field with custom placeholder', () => {
    render(
      <TagInput 
        value={[]} 
        onChange={mockOnChange} 
        placeholder="カスタムプレースホルダー" 
      />
    )
    
    const input = screen.getByPlaceholderText('カスタムプレースホルダー')
    expect(input).toBeInTheDocument()
  })

  it('should display existing tags', () => {
    const existingTags = ['react', 'typescript', 'testing']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} />)
    
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
  })

  it('should add tag when Enter key is pressed', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, 'newtag')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).toHaveBeenCalledWith(['newtag'])
  })

  it('should add tag with trimmed and lowercase text', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, '  NewTag  ')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).toHaveBeenCalledWith(['newtag'])
  })

  it('should not add empty tags', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, '   ')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should not add duplicate tags', async () => {
    const user = userEvent.setup()
    const existingTags = ['react']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, 'react')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should clear input after adding tag', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, 'newtag')
    await user.keyboard('{Enter}')
    
    expect(input).toHaveValue('')
  })

  it('should remove tag when remove button is clicked', async () => {
    const user = userEvent.setup()
    const existingTags = ['react', 'typescript']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} />)
    
    // Find the remove button for 'react' tag
    const reactTag = screen.getByText('react').closest('.gap-1')
    const removeButton = reactTag?.querySelector('button')
    
    expect(removeButton).toBeInTheDocument()
    await user.click(removeButton!)
    
    expect(mockOnChange).toHaveBeenCalledWith(['typescript'])
  })

  it('should respect maxTags limit', async () => {
    const user = userEvent.setup()
    const existingTags = ['tag1', 'tag2']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} maxTags={2} />)
    
    const input = screen.getByPlaceholderText('最大2個まで')
    expect(input).toBeDisabled()
    
    await user.type(input, 'tag3')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should show max tags placeholder when limit is reached', () => {
    const existingTags = ['tag1', 'tag2', 'tag3']
    
    render(
      <TagInput 
        value={existingTags} 
        onChange={mockOnChange} 
        maxTags={3}
        placeholder="タグを追加"
      />
    )
    
    const input = screen.getByPlaceholderText('最大3個まで')
    expect(input).toBeInTheDocument()
    expect(input).toBeDisabled()
  })

  it('should not show tags section when no tags exist', () => {
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    expect(screen.queryByText('react')).not.toBeInTheDocument()
    // Tags container should not be present
    expect(screen.queryByText('+')).not.toBeInTheDocument()
  })

  it('should handle different maxTags values', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <TagInput value={[]} onChange={mockOnChange} maxTags={1} />
    )
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, 'tag1')
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).toHaveBeenCalledWith(['tag1'])
    
    // Re-render with the tag added and try to add another
    rerender(
      <TagInput value={['tag1']} onChange={mockOnChange} maxTags={1} />
    )
    
    const disabledInput = screen.getByPlaceholderText('最大1個まで')
    expect(disabledInput).toBeDisabled()
  })

  it('should prevent form submission when Enter is pressed', async () => {
    const user = userEvent.setup()
    const formSubmitSpy = vi.fn()
    
    render(
      <form onSubmit={formSubmitSpy}>
        <TagInput value={[]} onChange={mockOnChange} />
      </form>
    )
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, 'newtag')
    await user.keyboard('{Enter}')
    
    expect(formSubmitSpy).not.toHaveBeenCalled()
  })

  it('should handle keyboard navigation correctly', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    
    // Type some text
    await user.type(input, 'newtag')
    
    // Press other keys that shouldn't trigger tag addition
    await user.keyboard('{ArrowLeft}')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Backspace}')
    
    expect(mockOnChange).not.toHaveBeenCalled()
    
    // Enter should still work
    await user.keyboard('{Enter}')
    expect(mockOnChange).toHaveBeenCalledWith(['newta']) // missing 'g' due to backspace
  })

  it('should update input value as user types', async () => {
    const user = userEvent.setup()
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    
    await user.type(input, 'typing')
    expect(input).toHaveValue('typing')
    
    await user.clear(input)
    expect(input).toHaveValue('')
  })

  it('should apply correct CSS classes to tags', () => {
    const existingTags = ['react', 'typescript']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} />)
    
    const reactTag = screen.getByText('react')
    const tagElement = reactTag.closest('.gap-1')
    
    expect(tagElement).toHaveClass('gap-1', 'pr-1')
    expect(reactTag.closest('.gap-1')).toHaveClass('gap-1')
  })

  it('should handle remove button hover states', async () => {
    const user = userEvent.setup()
    const existingTags = ['react']
    
    render(<TagInput value={existingTags} onChange={mockOnChange} />)
    
    const removeButton = screen.getByRole('button')
    expect(removeButton).toHaveClass('hover:bg-secondary')
    
    await user.hover(removeButton)
    // CSS hover states are handled by CSS, not testable in jsdom
    // But we can verify the class is present
    expect(removeButton).toHaveClass('hover:bg-secondary')
  })

  it('should handle edge case with maxTags=0', () => {
    render(<TagInput value={[]} onChange={mockOnChange} maxTags={0} />)
    
    const input = screen.getByPlaceholderText('最大0個まで')
    expect(input).toBeDisabled()
  })

  it('should handle very long tag names', async () => {
    const user = userEvent.setup()
    const longTag = 'a'.repeat(100)
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, longTag)
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).toHaveBeenCalledWith([longTag])
  })

  it('should handle special characters in tags', async () => {
    const user = userEvent.setup()
    const specialTag = 'react-native@2.0'
    
    render(<TagInput value={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('タグを入力してEnterで追加')
    await user.type(input, specialTag)
    await user.keyboard('{Enter}')
    
    expect(mockOnChange).toHaveBeenCalledWith([specialTag.toLowerCase()])
  })
})