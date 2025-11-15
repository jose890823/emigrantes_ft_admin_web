import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should show a success toast', () => {
    const { toasts, success } = useToast()

    success('Success message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[0].title).toBe('Success message')
  })

  it('should show an error toast', () => {
    const { toasts, error } = useToast()

    error('Error message', 'Error description')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('error')
    expect(toasts.value[0].title).toBe('Error message')
    expect(toasts.value[0].description).toBe('Error description')
  })

  it('should remove toast after duration', () => {
    const { toasts, info } = useToast()

    info('Info message')
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(3000)
    expect(toasts.value).toHaveLength(0)
  })

  it('should manually remove toast', () => {
    const { toasts, showToast, removeToast } = useToast()

    const id = showToast({ title: 'Test', type: 'info' })
    expect(toasts.value).toHaveLength(1)

    removeToast(id)
    expect(toasts.value).toHaveLength(0)
  })
})
