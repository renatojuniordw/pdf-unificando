import fs from 'fs'
import path from 'path'

async function testCompress() {
  const apiUrl = 'http://localhost:11005/api/pdf/compress'
  const filePath = path.join(process.cwd(), 'test-input.pdf')

  // Criar um PDF mínimo válido se não existir
  if (!fs.existsSync(filePath)) {
    const minPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Test PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000062 00000 n \n0000000117 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF'
    )
    fs.writeFileSync(filePath, minPdf)
  }

  const formData = new FormData()
  const fileBuffer = fs.readFileSync(filePath)
  const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' })
  formData.append('file', fileBlob, 'test-input.pdf')
  formData.append('quality', 'ebook')

  console.log('Enviando requisição para:', apiUrl)
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Origin': 'http://localhost:11005'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na API (${response.status}):`, errorText)
      return
    }

    const resultBuffer = await response.arrayBuffer()
    console.log(`Sucesso! Recebido arquivo de ${resultBuffer.byteLength} bytes.`)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    const outputPath = path.join(process.cwd(), 'test-output.pdf')
    fs.writeFileSync(outputPath, Buffer.from(resultBuffer))
    console.log('Arquivo salvo em:', outputPath)

  } catch (err) {
    console.error('Erro ao conectar na API:', err)
  }
}

testCompress()
