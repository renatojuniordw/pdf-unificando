import { type NextRequest } from "next/server";
import { splitPdf } from "@/lib/pdf/split";
import { validateRateLimit } from "@/lib/queue";
import {
  apiErrorResponse,
  assertMaxFileSize,
  buildOutputFilename,
  errorResponse,
  isFileEntry,
  isPdf,
  streamResponse,
  validateHoneypot,
} from "@/lib/utils/http";

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req);
    const formData = await req.formData();
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' });
    const fileEntry = formData.get("file");
    if (!isFileEntry(fileEntry))
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' });
    const file = fileEntry;

    assertMaxFileSize(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isPdf(buffer))
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' });
    const pages = (formData.get("range") as string) ?? "";
    if (!pages)
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Informe o intervalo de páginas.', { field: 'range', reason: 'missing_range' });

    const result = await splitPdf(buffer, pages);
    return streamResponse(
      result,
      buildOutputFilename(file.name, "pdf"),
      "application/pdf",
    );
  } catch (err) {
    return errorResponse(err);
  }
}
