import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Calendar, Clock, MapPin, CheckCircle, XCircle, Settings } from "lucide-react";
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

type Client = { id: string; full_name: string };

type Appointment = {
  id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string | null;
  created_at: string;
  client_name?: string;
};

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type DayAvailability = {
  enabled: boolean;
  start: string;
  end: string;
};

type AvailabilityConfig = Record<number, DayAvailability>;

const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  0: { enabled: true, start: "09:00", end: "17:00" },
  1: { enabled: true, start: "09:00", end: "17:00" },
  2: { enabled: true, start: "09:00", end: "17:00" },
  3: { enabled: true, start: "09:00", end: "17:00" },
  4: { enabled: true, start: "09:00", end: "17:00" },
  5: { enabled: false, start: "09:00", end: "13:00" },
  6: { enabled: false, start: "09:00", end: "13:00" },
};

const AppointmentsTab: React.FC = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Appointment> | null>(null);
  const [viewMode, setViewMode] = useState<"upcoming" | "past" | "all">("upcoming");
  const [availability, setAvailability] = useState<AvailabilityConfig>(DEFAULT_AVAILABILITY);
  const [slotDuration, setSlotDuration] = useState(30);
  const [savingAvail, setSavingAvail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [appts, cls, availSetting, slotSetting] = await Promise.all([
      supabase.from("appointments").select("*").order("appointment_date", { ascending: true }),
      supabase.from("clients").select("id, full_name").order("full_name"),
      supabase.from("admin_settings" as any).select("value").eq("key", "availability").single(),
      supabase.from("admin_settings" as any).select("value").eq("key", "slot_duration").single(),
    ]);

    if (availSetting.data) {
      try { setAvailability(JSON.parse((availSetting.data as any).value)); } catch {}
    }
    if (slotSetting.data) {
      try { setSlotDuration(Number((slotSetting.data as any).value) || 30); } catch {}
    }

    const clientMap = new Map<string, string>();
    if (cls.data) {
      setClients(cls.data as Client[]);
      cls.data.forEach((c: any) => clientMap.set(c.id, c.full_name));
    }

    if (appts.data) {
      setAppointments(
        (appts.data as any[]).map((a) => ({
          ...a,
          client_name: a.client_id ? clientMap.get(a.client_id) || "לא ידוע" : "ללא לקוח",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAppointment = async () => {
    if (!editing?.title?.trim() || !editing?.appointment_date || !editing?.start_time || !editing?.end_time) {
      toast({ title: "נא למלא את כל שדות החובה", variant: "destructive" });
      return;
    }

    const payload = {
      client_id: editing.client_id || null,
      title: editing.title,
      description: editing.description || null,
      appointment_date: editing.appointment_date,
      start_time: editing.start_time,
      end_time: editing.end_time,
      status: editing.status || "scheduled",
      location: editing.location || null,
    };

    if (editing.id) {
      const { error } = await supabase.from("appointments").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "שגיאה בעדכון", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("appointments").insert(payload);
      if (error) { toast({ title: "שגיאה ביצירת פגישה", variant: "destructive" }); return; }
    }

    toast({ title: "נשמר בהצלחה" });
    setDialogOpen(false);
    setEditing(null);
    loadData();
  };

  const deleteAppointment = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    toast({ title: "הפגישה נמחקה" });
    loadData();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadData();
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = appointments.filter((a) => {
    if (viewMode === "upcoming") return a.appointment_date >= today;
    if (viewMode === "past") return a.appointment_date < today;
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge className="bg-blue-600 text-white">מתוכנן</Badge>;
      case "completed": return <Badge className="bg-green-600 text-white">הושלם</Badge>;
      case "cancelled": return <Badge variant="destructive">בוטל</Badge>;
      case "no_show": return <Badge variant="secondary">לא הגיע</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <p className="text-muted-foreground">טוען פגישות...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">יומן פגישות</h2>
        <Button
          onClick={() => {
            setEditing({ status: "scheduled", appointment_date: today, start_time: "09:00", end_time: "10:00" });
            setDialogOpen(true);
          }}
          className="bg-gradient-gold text-primary-foreground"
        >
          <Plus className="h-4 w-4 ml-1" />
          פגישה חדשה
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {(["upcoming", "past", "all"] as const).map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={viewMode === mode ? "default" : "outline"}
            onClick={() => setViewMode(mode)}
          >
            {mode === "upcoming" ? "קרובות" : mode === "past" ? "עבר" : "הכל"}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} פגישות</p>

      {/* Appointments grouped by date */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">אין פגישות</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt.id} className={`bg-card border rounded-lg p-4 ${
              appt.status === "cancelled" ? "border-destructive/30 opacity-60" : "border-border"
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{appt.title}</span>
                    {statusBadge(appt.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(appt.appointment_date).toLocaleDateString("he-IL")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                    </span>
                    {appt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appt.location}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary">{appt.client_name}</p>
                  {appt.description && <p className="text-sm text-muted-foreground">{appt.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {appt.status === "scheduled" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus(appt.id, "completed")} title="סמן כהושלם">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(appt.id, "cancelled")} title="בטל">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(appt);
                      setDialogOpen(true);
                    }}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAppointment(appt.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "עריכת פגישה" : "פגישה חדשה"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>כותרת <span className="text-destructive">*</span></Label>
              <Input
                value={editing?.title || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="לדוגמה: פגישת ייעוץ ראשונית"
              />
            </div>
            <div>
              <Label>לקוח</Label>
              <Select
                value={editing?.client_id || "none"}
                onValueChange={(v) => setEditing((prev) => ({ ...prev, client_id: v === "none" ? undefined : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ללא לקוח</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>תאריך <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={editing?.appointment_date || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, appointment_date: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>שעת התחלה <span className="text-destructive">*</span></Label>
                <Input
                  type="time"
                  value={editing?.start_time || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, start_time: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>שעת סיום <span className="text-destructive">*</span></Label>
                <Input
                  type="time"
                  value={editing?.end_time || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, end_time: e.target.value }))}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>מיקום</Label>
                <Input
                  value={editing?.location || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="משרד / זום / בית הלקוח"
                />
              </div>
              <div>
                <Label>סטטוס</Label>
                <Select
                  value={editing?.status || "scheduled"}
                  onValueChange={(v) => setEditing((prev) => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">מתוכנן</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                    <SelectItem value="no_show">לא הגיע</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>תיאור</Label>
              <Textarea
                value={editing?.description || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveAppointment} className="bg-gradient-gold text-primary-foreground">
              <Save className="h-4 w-4 ml-1" />
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsTab;
