import { describe, it, expect } from 'vitest'
import { parsePageRange, parseOrder } from '@/lib/utils/file'

describe('lib/utils/file', () => {
  describe('parsePageRange', () => {
    it('deve parsear intervalo simples "1-3" para índices 0-based [0,1,2]', () => {
      const result = parsePageRange('1-3', 10)
      expect(result).toEqual([0, 1, 2])
    })

    it('deve parsear múltiplos intervalos "1-3,5,7-9" corretamente', () => {
      const result = parsePageRange('1-3,5,7-9', 10)
      expect(result).toEqual([0, 1, 2, 4, 6, 7, 8])
    })

    it('deve retornar array vazio para páginas fora do intervalo', () => {
      const result = parsePageRange('15-20', 10)
      expect(result).toEqual([])
    })

    it('deve ignorar espaços em branco', () => {
      const result = parsePageRange(' 1 - 3 , 5 ', 10)
      expect(result).toEqual([0, 1, 2, 4])
    })

    it('deve remover duplicatas e ordenar', () => {
      const result = parsePageRange('3,1,2,3,1', 10)
      expect(result).toEqual([0, 1, 2])
    })

    it('deve rejeitar números inválidos', () => {
      const result = parsePageRange('1-0,5', 10) // 0 é inválido (começa em 1)
      expect(result).toEqual([4])
    })

    it('deve truncar intervalo que ultrapassa totalPages', () => {
      const result = parsePageRange('8-15', 10)
      expect(result).toEqual([7, 8, 9])
    })

    it('deve ignorar intervalos invertidos quando não há páginas válidas', () => {
      const result = parsePageRange('5-3', 10)
      expect(result).toEqual([])
    })

    it('deve ignorar entradas não numéricas e manter as válidas', () => {
      const result = parsePageRange('abc,2,4-x', 10)
      expect(result).toEqual([1])
    })
  })

  describe('parseOrder', () => {
    it('deve parsear ordem simples "1,2,3" para índices 0-based [0,1,2]', () => {
      const result = parseOrder('1,2,3')
      expect(result).toEqual([0, 1, 2])
    })

    it('deve parsear ordem reversa "3,2,1" corretamente', () => {
      const result = parseOrder('3,2,1')
      expect(result).toEqual([2, 1, 0])
    })

    it('deve parsear ordem com repetição "3,1,2,4"', () => {
      const result = parseOrder('3,1,2,4')
      expect(result).toEqual([2, 0, 1, 3])
    })

    it('deve ignorar espaços em branco', () => {
      const result = parseOrder(' 3 , 1 , 2 ')
      expect(result).toEqual([2, 0, 1])
    })

    it('deve retornar NaN para entradas não numéricas, deixando a validação para a camada chamadora', () => {
      const result = parseOrder('1,abc,3')
      expect(result).toHaveLength(3)
      expect(result[0]).toBe(0)
      expect(Number.isNaN(result[1])).toBe(true)
      expect(result[2]).toBe(2)
    })

    it('deve retornar -1 para string vazia, permitindo que a camada chamadora descarte o valor', () => {
      const result = parseOrder('')
      expect(result).toEqual([-1])
    })
  })
})
