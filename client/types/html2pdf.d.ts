declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      logging?: boolean;
      useCORS?: boolean;
    };
    jsPDF?: {
      orientation?: "portrait" | "landscape";
      unit?: "mm" | "cm" | "in" | "px" | "pc" | "em" | "ex";
      format?: string;
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): void;
    output(type: "dataurlstring" | "datauri" | "datauristring"): string;
    output(type: "blob"): Blob;
    output(type: "arraybuffer"): ArrayBuffer;
  }

  function html2pdf(): Html2Pdf;

  export default html2pdf;
}
