
export async function extractTextFromPDF(file: File): Promise<string> {
  let pdfjs: any = (window as any).pdfjsLib || (window as any).pdfjsDistBuildPdf;
  if (!pdfjs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
        s.onload = () => resolve(); s.onerror = reject; document.head.appendChild(s);
      });
      pdfjs = (window as any).pdfjsLib || (window as any).pdfjsDistBuildPdf;
      try { pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; } catch {}
    } catch {
      await file.arrayBuffer();
      return "";
    }
  }
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  let fullText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const textItems = (content.items as any[]).map((it: any) => it.str).join(" ");
    fullText += "\n" + textItems;
  }
  if ((fullText.trim().length || 0) < 120) {
    try {
      let Tesseract = (window as any).Tesseract;
      if (!Tesseract) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          s.onload = () => resolve(); s.onerror = reject; document.head.appendChild(s);
      });
        Tesseract = (window as any).Tesseract;
      }
      let ocrText = "";
      const pagesToOCR = Math.min(2, doc.numPages);
      for (let i = 1; i <= pagesToOCR; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d'); if (!ctx) continue;
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: ctx as any, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        const res = await (window as any).Tesseract.recognize(dataUrl, 'spa');
        ocrText += '\n' + (res?.data?.text || '');
      }
      if (ocrText.trim().length > fullText.trim().length) fullText = ocrText;
    } catch (e) { console.warn('OCR fallback not available', e); }
  }
  return fullText;
}
