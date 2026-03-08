import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, CalendarDays, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, addDays, isBefore, startOfDay, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import logoLight from "@/assets/logo-light.png";

type DayAvailability = { enabled: boolean; start: string; end: string };
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

function generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  for (let m = startMin; m < endMin; m += duration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

const BookAppointment: React.FC = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHe = language === "he";

  const [step, setStep] = useState<"date" | "time" | "details" | "done">("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", description: "" });
  const [availability, setAvailability] = useState<AvailabilityConfig>(DEFAULT_AVAILABILITY);
  const [slotDuration, setSlotDuration] = useState(30);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load availability config
  useEffect(() => {
    const loadConfig = async () => {
      const [availRes, slotRes] = await Promise.all([
        supabase.from("admin_settings" as any).select("value").eq("key", "availability").single(),
        supabase.from("admin_settings" as any).select("value").eq("key", "slot_duration").single(),
      ]);
      if (availRes.data) {
        try { setAvailability(JSON.parse((availRes.data as any).value)); } catch {}
      }
      if (slotRes.data) {
        try { setSlotDuration(Number((slotRes.data as any).value) || 30); } catch {}
      }
      setLoadingConfig(false);
    };
    loadConfig();
  }, []);

  // Load booked slots for selected date
  useEffect(() => {
    if (!selectedDate) return;
    const loadSlots = async () => {
      setLoadingSlots(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("appointment_date", dateStr)
        .eq("status", "scheduled");
      if (data) {
        const taken = data.map((a: any) => a.start_time.slice(0, 5));
        setBookedSlots(taken);
      }
      setLoadingSlots(false);
    };
    loadSlots();
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayConfig = availability[selectedDate.getDay()];
    if (!dayConfig?.enabled) return [];
    const allSlots = generateTimeSlots(dayConfig.start, dayConfig.end, slotDuration);
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    return allSlots.filter((slot) => {
      if (bookedSlots.includes(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(":").map(Number);
        const slotTime = new Date(selectedDate);
        slotTime.setHours(h, m, 0, 0);
        if (isBefore(slotTime, now)) return false;
      }
      return true;
    });
  }, [selectedDate, bookedSlots, availability, slotDuration]);

  const isWorkingDay = (date: Date) => {
    const dayConfig = availability[date.getDay()];
    return dayConfig?.enabled ?? false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !form.name.trim() || !form.phone.trim()) {
      toast({ title: isHe ? "נא למלא שם וטלפון" : "Please fill name and phone", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert({
          full_name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          status: "potential",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Calculate end time
      const [h, m] = selectedTime.split(":").map(Number);
      const endMinutes = h * 60 + m + slotDuration;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      // Create appointment
      const { error: apptError } = await supabase
        .from("appointments")
        .insert({
          client_id: clientData.id,
          title: isHe ? `פגישת ייעוץ - ${form.name.trim()}` : `Consultation - ${form.name.trim()}`,
          description: form.description.trim() || null,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          end_time: endTime,
          status: "scheduled",
        });

      if (apptError) throw apptError;

      setStep("done");

      // Open WhatsApp with confirmation message for admin
      const adminPhone = "972501234567"; // TODO: replace with your actual number
      const dateFormatted = format(selectedDate, "dd/MM/yyyy");
      const msg = isHe
        ? `שלום, קבעתי פגישת ייעוץ:\n📅 תאריך: ${dateFormatted}\n🕐 שעה: ${selectedTime}\n👤 שם: ${form.name.trim()}\n📞 טלפון: ${form.phone.trim()}${form.description.trim() ? `\n📋 נושא: ${form.description.trim()}` : ""}`
        : `Hi, I booked a consultation:\n📅 Date: ${dateFormatted}\n🕐 Time: ${selectedTime}\n👤 Name: ${form.name.trim()}\n📞 Phone: ${form.phone.trim()}${form.description.trim() ? `\n📋 Subject: ${form.description.trim()}` : ""}`;
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    } catch (err: any) {
      console.error("Booking error:", err);
      toast({
        title: isHe ? "שגיאה בקביעת הפגישה" : "Booking error",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = startOfDay(new Date());
  const maxDate = addDays(minDate, 60);

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isHe ? "rtl" : "ltr"}>
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">
            {isHe ? "הפגישה נקבעה בהצלחה!" : "Appointment Booked!"}
          </h1>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2 text-right">
            <p className="text-foreground font-medium">
              <CalendarDays className="h-4 w-4 inline ml-2" />
              {format(selectedDate!, "EEEE, d בMMMM yyyy", { locale: he })}
            </p>
            <p className="text-foreground font-medium">
              <Clock className="h-4 w-4 inline ml-2" />
              {selectedTime}
            </p>
          </div>
          <p className="text-muted-foreground">
            {isHe ? "ניצור איתך קשר לאישור הפגישה. תודה!" : "We'll contact you to confirm. Thank you!"}
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowRight className="h-4 w-4 ml-1" />
            {isHe ? "חזרה לאתר" : "Back to site"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isHe ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoLight} alt="Logo" className="h-10" />
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {isHe ? "קביעת פגישת ייעוץ" : "Book a Consultation"}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["date", "time", "details"].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  step === s || (s === "date" && step !== "date")
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-12 h-0.5 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step: Date */}
        {step === "date" && (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {isHe ? "בחר תאריך" : "Select a Date"}
            </h2>
            <p className="text-muted-foreground text-center">
              {isHe ? "ימים א׳-ה׳, 09:00-17:00" : "Sun-Thu, 09:00-17:00"}
            </p>
            <div className="bg-card border border-border rounded-xl p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  isBefore(date, minDate) ||
                  isBefore(maxDate, date) ||
                  !isWorkingDay(date)
                }
                locale={he}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {isHe ? "בחר שעה" : "Select a Time"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setStep("date")}>
                {isHe ? "← שנה תאריך" : "← Change date"}
              </Button>
            </div>
            <p className="text-muted-foreground">
              {format(selectedDate, "EEEE, d בMMMM yyyy", { locale: he })}
            </p>

            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isHe ? "אין שעות פנויות ביום זה" : "No available slots on this day"}
                </p>
                <Button variant="outline" className="mt-3" onClick={() => setStep("date")}>
                  {isHe ? "בחר תאריך אחר" : "Choose another date"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    className={cn(
                      "h-12 text-base font-medium",
                      selectedTime === slot && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleTimeSelect(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && selectedDate && selectedTime && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {isHe ? "פרטים אישיים" : "Your Details"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setStep("time")}>
                {isHe ? "← שנה שעה" : "← Change time"}
              </Button>
            </div>

            {/* Summary card */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-4">
              <CalendarDays className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE, d בMMMM yyyy", { locale: he })}
                </p>
                <p className="text-muted-foreground">{isHe ? `שעה ${selectedTime}` : `At ${selectedTime}`}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{isHe ? "שם מלא" : "Full Name"} <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={isHe ? "ישראל ישראלי" : "John Doe"}
                />
              </div>
              <div>
                <Label>{isHe ? "טלפון" : "Phone"} <span className="text-destructive">*</span></Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>{isHe ? "אימייל" : "Email"}</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  dir="ltr"
                  type="email"
                />
              </div>
              <div>
                <Label>{isHe ? "נושא הפגישה" : "Subject"}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={isHe ? "תאר בקצרה את הנושא..." : "Briefly describe the topic..."}
                  rows={3}
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim() || !form.phone.trim()}
              className="w-full bg-gradient-gold text-primary-foreground text-lg h-13"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  {isHe ? "קובע פגישה..." : "Booking..."}
                </>
              ) : (
                <>
                  <CalendarDays className="h-5 w-5 ml-2" />
                  {isHe ? "קבע פגישה" : "Book Appointment"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
