import { PDFDocument } from 'pdf-lib'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

/**
 * Setup automático de fixtures de PDF para testes
 * Gera PDFs de exemplo usando pdf-lib
 */
async function setupPdfFixtures() {
  const fixtureDir = path.join(__dirname, 'fixtures')

  // Criar diretório se não existir
  if (!existsSync(fixtureDir)) {
    mkdirSync(fixtureDir, { recursive: true })
  }

  // 1. sample.pdf — PDF simples com 1 página
  if (!existsSync(path.join(fixtureDir, 'sample.pdf'))) {
    const doc = await PDFDocument.create()
    const page = doc.addPage([600, 800])
    page.drawText('Sample PDF for Testing', {
      x: 50,
      y: 750,
      size: 24,
    })
    page.drawText('This is page 1', {
      x: 50,
      y: 700,
      size: 12,
    })

    const pdfBytes = await doc.save()
    writeFileSync(path.join(fixtureDir, 'sample.pdf'), pdfBytes)
  }

  // 2. multi-page.pdf — PDF com 3 páginas
  if (!existsSync(path.join(fixtureDir, 'multi-page.pdf'))) {
    const doc = await PDFDocument.create()

    for (let i = 1; i <= 3; i++) {
      const page = doc.addPage([600, 800])
      page.drawText(`Page ${i}`, {
        x: 50,
        y: 750,
        size: 24,
      })
      page.drawText(`This is test page ${i}`, {
        x: 50,
        y: 700,
        size: 12,
      })
    }

    const pdfBytes = await doc.save()
    writeFileSync(path.join(fixtureDir, 'multi-page.pdf'), pdfBytes)
  }

  // 3. small.pdf — PDF mínimo (sem conteúdo)
  if (!existsSync(path.join(fixtureDir, 'small.pdf'))) {
    const doc = await PDFDocument.create()
    doc.addPage([100, 100])
    const pdfBytes = await doc.save()
    writeFileSync(path.join(fixtureDir, 'small.pdf'), pdfBytes)
  }

  // 4. large.pdf — PDF com 10 páginas (para testes de merge)
  if (!existsSync(path.join(fixtureDir, 'large.pdf'))) {
    const doc = await PDFDocument.create()

    for (let i = 1; i <= 10; i++) {
      const page = doc.addPage([600, 800])
      page.drawText(`Page ${i} - Large Document`, {
        x: 50,
        y: 750,
        size: 18,
      })
    }

    const pdfBytes = await doc.save()
    writeFileSync(path.join(fixtureDir, 'large.pdf'), pdfBytes)
  }
}

// Executar setup na inicialização dos testes
setupPdfFixtures().catch(err => {
  console.error('Erro ao gerar fixtures PDF:', err)
  process.exit(1)
})
