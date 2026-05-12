// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DropZone } from '@/components/upload/DropZone'
import { FileQueue } from '@/components/upload/FileQueue'
import { PWARegistration } from '@/components/pwa/PWARegistration'

let dndContextProps: {
  onDragStart?: (event: unknown) => void
  onDragEnd?: (event: unknown) => void
} | null = null

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, ...props }: { children: React.ReactNode }) => {
    dndContextProps = props
    return <>{children}</>
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  MouseSensor: class MouseSensor {},
  TouchSensor: class TouchSensor {},
  useSensor: vi.fn((sensor, options) => ({ sensor, options })),
  useSensors: vi.fn((...sensors) => sensors),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: ({ id }: { id: string }) => ({
    attributes: { 'data-sortable-id': id },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: 'verticalListSortingStrategy',
  arrayMove: <T,>(array: T[], from: number, to: number) => {
    const next = [...array]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  },
}))

vi.mock('framer-motion', () => {
  const passthrough = (tag: string) =>
    function MotionComponent({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
      return React.createElement(tag as React.ElementType, props, children)
    }

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: { div: passthrough('div') },
    useReducedMotion: () => false,
  }
})

vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}))

describe('upload e PWA', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    vi.clearAllMocks()
    dndContextProps = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve validar arquivos no DropZone e permitir abertura por teclado', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)

    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /ARRASTE OU CLIQUE/i }))
    expect(clickSpy).toHaveBeenCalled()

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['abc'], 'arquivo.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { configurable: true, value: [file] })
    fireEvent.change(input)

    expect(onDrop).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('Arquivo inválido para esta ferramenta. Selecione um tipo compatível.')

    clickSpy.mockRestore()
  })

  it('deve abrir o seletor ao usar teclado e exibir feedback de arquivo grande', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)

    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        maxSize={1024 * 1024}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const zone = container.querySelector('[role="button"]') as HTMLDivElement
    fireEvent.keyDown(zone, { key: 'Enter' })
    fireEvent.keyDown(zone, { key: ' ' })

    expect(clickSpy).toHaveBeenCalledTimes(2)

    const oversized = new File([new Uint8Array(1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' })
    fireEvent.drop(zone, { dataTransfer: { files: [oversized] } })

    expect(onDrop).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('Arquivo muito grande. Limite: 1MB.')

    clickSpy.mockRestore()
  })

  it('deve aceitar drop misto e avisar quando parte dos arquivos é ignorada', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple
        maxSize={1024}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const zone = container.querySelector('[role="button"]') as HTMLDivElement
    const good = new File([new Uint8Array([1, 2, 3])], 'bom.pdf', { type: 'application/pdf' })
    const oversized = new File([new Uint8Array(2048)], 'grande.pdf', { type: 'application/pdf' })
    const unsupported = new File(['x'], 'ruim.txt', { type: 'text/plain' })

    fireEvent.drop(zone, { dataTransfer: { files: [good, oversized, unsupported] } })

    expect(onDrop).toHaveBeenCalledWith([good])
    expect(onError).toHaveBeenCalledWith('Alguns arquivos foram ignorados por tipo ou tamanho.')
  })

  it('deve aceitar arquivos válidos e mostrar feedback', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        maxSize={1024}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'arquivo.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { configurable: true, value: [file] })
    fireEvent.change(input)

    expect(onDrop).toHaveBeenCalledWith([file])
  })

  it('deve ignorar a zona desabilitada e não abrir o seletor', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)

    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        disabled
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const zone = container.querySelector('[role="button"]') as HTMLDivElement
    expect(zone.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(zone)
    fireEvent.keyDown(zone, { key: 'Enter' })

    expect(clickSpy).not.toHaveBeenCalled()
    expect(onDrop).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    clickSpy.mockRestore()
  })

  it('deve processar múltiplos arquivos com feedback de ignorados', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple
        maxSize={10}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const good = new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d])], 'bom.pdf', { type: 'application/pdf' })
    const oversized = new File([new Uint8Array(20)], 'grande.pdf', { type: 'application/pdf' })
    const unsupported = new File(['x'], 'ruim.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { configurable: true, value: [good, oversized, unsupported] })

    fireEvent.change(input)

    expect(onDrop).toHaveBeenCalledWith([good])
    expect(onError).toHaveBeenCalledWith('Alguns arquivos foram ignorados por tipo ou tamanho.')
  })

  it('deve mostrar arraste e rejeitar quando nada é aceito', () => {
    const onDrop = vi.fn()
    const onError = vi.fn()
    const { container } = render(
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        maxSize={10}
        onDrop={onDrop}
        onError={onError}
      />,
    )

    const zone = container.querySelector('[role="button"]') as HTMLDivElement
    fireEvent.dragOver(zone)
    expect(screen.getByText(/SOLTE AQUI/i)).toBeTruthy()
    fireEvent.dragLeave(zone)
    expect(screen.getByText(/ARRASTE OU CLIQUE/i)).toBeTruthy()

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const oversized = new File([new Uint8Array(100)], 'grande.pdf', { type: 'application/pdf' })
    const unsupported = new File(['x'], 'ruim.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { configurable: true, value: [oversized, unsupported] })
    fireEvent.change(input)

    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/Arquivo muito grande.*incompatíveis/i))
  })

  it('deve renderizar fila de arquivos, mover para baixo e desfazer remoção', () => {
    const files = [
      { id: '1', file: new File(['a'], 'um.pdf', { type: 'application/pdf' }) },
      { id: '2', file: new File(['b'], 'dois.pdf', { type: 'application/pdf' }) },
    ]
    const onReorder = vi.fn()
    const onRemove = vi.fn()

    render(<FileQueue files={files} onReorder={onReorder} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /Mover um.pdf para baixo/i }))
    expect(onReorder).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Remover um.pdf/i }))
    expect(onRemove).toHaveBeenCalledWith('1')
    expect(screen.getByRole('button', { name: /Desfazer/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Desfazer/i }))
    expect(onReorder).toHaveBeenCalledTimes(2)
  })

  it('deve mover um item para cima pela fila', () => {
    const files = [
      { id: '1', file: new File(['a'], 'um.pdf', { type: 'application/pdf' }) },
      { id: '2', file: new File(['b'], 'dois.pdf', { type: 'application/pdf' }) },
    ]
    const onReorder = vi.fn()
    const onRemove = vi.fn()

    render(<FileQueue files={files} onReorder={onReorder} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /Mover dois.pdf para cima/i }))

    expect(onReorder).toHaveBeenCalledWith([
      { id: '2', file: files[1].file },
      { id: '1', file: files[0].file },
    ])
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('deve reagir ao drag and drop e atualizar o overlay da fila', () => {
    const files = [
      { id: '1', file: new File(['a'], 'um.pdf', { type: 'application/pdf' }) },
      { id: '2', file: new File(['b'], 'dois.pdf', { type: 'application/pdf' }) },
    ]
    const onReorder = vi.fn()
    const onRemove = vi.fn()

    render(<FileQueue files={files} onReorder={onReorder} onRemove={onRemove} />)

    act(() => {
      dndContextProps?.onDragStart?.({ active: { id: '1' } })
    })

    expect(screen.getAllByText('um.pdf')).toHaveLength(2)

    act(() => {
      dndContextProps?.onDragEnd?.({ active: { id: '1' }, over: { id: '2' } })
    })

    expect(onReorder).toHaveBeenCalledWith([
      { id: '2', file: files[1].file },
      { id: '1', file: files[0].file },
    ])

    act(() => {
      dndContextProps?.onDragEnd?.({ active: { id: '1' }, over: { id: '1' } })
    })

    expect(onReorder).toHaveBeenCalledTimes(1)
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('deve retornar null quando a fila está vazia', () => {
    const { container } = render(<FileQueue files={[]} onReorder={vi.fn()} onRemove={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('deve registrar service worker quando permitido', async () => {
    const register = vi.fn().mockResolvedValue({ scope: '/' })
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      hostname: 'example.com',
    } as Location)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    const addEventListener = vi.spyOn(window, 'addEventListener')
    render(<PWARegistration />)
    await act(async () => {
      await Promise.resolve()
    })
    const loadHandler = addEventListener.mock.calls.find(([type]) => type === 'load')?.[1] as (() => void) | undefined
    expect(loadHandler).toBeTypeOf('function')

    await act(async () => {
      loadHandler?.()
      await Promise.resolve()
    })

    expect(register).toHaveBeenCalledWith('/sw.js')
    locationSpy.mockRestore()
  })

})
