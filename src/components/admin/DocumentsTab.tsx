import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Link2, Copy, Eye, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  created_at: string;
};

const DocumentsTab: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (docs) {
      // Load submissions for each document
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
  }, []);

  const handleUploadPDF = async () => {
    if (!selectedFile || !newTitle.trim()) {
      toast({ title: "נא למלא כותרת ולבחור קובץ", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}_${selectedFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    }
    setUploading(false);
    loadDocuments();
  };

  const deleteDocument = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    toast({ title: "המסמך נמחק" });
    loadDocuments();
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
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleUploadPDF}
                disabled={uploading || !newTitle.trim()}
                className="file:ml-2 file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:text-sm"
              />
            </div>
          </div>
        </div>
        {uploading && <p className="text-sm text-muted-foreground animate-pulse">מעלה...</p>}
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
                    {doc.submissions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-muted/30 rounded p-2 text-sm flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {statusBadge(sub.status)}
                          <span>{sub.signer_name || "לא מילא עדיין"}</span>
                          {sub.signer_email && <span className="text-muted-foreground">{sub.signer_email}</span>}
                          <span className="text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString("he-IL")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
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
                          {sub.signed_pdf_url && (
                            <a href={sub.signed_pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="text-green-600">
                                <FileText className="h-3 w-3 ml-1" />
                                PDF חתום
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
