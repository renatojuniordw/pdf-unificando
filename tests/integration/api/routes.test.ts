import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { POST as mergeRoute } from "@/app/api/pdf/merge/route";
import { POST as splitRoute } from "@/app/api/pdf/split/route";
import { POST as toTxtRoute } from "@/app/api/pdf/to-txt/route";
import { POST as pageNumbersRoute } from "@/app/api/pdf/page-numbers/route";
import { POST as extractPagesRoute } from "@/app/api/pdf/extract-pages/route";
import { GET as healthRoute } from "@/app/api/health/route";

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
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
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

    it("deve retornar 413 quando o tamanho total excede o limite", async () => {
      const bigBytes = (size: number) => {
        const bytes = new Uint8Array(size);
        bytes.set([0x25, 0x50, 0x44, 0x46, 0x2d]); // prefixo %PDF-
        return bytes;
      };

      const formData = new FormData();
      formData.append("file", new File([bigBytes(26 * 1024 * 1024)], "big1.pdf"), "big1.pdf");
      formData.append("file", new File([bigBytes(26 * 1024 * 1024)], "big2.pdf"), "big2.pdf");

      const req = buildRequest("http://localhost/api/pdf/merge", formData, "127.0.0.3");

      const res = await mergeRoute(req);
      expect(res.status).toBe(413);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.details.reason).toBe("total_too_large");
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
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
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

  describe("POST /api/pdf/to-txt", () => {
    it("deve retornar 400 se nenhum arquivo enviado", async () => {
      const formData = new FormData();

      const req = buildRequest("http://localhost/api/pdf/to-txt", formData, "127.0.0.7");

      const res = await toTxtRoute(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it("deve retornar 200 com txt valido", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(samplePdf), "test.pdf");

      const req = buildRequest("http://localhost/api/pdf/to-txt", formData, "127.0.0.8");

      const res = await toTxtRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/plain");
      expect(res.headers.get("content-disposition")).toContain('filename="test_unificando.txt"');
    });
  });

  describe("POST /api/pdf/page-numbers", () => {
    it("deve retornar 400 se nenhum arquivo enviado", async () => {
      const formData = new FormData();
      formData.append("placement", "footer");

      const req = buildRequest("http://localhost/api/pdf/page-numbers", formData, "127.0.0.9");

      const res = await pageNumbersRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 200 com PDF numerado", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(multiPagePdf), "test.pdf");
      formData.append("placement", "header");
      formData.append("alignment", "right");
      formData.append("startAt", "3");

      const req = buildRequest("http://localhost/api/pdf/page-numbers", formData, "127.0.0.10");

      const res = await pageNumbersRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/pdf");
      expect(res.headers.get("content-disposition")).toContain('filename="test_unificando.pdf"');
    });
  });

  describe("POST /api/pdf/extract-pages", () => {
    it("deve retornar 400 se intervalo nao informado", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(multiPagePdf), "test.pdf");

      const req = buildRequest("http://localhost/api/pdf/extract-pages", formData, "127.0.0.11");

      const res = await extractPagesRoute(req);
      expect(res.status).toBe(400);
    });

    it("deve retornar 200 com zip valido", async () => {
      const formData = new FormData();
      formData.append("file", pdfBlob(multiPagePdf), "test.pdf");
      formData.append("range", "1,3");

      const req = buildRequest("http://localhost/api/pdf/extract-pages", formData, "127.0.0.12");

      const res = await extractPagesRoute(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/zip");
      expect(res.headers.get("content-disposition")).toContain('filename="test_unificando.zip"');
    });
  });

  describe("GET /api/health", () => {
    it("deve retornar status ok com informações básicas de runtime", async () => {
      const res = await healthRoute();
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe("ok");
      expect(body.timestamp).toBeTruthy();
      expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(body.queue).toMatchObject({
        active: expect.any(Number),
        pending: expect.any(Number),
        overloaded: expect.any(Boolean),
      });
    });
  });
});
