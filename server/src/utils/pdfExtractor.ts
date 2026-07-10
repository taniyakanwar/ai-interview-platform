import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text.trim();

    if (!text || text.length < 50) {
      // Most real resumes have way more than 50 chars of extractable text.
      // A near-empty result usually means the PDF is a scanned image
      // (no real text layer) rather than an actual parsing failure.
      throw new Error(
        "Could not extract readable text — this PDF may be a scanned image rather than text-based."
      );
    }

    return text;
  } catch (err) {
    throw new Error(
      err instanceof Error && err.message.includes("scanned image")
        ? err.message
        : "Failed to read the PDF. Please make sure it's a valid, text-based PDF file."
    );
  } finally {
    // v2 requires explicit cleanup of internal resources (worker/canvas),
    // unlike v1 which was a one-shot function with nothing to release.
    await parser?.destroy();
  }
}