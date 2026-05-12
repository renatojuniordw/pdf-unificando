import { describe, expect, it, vi } from 'vitest'
import { logError, logInfo, logWarn } from '@/lib/utils/logger'

describe('lib/utils/logger', () => {
  it('deve emitir JSON estruturado em info e warn', () => {
    const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    logInfo('Test', 'Mensagem', { requestId: 'abc' })
    logWarn('Test', 'Aviso', { requestId: 'xyz' })

    expect(JSON.parse(infoSpy.mock.calls[0][0] as string)).toMatchObject({
      level: 'info',
      scope: 'Test',
      message: 'Mensagem',
      requestId: 'abc',
    })
    expect(JSON.parse(warnSpy.mock.calls[0][0] as string)).toMatchObject({
      level: 'warn',
      scope: 'Test',
      message: 'Aviso',
      requestId: 'xyz',
    })
  })

  it('deve serializar erros em formato JSON', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test', new Error('Falha'), { requestId: '123' })

    expect(JSON.parse(errorSpy.mock.calls[0][0] as string)).toMatchObject({
      level: 'error',
      scope: 'Test',
      requestId: '123',
      error: {
        name: 'Error',
        message: 'Falha',
      },
    })
  })
})
