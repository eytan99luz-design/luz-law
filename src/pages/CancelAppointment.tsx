import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarX, CheckCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import logoLight from "@/assets/logo-light.png";

type AppointmentInfo = {
  id: string;
  title: string;
  appointment_date: string;
  start_time: string;
  status: string;
};

const CancelAppointment: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHe = language === "he";

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) { setError("invalid"); setLoading(false); return; }
      const { data, error: err } = await (supabase
        .from("appointments") as any)
        .select("id, title, appointment_date, start_time, status, cancel_token")
        .eq("cancel_token", token)
        .single();

      if (err || !data) {
        setError("not_found");
      } else if ((data as any).status === "cancelled") {
        setCancelled(true);
      } else if ((data as any).status !== "scheduled") {
        setError("not_cancellable");
      } else {
        setAppointment(data as any);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    const { error: err } = await (supabase
      .from("appointments") as any)
      .update({ status: "cancelled" })
      .eq("cancel_token", token!)
      .eq("status", "scheduled");

    if (err) {
      toast({ title: isHe ? "שגיאה בביטול" : "Cancel error", variant: "destructive" });
    } else {
      setCancelled(true);
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isHe ? "rtl" : "ltr"}>
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoLight} alt="Logo" className="h-10" />
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {isHe ? "ביטול פגישה" : "Cancel Appointment"}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-md">
        {error === "not_found" && (
          <div className="text-center space-y-4">
            <CalendarX className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              {isHe ? "הפגישה לא נמצאה" : "Appointment not found"}
            </h2>
            <p className="text-muted-foreground">
              {isHe ? "הקישור אינו תקין או שהפגישה כבר נמחקה." : "The link is invalid or the appointment was removed."}
            </p>
          </div>
        )}

        {error === "not_cancellable" && (
          <div className="text-center space-y-4">
            <CalendarX className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              {isHe ? "לא ניתן לבטל פגישה זו" : "Cannot cancel this appointment"}
            </h2>
          </div>
        )}

        {cancelled && (
          <div className="text-center space-y-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              {isHe ? "הפגישה בוטלה בהצלחה" : "Appointment Cancelled"}
            </h2>
            <p className="text-muted-foreground">
              {isHe ? "תודה שהודעת לנו. נשמח לקבוע פגישה חדשה בעתיד." : "Thanks for letting us know. Feel free to book again."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowRight className="h-4 w-4 ml-1" />
                {isHe ? "חזרה לאתר" : "Back to site"}
              </Button>
              <Button onClick={() => navigate("/book")}>
                {isHe ? "קבע פגישה חדשה" : "Book new appointment"}
              </Button>
            </div>
          </div>
        )}

        {appointment && !cancelled && (
          <div className="space-y-6">
            <div className="text-center">
              <CalendarX className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">
                {isHe ? "ביטול פגישה" : "Cancel Appointment"}
              </h2>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <p className="font-semibold text-foreground">{appointment.title}</p>
              <p className="text-muted-foreground">
                📅 {format(parseISO(appointment.appointment_date), "EEEE, d בMMMM yyyy", { locale: he })}
              </p>
              <p className="text-muted-foreground">
                🕐 {appointment.start_time.slice(0, 5)}
              </p>
            </div>

            <p className="text-center text-muted-foreground">
              {isHe ? "האם אתה בטוח שברצונך לבטל פגישה זו?" : "Are you sure you want to cancel this appointment?"}
            </p>

            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : null}
                {isHe ? "כן, בטל את הפגישה" : "Yes, cancel appointment"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                {isHe ? "חזרה" : "Go back"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelAppointment;
