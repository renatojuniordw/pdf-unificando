import { type NextRequest } from "next/server";
import { splitPdf } from "@/lib/pdf/split";
import { validateRateLimit } from "@/lib/queue";
import {
  buildOutputFilename,
  errorResponse,
  parseSinglePdfUpload,
  requireFormField,
  streamResponse,
} from "@/lib/utils/http";

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req);
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req);
    const pages = requireFormField(formData, "range", "Informe o intervalo de páginas.", "missing_range");

    const result = await splitPdf(buffer, pages);
    return streamResponse(
      result,
      buildOutputFilename(fileName, "pdf"),
      "application/pdf",
    );
  } catch (err) {
    return errorResponse(err);
  }
}
