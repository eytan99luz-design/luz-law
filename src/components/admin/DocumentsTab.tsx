import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Link2, Copy, Eye, Upload, MessageCircle, Send, Mail, Download, PenLine, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SignaturePad from "signature_pad";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

type Document = {
  id: string;
  title: string;
  pdf_url: string;
  status: string;
  created_at: string;
  submissions?: Submission[];
};

type Submission = {
  id: string;
  token: string;
  signer_name: string | null;
  signer_email: string | null;
  status: string;
  signed_at: string | null;
  signed_pdf_url: string | null;
  admin_signature_data: string | null;
  admin_signed_at: string | null;
  final_pdf_url: string | null;
  created_at: string;
};

const DocumentsTab: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [whatsappDialog, setWhatsappDialog] = useState<{
    open: boolean;
    token: string;
    docTitle: string;
  }>({ open: false, token: "", docTitle: "" });
  const [emailDialog, setEmailDialog] = useState<{
    open: boolean;
    token: string;
    docTitle: string;
  }>({ open: false, token: "", docTitle: "" });
  const [sendSignedDialog, setSendSignedDialog] = useState<{
    open: boolean;
    sub: Submission | null;
    docTitle: string;
    mode: "whatsapp" | "email";
  }>({ open: false, sub: null, docTitle: "", mode: "whatsapp" });
  const [counterSignDialog, setCounterSignDialog] = useState<{
    open: boolean;
    sub: Submission | null;
    docTitle: string;
    documentId: string;
  }>({ open: false, sub: null, docTitle: "", documentId: "" });
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [counterSigning, setCounterSigning] = useState(false);
  const [signMode, setSignMode] = useState<"manual" | "preset">("preset");
  const [presetSignatureUrl, setPresetSignatureUrl] = useState<string | null>(null);

  const sigPadRef = useRef<SignaturePad | null>(null);

  const sigCanvasCallback = (canvas: HTMLCanvasElement | null) => {
    if (canvas && !sigPadRef.current) {
      sigPadRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        penColor: "rgb(0, 0, 0)",
      });
    }
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("status", "active")
      .order("full_name");
    if (data) setClients(data);
  };

  const loadDocuments = async () => {
    setLoading(true);
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (docs) {
      const docsWithSubs = await Promise.all(
        docs.map(async (doc: any) => {
          const { data: subs } = await supabase
            .from("document_submissions")
            .select("*")
            .eq("document_id", doc.id)
            .order("created_at", { ascending: false });
          return { ...doc, submissions: subs || [] };
        })
      );
      setDocuments(docsWithSubs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
    loadClients();
    // Load preset signature
    const loadPreset = async () => {
      const { data } = await supabase
        .from("admin_settings" as any)
        .select("value")
        .eq("key", "preset_signature_url")
        .single();
      if (data) setPresetSignatureUrl((data as any).value);
    };
    loadPreset();
  }, []);

  // Clean up signature pad when counter-sign dialog closes
  useEffect(() => {
    if (!counterSignDialog.open) {
      sigPadRef.current = null;
    }
  }, [counterSignDialog.open]);

  const handleUploadPDF = async () => {
    if (!selectedFile || !newTitle.trim()) {
      toast({ title: "נא למלא כותרת ולבחור קובץ", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = selectedFile.name.split('.').pop() || 'pdf';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, selectedFile, { contentType: "application/pdf" });

    if (uploadError) {
      toast({ title: "שגיאה בהעלאת הקובץ", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("documents").insert({
      title: newTitle.trim(),
      pdf_url: urlData.publicUrl,
      status: "draft",
    });

    if (insertError) {
      toast({ title: "שגיאה בשמירת המסמך", variant: "destructive" });
    } else {
      toast({ title: "המסמך הועלה בהצלחה" });
      setNewTitle("");
      setSelectedFile(null);
    }
    setUploading(false);
    loadDocuments();
  };

  const deleteDocument = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    toast({ title: "המסמך נמחק" });
    loadDocuments();
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase.from("document_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "שגיאה במחיקת הקישור", variant: "destructive" });
    } else {
      toast({ title: "הקישור נמחק" });
      loadDocuments();
    }
  };

  const createSigningLink = async (docId: string) => {
    const { data, error } = await supabase
      .from("document_submissions")
      .insert({ document_id: docId })
      .select()
      .single();

    if (error) {
      toast({ title: "שגיאה ביצירת קישור", variant: "destructive" });
      return;
    }

    const link = `${window.location.origin}/sign/${data.token}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "הקישור הועתק ללוח" });
    loadDocuments();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-600 text-white">נחתם</Badge>;
      case "pending":
        return <Badge variant="secondary">ממתין לחתימה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const fillClientDetails = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.full_name);
      setClientPhone(client.phone || "");
      setClientEmail(client.email || "");
    }
  };

  const handleSendWhatsApp = () => {
    if (!clientPhone.trim()) {
      toast({ title: "נא להזין מספר טלפון", variant: "destructive" });
      return;
    }
    const link = `${window.location.origin}/sign/${whatsappDialog.token}`;
    const name = clientName.trim() || "לקוח/ה יקר/ה";
    const message = `היי ${name}, מצורף ${whatsappDialog.docTitle} לחתימה:\n${link}\n\nבברכה,\nעו"ד איתן לוז`;
    let phone = clientPhone.trim().replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.slice(1);
    const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setWhatsappDialog({ open: false, token: "", docTitle: "" });
    resetClientFields();
  };

  const handleSendEmail = () => {
    if (!clientEmail.trim()) {
      toast({ title: "נא להזין כתובת מייל", variant: "destructive" });
      return;
    }
    const link = `${window.location.origin}/sign/${emailDialog.token}`;
    const name = clientName.trim() || "לקוח/ה יקר/ה";
    const subject = `${emailDialog.docTitle} - מסמך לחתימה`;
    const body = `היי ${name},\n\nמצורף ${emailDialog.docTitle} לחתימה:\n${link}\n\nבברכה,\nעו"ד איתן לוז`;
    const mailtoUrl = `mailto:${clientEmail.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    setEmailDialog({ open: false, token: "", docTitle: "" });
    resetClientFields();
  };

  const resetClientFields = () => {
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setSelectedClientId("");
  };

  const openWhatsAppDialog = (token: string, docTitle: string) => {
    resetClientFields();
    setWhatsappDialog({ open: true, token, docTitle });
  };

  const openEmailDialog = (token: string, docTitle: string) => {
    resetClientFields();
    setEmailDialog({ open: true, token, docTitle });
  };

  // Counter-sign: admin adds signature to the already-signed PDF
  const handleCounterSign = async () => {
    let adminSigData: string;

    if (signMode === "manual") {
      if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
        toast({ title: "נא לחתום לפני השמירה", variant: "destructive" });
        return;
      }
      adminSigData = sigPadRef.current.toDataURL("image/png");
    } else {
      if (!presetSignatureUrl) {
        toast({ title: "לא הוגדרה חתימה קבועה. העלה חתימה בעורך המסמך.", variant: "destructive" });
        return;
      }
      // Fetch the preset image and convert to data URL
      const resp = await fetch(presetSignatureUrl);
      const blob = await resp.blob();
      adminSigData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }

    if (!counterSignDialog.sub?.signed_pdf_url) return;

    setCounterSigning(true);
    try {
      // Load admin_signature field positions for this document
      const { data: adminFields } = await supabase
        .from("document_fields")
        .select("*")
        .eq("document_id", counterSignDialog.documentId)
        .eq("field_type", "admin_signature");

      // Load the client-signed PDF
      const pdfBytes = await fetch(counterSignDialog.sub.signed_pdf_url).then((r) => r.arrayBuffer());
      const pdfDocLib = await PDFDocument.load(pdfBytes);
      const pages = pdfDocLib.getPages();

      // Determine if it's PNG or JPEG from the data URL
      const isPng = adminSigData.includes("image/png");
      const sigImg = isPng
        ? await pdfDocLib.embedPng(adminSigData)
        : await pdfDocLib.embedJpg(adminSigData);

      if (adminFields && adminFields.length > 0) {
        // Place signature at each admin_signature field position
        for (const field of adminFields) {
          const page = pages[field.page_number - 1];
          if (!page) continue;
          const { height: pageHeight } = page.getSize();
          const pdfX = field.x / 1.5;
          const pdfY = pageHeight - (field.y / 1.5) - (field.height / 1.5);
          page.drawImage(sigImg, {
            x: pdfX,
            y: pdfY,
            width: field.width / 1.5,
            height: field.height / 1.5,
          });
        }
      } else {
        // Fallback: place at bottom-left of last page
        const lastPage = pages[pages.length - 1];
        const sigAspect = sigImg.width / sigImg.height;
        const sigWidth = 150;
        const sigHeight = sigWidth / sigAspect;
        lastPage.drawImage(sigImg, {
          x: 50,
          y: 50,
          width: sigWidth,
          height: sigHeight,
        });
      }

      const finalPdfBytes = await pdfDocLib.save();
      const finalBlob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const fileName = `final_${counterSignDialog.sub.id}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, finalBlob, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("document_submissions")
        .update({
          admin_signature_data: adminSigData,
          admin_signed_at: new Date().toISOString(),
          final_pdf_url: urlData.publicUrl,
        } as any)
        .eq("id", counterSignDialog.sub.id);

      if (updateError) throw updateError;

      toast({ title: "החתימה נוספה בהצלחה!" });
      setCounterSignDialog({ open: false, sub: null, docTitle: "", documentId: "" });
      loadDocuments();
    } catch (err: any) {
      console.error("Counter-sign error:", err);
      toast({ title: "שגיאה בחתימה: " + (err?.message || "שגיאה"), variant: "destructive" });
    } finally {
      setCounterSigning(false);
    }
  };

  const downloadPdf = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast({ title: "שגיאה בהורדת הקובץ", variant: "destructive" });
    }
  };

  const openSendSignedDialog = (sub: Submission, docTitle: string, mode: "whatsapp" | "email") => {
    resetClientFields();
    // Pre-fill from submission data
    if (sub.signer_name) setClientName(sub.signer_name);
    if (sub.signer_email) setClientEmail(sub.signer_email);
    setSendSignedDialog({ open: true, sub, docTitle, mode });
  };

  const handleSendSignedWhatsApp = () => {
    if (!clientPhone.trim()) {
      toast({ title: "נא להזין מספר טלפון", variant: "destructive" });
      return;
    }
    const pdfUrl = sendSignedDialog.sub?.final_pdf_url || sendSignedDialog.sub?.signed_pdf_url;
    const name = clientName.trim() || "לקוח/ה יקר/ה";
    const message = `היי ${name}, מצורף ${sendSignedDialog.docTitle} החתום שלך:\n${pdfUrl}\n\nבברכה,\nעו"ד איתן לוז`;
    let phone = clientPhone.trim().replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "972" + phone.slice(1);
    const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSendSignedDialog({ open: false, sub: null, docTitle: "", mode: "whatsapp" });
    resetClientFields();
  };

  const handleSendSignedEmail = () => {
    if (!clientEmail.trim()) {
      toast({ title: "נא להזין כתובת מייל", variant: "destructive" });
      return;
    }
    const pdfUrl = sendSignedDialog.sub?.final_pdf_url || sendSignedDialog.sub?.signed_pdf_url;
    const name = clientName.trim() || "לקוח/ה יקר/ה";
    const subject = `${sendSignedDialog.docTitle} - מסמך חתום`;
    const body = `היי ${name},\n\nמצורף ${sendSignedDialog.docTitle} החתום שלך:\n${pdfUrl}\n\nבברכה,\nעו"ד איתן לוז`;
    const mailtoUrl = `mailto:${clientEmail.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    setSendSignedDialog({ open: false, sub: null, docTitle: "", mode: "email" });
    resetClientFields();
  };

  const ClientSelector = () => (
    <div>
      <Label>בחר לקוח מהרשימה</Label>
      <Select value={selectedClientId} onValueChange={fillClientDetails}>
        <SelectTrigger>
          <SelectValue placeholder="בחר לקוח..." />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.full_name} {c.phone ? `(${c.phone})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (loading) return <p className="text-muted-foreground">טוען מסמכים...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">מסמכים להחתמה</h2>

      {/* Upload new document */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground">העלאת מסמך חדש</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>כותרת המסמך</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="לדוגמה: הסכם שכירות"
            />
          </div>
          <div>
            <Label>קובץ PDF</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="file:ml-2 file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:text-sm"
            />
          </div>
        </div>
        <Button
          onClick={handleUploadPDF}
          disabled={uploading || !newTitle.trim() || !selectedFile}
          className="bg-gradient-gold text-primary-foreground"
        >
          <Upload className="h-4 w-4 ml-1" />
          {uploading ? "מעלה..." : "העלה מסמך"}
        </Button>
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <p className="text-muted-foreground">אין מסמכים עדיין</p>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">{doc.title}</span>
                  <Badge variant={doc.status === "active" ? "default" : "outline"}>
                    {doc.status === "active" ? "פעיל" : "טיוטה"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/document/${doc.id}`)}
                    className="border-primary/30 text-primary"
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    עריכת שדות
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => createSigningLink(doc.id)}
                    className="bg-gradient-gold text-primary-foreground"
                  >
                    <Link2 className="h-4 w-4 ml-1" />
                    צור קישור חתימה
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Submissions list */}
              {doc.submissions && doc.submissions.length > 0 && (
                <div className="border-t border-border pt-3 mt-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">הגשות:</h4>
                  <div className="space-y-2">
                    {doc.submissions.map((sub) => {
                      const hasFinal = !!(sub as any).final_pdf_url;
                      const bestPdfUrl = (sub as any).final_pdf_url || sub.signed_pdf_url;
                      return (
                        <div key={sub.id} className="flex items-center justify-between bg-muted/30 rounded p-2 text-sm flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            {statusBadge(sub.status)}
                            {hasFinal && <Badge className="bg-primary text-primary-foreground text-xs">חתום סופי</Badge>}
                            <span>{sub.signer_name || "לא מילא עדיין"}</span>
                            {sub.signer_email && <span className="text-muted-foreground">{sub.signer_email}</span>}
                            <span className="text-muted-foreground">
                              {new Date(sub.created_at).toLocaleDateString("he-IL")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                const link = `${window.location.origin}/sign/${sub.token}`;
                                await navigator.clipboard.writeText(link);
                                toast({ title: "הקישור הועתק" });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {sub.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600"
                                  onClick={() => openWhatsAppDialog(sub.token, doc.title)}
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600"
                                  onClick={() => openEmailDialog(sub.token, doc.title)}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {sub.status === "signed" && !hasFinal && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary border-primary/30"
                                onClick={() => setCounterSignDialog({ open: true, sub, docTitle: doc.title, documentId: doc.id })}
                              >
                                <PenLine className="h-3 w-3 ml-1" />
                                חתימת עו"ד
                              </Button>
                            )}
                            {bestPdfUrl && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => downloadPdf(bestPdfUrl, `${hasFinal ? "final" : "signed"}_${sub.signer_name || "document"}.pdf`)}
                                >
                                  <Download className="h-3 w-3 ml-1" />
                                  הורד PDF
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600"
                                  onClick={() => openSendSignedDialog(sub, doc.title, "whatsapp")}
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600"
                                  onClick={() => openSendSignedDialog(sub, doc.title, "email")}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => deleteSubmission(sub.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Dialog */}
      <Dialog open={whatsappDialog.open} onOpenChange={(open) => setWhatsappDialog((prev) => ({ ...prev, open }))}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שליחת קישור חתימה בוואטסאפ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClientSelector />
            <div>
              <Label>שם הלקוח</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="לדוגמה: ישראל ישראלי" />
            </div>
            <div>
              <Label>מספר טלפון <span className="text-destructive">*</span></Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="050-1234567" dir="ltr" />
            </div>
            <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">תצוגה מקדימה:</p>
              <p className="whitespace-pre-line">
                {`היי ${clientName.trim() || "לקוח/ה יקר/ה"}, מצורף ${whatsappDialog.docTitle} לחתימה:\n[קישור לחתימה]\n\nבברכה,\nעו"ד איתן לוז`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Send className="h-4 w-4" />
              שלח בוואטסאפ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog((prev) => ({ ...prev, open }))}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שליחת קישור חתימה במייל</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClientSelector />
            <div>
              <Label>שם הלקוח</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="לדוגמה: ישראל ישראלי" />
            </div>
            <div>
              <Label>כתובת מייל <span className="text-destructive">*</span></Label>
              <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="example@email.com" dir="ltr" type="email" />
            </div>
            <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">תצוגה מקדימה:</p>
              <p className="whitespace-pre-line">
                {`היי ${clientName.trim() || "לקוח/ה יקר/ה"},\n\nמצורף ${emailDialog.docTitle} לחתימה:\n[קישור לחתימה]\n\nבברכה,\nעו"ד איתן לוז`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Mail className="h-4 w-4" />
              שלח במייל
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Counter-Sign Dialog */}
      <Dialog
        open={counterSignDialog.open}
        onOpenChange={(open) => {
          if (!open) sigPadRef.current = null;
          setCounterSignDialog((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>חתימת עו"ד - {counterSignDialog.docTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              חתום על המסמך כדי ליצור קובץ סופי עם שתי החתימות
            </p>
            <div>
              <Label>החתימה שלך</Label>
              <canvas
                ref={sigCanvasCallback}
                width={450}
                height={180}
                className="border border-border rounded w-full"
                style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 50% / 16px 16px" }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => sigPadRef.current?.clear()}
              >
                נקה חתימה
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCounterSign}
              disabled={counterSigning}
              className="bg-gradient-gold text-primary-foreground gap-2"
            >
              {counterSigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" />
                  חתום וצור PDF סופי
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Signed PDF Dialog */}
      <Dialog open={sendSignedDialog.open} onOpenChange={(open) => setSendSignedDialog((prev) => ({ ...prev, open }))}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              שליחת מסמך חתום {sendSignedDialog.mode === "whatsapp" ? "בוואטסאפ" : "במייל"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ClientSelector />
            <div>
              <Label>שם הלקוח</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="לדוגמה: ישראל ישראלי" />
            </div>
            {sendSignedDialog.mode === "whatsapp" ? (
              <div>
                <Label>מספר טלפון <span className="text-destructive">*</span></Label>
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="050-1234567" dir="ltr" />
              </div>
            ) : (
              <div>
                <Label>כתובת מייל <span className="text-destructive">*</span></Label>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="example@email.com" dir="ltr" type="email" />
              </div>
            )}
          </div>
          <DialogFooter>
            {sendSignedDialog.mode === "whatsapp" ? (
              <Button onClick={handleSendSignedWhatsApp} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Send className="h-4 w-4" />
                שלח בוואטסאפ
              </Button>
            ) : (
              <Button onClick={handleSendSignedEmail} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Mail className="h-4 w-4" />
                שלח במייל
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsTab;
