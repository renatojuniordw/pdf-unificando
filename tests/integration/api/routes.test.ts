import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { POST as mergeRoute } from "@/app/api/pdf/merge/route";
import { POST as splitRoute } from "@/app/api/pdf/split/route";

const pdfBlob = (file: Buffer) => new Blob([Uint8Array.from(file)], { type: "application/pdf" });
const buildRequest = (url: string, formData: FormData, ip: string) =>
  new NextRequest(url, {
    method: "POST",
    body: formData,
    headers: { "x-real-ip": ip },
  });

describe("API Routes - PDF Operations", () => {
  let samplePdf: Buffer;
  let multiPagePdf: Buffer;

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, "../../fixtures");
    samplePdf = readFileSync(path.join(fixtureDir, "sample.pdf"));
    multiPagePdf = readFileSync(path.join(fixtureDir, "multi-page.pdf"));
  });

  describe("POST /api/pdf/merge", () => {
    it("deve retornar 400 se nenhum arquivo enviado", async () => {
      const formData = new FormData();
      const req = buildRequest("http://localhost/api/pdf/merge", formData, "127.0.0.1");

      const res = await mergeRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 400 se apenas um arquivo enviado", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(samplePdf), "test.pdf");

      const req = buildRequest("http://localhost/api/pdf/merge", formData, "127.0.0.2");

      const res = await mergeRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 200 com PDF válido para dois arquivos", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(samplePdf), "test1.pdf");
      formData.append("file", pdfBlob(samplePdf), "test2.pdf");

      const req = buildRequest("http://localhost/api/pdf/merge", formData, "127.0.0.3");

      const res = await mergeRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/pdf");
      expect(res.headers.get("content-disposition")).toContain('filename="test1_unificando.pdf"');
    });
  });

  describe("POST /api/pdf/split", () => {
    it("deve retornar 400 se nenhum arquivo enviado", async () => {
      const formData = new FormData();
      formData.append("range", "1-2");

      const req = buildRequest("http://localhost/api/pdf/split", formData, "127.0.0.4");

      const res = await splitRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 400 se intervalo não informado", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(multiPagePdf), "test.pdf");

      const req = buildRequest("http://localhost/api/pdf/split", formData, "127.0.0.5");

      const res = await splitRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 200 com intervalo válido", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(multiPagePdf), "test.pdf");
      formData.append("range", "1-2");

      const req = buildRequest("http://localhost/api/pdf/split", formData, "127.0.0.6");

      const res = await splitRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/pdf");
      expect(res.headers.get("content-disposition")).toContain('filename="test_unificando.pdf"');
    });
  });
});
