import { type NextRequest } from "next/server";
import { splitPdf } from "@/lib/pdf/split";
import { validateRateLimit } from "@/lib/queue";
import {
  buildOutputFilename,
  errorResponse,
  isPdf,
  streamResponse,
} from "@/lib/utils/http";

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file)
      return Response.json({ error: "Arquivo não enviado." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isPdf(buffer))
      return Response.json({ error: "O arquivo não é um PDF válido." }, { status: 400 });
    const pages = (formData.get("range") as string) ?? "";
    if (!pages)
      return Response.json(
        { error: "Informe o intervalo de páginas." },
        { status: 400 },
      );

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
