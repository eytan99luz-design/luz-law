import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, Save, CheckCircle, GripVertical } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type Field = {
  id?: string;
  document_id: string;
  field_type: string;
  label: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  sort_order: number;
};

type DocInfo = {
  id: string;
  title: string;
  pdf_url: string;
  status: string;
};

const FIELD_TYPES = [
  { value: "text", label: "טקסט" },
  { value: "id_number", label: "מספר זהות" },
  { value: "date", label: "תאריך" },
  { value: "signature", label: "חתימה" },
];

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [doc, setDoc] = useState<DocInfo | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin/login");
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: docData } = await supabase.from("documents").select("*").eq("id", id).single();
      if (docData) setDoc(docData as DocInfo);

      const { data: fieldsData } = await supabase
        .from("document_fields")
        .select("*")
        .eq("document_id", id)
        .order("sort_order");
      if (fieldsData) setFields(fieldsData as Field[]);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!doc?.pdf_url) return;
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(doc.pdf_url).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
    };
    loadPdf();
  }, [doc?.pdf_url]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    setCanvasSize({ width: viewport.width, height: viewport.height });
    setScale(1.5);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const addField = (type: string) => {
    if (!id) return;
    const label = type === "signature" ? "חתימה" : type === "id_number" ? "מספר זהות" : type === "date" ? "תאריך" : "שדה חדש";
    setFields([
      ...fields,
      {
        document_id: id,
        field_type: type,
        label,
        page_number: currentPage,
        x: 50,
        y: 50,
        width: type === "signature" ? 200 : 180,
        height: type === "signature" ? 80 : 30,
        required: true,
        sort_order: fields.length,
      },
    ]);
  };

  const handleMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const field = fields[idx];
    setDragging(idx);
    setSelectedField(idx);
    setDragOffset({
      x: e.clientX - rect.left - field.x,
      y: e.clientY - rect.top - field.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasSize.width - fields[dragging].width, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(canvasSize.height - fields[dragging].height, e.clientY - rect.top - dragOffset.y));
    const arr = [...fields];
    arr[dragging] = { ...arr[dragging], x, y };
    setFields(arr);
  };

  const handleMouseUp = () => setDragging(null);

  const saveFields = async () => {
    if (!id) return;
    // Delete existing fields
    await supabase.from("document_fields").delete().eq("document_id", id);
    // Insert updated fields
    const toInsert = fields.map(({ id: fid, ...rest }) => rest);
    if (toInsert.length > 0) {
      const { error } = await supabase.from("document_fields").insert(toInsert);
      if (error) {
        toast({ title: "שגיאה בשמירת השדות", variant: "destructive" });
        return;
      }
    }
    // Activate document
    await supabase.from("documents").update({ status: "active" }).eq("id", id);
    toast({ title: "השדות נשמרו והמסמך הופעל!" });
    // Reload fields to get IDs
    const { data } = await supabase.from("document_fields").select("*").eq("document_id", id).order("sort_order");
    if (data) setFields(data as Field[]);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
    if (selectedField === idx) setSelectedField(null);
  };

  const updateField = (idx: number, updates: Partial<Field>) => {
    const arr = [...fields];
    arr[idx] = { ...arr[idx], ...updates };
    setFields(arr);
  };

  const pageFields = fields.filter((f) => f.page_number === currentPage);

  if (!doc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowRight className="h-4 w-4 ml-1" />
              חזרה
            </Button>
            <h1 className="text-lg font-bold text-foreground">{doc.title} - עריכת שדות</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={saveFields} className="bg-gradient-gold text-primary-foreground">
              <Save className="h-4 w-4 ml-1" />
              שמור והפעל
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4 shrink-0">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">הוסף שדה</h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((ft) => (
                <Button
                  key={ft.value}
                  size="sm"
                  variant="outline"
                  onClick={() => addField(ft.value)}
                  className="border-primary/30"
                >
                  <Plus className="h-3 w-3 ml-1" />
                  {ft.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  הקודם
                </Button>
                <span className="text-sm text-foreground">
                  עמוד {currentPage} מתוך {totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  הבא
                </Button>
              </div>
            </div>
          )}

          {/* Fields list */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground">שדות ({fields.length})</h3>
            {fields.map((f, idx) => (
              <div
                key={idx}
                className={`border rounded p-2 text-sm cursor-pointer transition-colors ${
                  selectedField === idx ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setSelectedField(idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{f.label}</span>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); removeField(idx); }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                <span className="text-muted-foreground text-xs">
                  {FIELD_TYPES.find((t) => t.value === f.field_type)?.label} | עמוד {f.page_number}
                </span>
              </div>
            ))}
          </div>

          {/* Selected field properties */}
          {selectedField !== null && fields[selectedField] && (
            <div className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">עריכת שדה</h3>
              <div>
                <Label>תווית</Label>
                <Input
                  value={fields[selectedField].label}
                  onChange={(e) => updateField(selectedField, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>סוג</Label>
                <Select
                  value={fields[selectedField].field_type}
                  onValueChange={(v) => updateField(selectedField, { field_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((ft) => (
                      <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>רוחב</Label>
                  <Input
                    type="number"
                    value={fields[selectedField].width}
                    onChange={(e) => updateField(selectedField, { width: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>גובה</Label>
                  <Input
                    type="number"
                    value={fields[selectedField].height}
                    onChange={(e) => updateField(selectedField, { height: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>שדה חובה</Label>
                <Switch
                  checked={fields[selectedField].required}
                  onCheckedChange={(v) => updateField(selectedField, { required: v })}
                />
              </div>
            </div>
          )}
        </div>

        {/* PDF Canvas */}
        <div className="flex-1 overflow-auto">
          <div
            ref={containerRef}
            className="relative inline-block border border-border rounded-lg overflow-hidden bg-white"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} />
            {/* Field overlays */}
            {pageFields.map((field, _) => {
              const idx = fields.indexOf(field);
              return (
                <div
                  key={idx}
                  className={`absolute border-2 rounded cursor-move flex items-center justify-center text-xs font-medium transition-colors ${
                    field.field_type === "signature"
                      ? "border-primary/70 bg-primary/10"
                      : "border-blue-500/70 bg-blue-50/50"
                  } ${selectedField === idx ? "ring-2 ring-primary" : ""}`}
                  style={{
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, idx)}
                >
                  <span className="pointer-events-none select-none text-foreground/70 truncate px-1">
                    {field.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
