"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy, Printer, Download } from "lucide-react";
import { useState } from "react";

export function QRCodeGenerator({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `agri-trust-qr-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handlePrint = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print QR Code - ${title}</title></head>
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
              <div style="text-align:center;">
                <h2 style="font-family:sans-serif; color:#166534;">${title}</h2>
                <img src="${imgData}" style="width: 300px; height: 300px;" />
                <p style="font-family:monospace; margin-top:20px; color:#64748b;">Agri-Trust Rabbitry Registry</p>
                <p style="font-family:monospace; font-size:12px; color:#94a3b8; word-break:break-all;">${url}</p>
              </div>
              <script>
                setTimeout(() => { window.print(); window.close(); }, 500);
              </script>
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg border border-slate-200">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
        <QRCodeCanvas
          id="qr-code"
          value={url}
          size={220}
          bgColor={"#ffffff"}
          fgColor={"#166534"}
          level={"H"}
          includeMargin={true}
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full justify-center">
        <Button variant="default" onClick={handleDownload} className="text-sm bg-green-700 hover:bg-green-800">
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
        <Button variant="outline" onClick={handleCopy} className="text-sm">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy URL"}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="text-sm">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-4 break-all bg-slate-50 p-2 rounded w-full text-center">
        {url}
      </p>
    </div>
  );
}
