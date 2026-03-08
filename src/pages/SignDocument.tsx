import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignaturePad from "signature_pad";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type Field = {
  id: string;
  field_type: string;
  label: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
};

type DocInfo = {
  id: string;
  title: string;
  pdf_url: string;
};

type Submission = {
  id: string;
  document_id: string;
  status: string;
  field_values: Record<string, string>;
  signature_data: string | null;
};

const SignDocument: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  const [doc, setDoc] = useState<DocInfo | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [showSigPad, setShowSigPad] = useState(false);

  // Load submission & document data
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const { data: sub } = await supabase
        .from("document_submissions")
        .select("*")
        .eq("token", token)
        .single();

      if (!sub) {
        setLoading(false);
        return;
      }

      setSubmission(sub as any);
      if ((sub as any).status === "signed") {
        setSigned(true);
        setLoading(false);
        return;
      }

      const { data: docData } = await supabase
        .from("documents")
        .select("*")
        .eq("id", (sub as any).document_id)
        .single();

      if (docData) setDoc(docData as DocInfo);

      const { data: fieldsData } = await supabase
        .from("document_fields")
        .select("*")
        .eq("document_id", (sub as any).document_id)
        .order("sort_order");

      if (fieldsData) setFields(fieldsData as Field[]);
      setLoading(false);
    };
    load();
  }, [token]);

  // Load PDF
  useEffect(() => {
    if (!doc?.pdf_url) return;
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(doc.pdf_url).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
    };
    loadPdf();
  }, [doc?.pdf_url]);

  // Render page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    setCanvasSize({ width: viewport.width, height: viewport.height });
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Init signature pad
  useEffect(() => {
    if (showSigPad && sigCanvasRef.current && !sigPadRef.current) {
      sigPadRef.current = new SignaturePad(sigCanvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });
    }
  }, [showSigPad]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const hasSignatureField = fields.some((f) => f.field_type === "signature");

  const handleSaveSignature = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setSignatureData(sigPadRef.current.toDataURL());
      setShowSigPad(false);
    } else {
      toast({ title: "נא לחתום לפני השמירה", variant: "destructive" });
    }
  };

  const handleClearSignature = () => {
    sigPadRef.current?.clear();
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!submission || !doc) return;

    // Validate required fields
    for (const field of fields) {
      if (field.required && field.field_type !== "signature") {
        if (!fieldValues[field.id]?.trim()) {
          toast({ title: `נא למלא את השדה: ${field.label}`, variant: "destructive" });
          return;
        }
      }
    }

    if (hasSignatureField && !signatureData) {
      toast({ title: "נא לחתום על המסמך", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Generate signed PDF
      const pdfBytes = await fetch(doc.pdf_url).then((r) => r.arrayBuffer());
      const pdfDocLib = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDocLib.embedFont(StandardFonts.Helvetica);
      const pages = pdfDocLib.getPages();

      // Write field values onto PDF
      for (const field of fields) {
        if (field.field_type === "signature" && signatureData) {
          const page = pages[field.page_number - 1];
          if (!page) continue;
          const { height: pageHeight } = page.getSize();
          const sigImg = await pdfDocLib.embedPng(signatureData);
          const pdfX = field.x / 1.5;
          const pdfY = pageHeight - (field.y / 1.5) - (field.height / 1.5);
          page.drawImage(sigImg, {
            x: pdfX,
            y: pdfY,
            width: field.width / 1.5,
            height: field.height / 1.5,
          });
        } else if (fieldValues[field.id]) {
          const page = pages[field.page_number - 1];
          if (!page) continue;
          const { height: pageHeight } = page.getSize();
          const pdfX = field.x / 1.5;
          const pdfY = pageHeight - (field.y / 1.5) - 12;
          page.drawText(fieldValues[field.id], {
            x: pdfX,
            y: pdfY,
            size: 11,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
        }
      }

      const signedPdfBytes = await pdfDocLib.save();
      const signedBlob = new Blob([signedPdfBytes], { type: "application/pdf" });
      const fileName = `signed_${submission.id}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, signedBlob, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);

      // Update submission
      const { error: updateError } = await supabase
        .from("document_submissions")
        .update({
          field_values: fieldValues,
          signature_data: signatureData,
          signed_pdf_url: urlData.publicUrl,
          signer_name: signerName || null,
          signer_email: signerEmail || null,
          status: "signed",
          signed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      setSigned(true);
      toast({ title: "המסמך נחתם בהצלחה!" });
    } catch (err) {
      console.error(err);
      toast({ title: "שגיאה בשמירת המסמך", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">קישור לא תקין</h1>
          <p className="text-muted-foreground">הקישור שקיבלת אינו תקף או שפג תוקפו.</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">המסמך נחתם בהצלחה!</h1>
          <p className="text-muted-foreground">תודה רבה. המסמך החתום נשמר במערכת.</p>
        </div>
      </div>
    );
  }

  const pageFields = fields.filter((f) => f.page_number === currentPage);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">{doc?.title || "מסמך לחתימה"}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Signer info */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">פרטי החותם</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>שם מלא</Label>
              <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="הכנס שם מלא" />
            </div>
            <div>
              <Label>אימייל</Label>
              <Input value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="email@example.com" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Fields form */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">מילוי שדות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields
              .filter((f) => f.field_type !== "signature")
              .map((field) => (
                <div key={field.id}>
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive mr-1">*</span>}
                  </Label>
                  <Input
                    type={field.field_type === "date" ? "date" : "text"}
                    value={fieldValues[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    dir={field.field_type === "id_number" || field.field_type === "date" ? "ltr" : "rtl"}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Signature */}
        {hasSignatureField && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">חתימה</h3>
            {signatureData ? (
              <div className="space-y-2">
                <img src={signatureData} alt="חתימה" className="border border-border rounded h-24" />
                <Button variant="outline" size="sm" onClick={() => { setSignatureData(null); setShowSigPad(true); }}>
                  חתום מחדש
                </Button>
              </div>
            ) : showSigPad ? (
              <div className="space-y-2">
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={150}
                  className="border border-border rounded bg-white w-full max-w-md"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSignature} className="bg-gradient-gold text-primary-foreground">
                    שמור חתימה
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleClearSignature}>
                    נקה
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowSigPad(true)}>
                לחץ כאן לחתימה
              </Button>
            )}
          </div>
        )}

        {/* PDF preview */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">תצוגה מקדימה של המסמך</h3>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-3">
              <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                הקודם
              </Button>
              <span className="text-sm">עמוד {currentPage} מתוך {totalPages}</span>
              <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                הבא
              </Button>
            </div>
          )}
          <div ref={containerRef} className="relative inline-block border border-border rounded overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
            {pageFields.map((field) => (
              <div
                key={field.id}
                className={`absolute border-2 rounded flex items-center justify-center text-xs ${
                  field.field_type === "signature"
                    ? "border-primary/50 bg-primary/5"
                    : "border-blue-400/50 bg-blue-50/30"
                }`}
                style={{
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  height: field.height,
                }}
              >
                <span className="text-muted-foreground truncate px-1">
                  {field.field_type === "signature"
                    ? signatureData
                      ? "✓ נחתם"
                      : "חתימה"
                    : fieldValues[field.id] || field.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center pb-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-gold text-primary-foreground px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 ml-2" />
                חתום ושלח
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;
