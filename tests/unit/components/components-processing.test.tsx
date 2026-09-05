// @vitest-environment jsdom

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProcessingStatePanel } from '@/components/processing/ProcessingStatePanel'
import { SuccessDownload } from '@/components/processing/SuccessDownload'
import { DownloadButton } from '@/components/processing/DownloadButton'
import { trackToolDownload } from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({
  trackToolDownload: vi.fn(),
  trackToolUpload: vi.fn(),
  trackToolSuccess: vi.fn(),
  trackToolError: vi.fn(),
}))

describe('components/processing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProcessingStatePanel', () => {
    it('PANEL_Uploading_RendersProcessingStatus', () => {
      const { container } = render(
        <ProcessingStatePanel status="uploading" secondsLeft={0} progress={0} onRetry={vi.fn()} error={null} onReset={vi.fn()} />,
      )
      expect(screen.getByText(/ENVIANDO/i)).toBeTruthy()
      expect(container.querySelector('.uploading-wrapper')).toBeNull()
    })

    it('PANEL_Processing_RendersProcessingStatus', () => {
      render(
        <ProcessingStatePanel status="processing" secondsLeft={0} progress={0} onRetry={vi.fn()} error={null} onReset={vi.fn()} />,
      )
      expect(screen.getByText(/PROCESSANDO/i)).toBeTruthy()
    })

    it('PANEL_RateLimited_RendersCountdown', () => {
      render(
        <ProcessingStatePanel status="rate_limited" secondsLeft={3} progress={0.5} onRetry={vi.fn()} error={null} onReset={vi.fn()} />,
      )
      expect(screen.getByText('3')).toBeTruthy()
    })

    it('PANEL_Error_WithRenderError_UsesCustomRenderer', () => {
      render(
        <ProcessingStatePanel
          status="error"
          secondsLeft={0}
          progress={0}
          onRetry={vi.fn()}
          error="falhou"
          onReset={vi.fn()}
          renderError={({ error, onReset }) => (
            <button type="button" onClick={onReset}>
              custom:{error}
            </button>
          )}
        />,
      )
      expect(screen.queryByText(/ERRO/i)).toBeNull()
      expect(screen.getByRole('button', { name: /custom:falhou/i })).toBeTruthy()
    })

    it('PANEL_Error_WithoutRenderError_RendersDefaultBanner', () => {
      const onReset = vi.fn()
      render(
        <ProcessingStatePanel status="error" secondsLeft={0} progress={0} onRetry={vi.fn()} error="Algo deu errado" onReset={onReset} />,
      )
      expect(screen.getByText(/ERRO/i)).toBeTruthy()
      expect(screen.getByText(/Algo deu errado/i)).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
      expect(onReset).toHaveBeenCalledTimes(1)
    })

    it('PANEL_Error_NullMessage_UsesFallbackMessage', () => {
      render(
        <ProcessingStatePanel status="error" secondsLeft={0} progress={0} onRetry={vi.fn()} error={null} onReset={vi.fn()} />,
      )
      expect(screen.getByText(/Falha ao processar o arquivo/i)).toBeTruthy()
    })

    it('PANEL_Idle_ReturnsNull', () => {
      const { container } = render(
        <ProcessingStatePanel status="idle" secondsLeft={0} progress={0} onRetry={vi.fn()} error={null} onReset={vi.fn()} />,
      )
      expect(container.innerHTML).toBe('')
    })

    it('PANEL_AppliesClassNameToStatusWrapper', () => {
      const { container } = render(
        <ProcessingStatePanel status="processing" secondsLeft={0} progress={0} onRetry={vi.fn()} error={null} onReset={vi.fn()} className="mx-auto" />,
      )
      expect(container.querySelector('div.mx-auto')).toBeTruthy()
    })
  })

  describe('SuccessDownload', () => {
    it('SUCCESS_WithTitleAndFileSize_RendersBannerWithSize', () => {
      render(
        <SuccessDownload
          url="blob:x"
          filename="out.pdf"
          onDownload={vi.fn()}
          onReset={vi.fn()}
          fileSize={2_097_152}
          title="Concluído"
        />,
      )
      expect(screen.getByText(/Concluído/i)).toBeTruthy()
      expect(screen.getByText('2.0MB')).toBeTruthy()
    })

    it('SUCCESS_WithTitleWithoutFileSize_RendersDefaultMessage', () => {
      render(
        <SuccessDownload
          url="blob:x"
          filename="out.pdf"
          onDownload={vi.fn()}
          onReset={vi.fn()}
          title="Concluído"
        />,
      )
      expect(screen.getByText(/Arquivo pronto para download/i)).toBeTruthy()
    })

    it('SUCCESS_WithoutTitle_DoesNotRenderBannerButShowsDownload', () => {
      const { container } = render(
        <SuccessDownload url="blob:x" filename="out.pdf" onDownload={vi.fn()} onReset={vi.fn()} />,
      )
      expect(screen.queryByText(/Arquivo pronto para download/i)).toBeNull()
      expect(screen.getByRole('link', { name: /Baixar arquivo/i })).toBeTruthy()
      expect(container.querySelector('.child-extra')).toBeNull()
    })

    it('SUCCESS_RendersChildrenBetweenBannerAndButton', () => {
      render(
        <SuccessDownload url="blob:x" filename="out.pdf" onDownload={vi.fn()} onReset={vi.fn()} title="OK">
          <div className="child-extra">extra</div>
        </SuccessDownload>,
      )
      expect(screen.getByText(/extra/i)).toBeTruthy()
    })
  })

  describe('DownloadButton', () => {
    it('DOWNLOAD_FormatBytes_ByteBranch', () => {
      render(<DownloadButton url="blob:x" filename="out.pdf" onReset={vi.fn()} fileSize={500} />)
      expect(screen.getByText('500 B')).toBeTruthy()
    })

    it('DOWNLOAD_FormatBytes_KbBranch', () => {
      render(<DownloadButton url="blob:x" filename="out.pdf" onReset={vi.fn()} fileSize={1536} />)
      expect(screen.getByText('1.5 KB')).toBeTruthy()
    })

    it('DOWNLOAD_FormatBytes_MbBranch', () => {
      render(<DownloadButton url="blob:x" filename="out.pdf" onReset={vi.fn()} fileSize={3_000_000} />)
      expect(screen.getByText('2.9 MB')).toBeTruthy()
    })

    it('DOWNLOAD_WithoutFileSize_HidesSizeLabel', () => {
      const { container } = render(
        <DownloadButton url="blob:x" filename="out.pdf" onReset={vi.fn()} fileSize={null} />,
      )
      expect(container.querySelector('p')).toBeNull()
    })

    it('DOWNLOAD_WithToolName_TracksAndInvokesOnDownload', () => {
      const onDownload = vi.fn()
      render(
        <DownloadButton
          url="blob:x"
          filename="out.pdf"
          toolName="comprimir-pdf"
          onDownload={onDownload}
          onReset={vi.fn()}
          fileSize={10}
        />,
      )
      fireEvent.click(screen.getByRole('link', { name: /Baixar arquivo/i }))
      expect(trackToolDownload).toHaveBeenCalledWith('comprimir-pdf', 'out.pdf')
      expect(onDownload).toHaveBeenCalledTimes(1)
    })

    it('DOWNLOAD_WithoutToolName_SkipsTrackingButInvokesOnDownload', () => {
      const onDownload = vi.fn()
      render(<DownloadButton url="blob:x" filename="out.pdf" onDownload={onDownload} onReset={vi.fn()} />)
      fireEvent.click(screen.getByRole('link', { name: /Baixar arquivo/i }))
      expect(trackToolDownload).not.toHaveBeenCalled()
      expect(onDownload).toHaveBeenCalledTimes(1)
    })

    it('DOWNLOAD_ResetButton_InvokesOnReset', () => {
      const onReset = vi.fn()
      render(<DownloadButton url="blob:x" filename="out.pdf" onReset={onReset} />)
      fireEvent.click(screen.getByRole('button', { name: /Processar novo arquivo/i }))
      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })
})