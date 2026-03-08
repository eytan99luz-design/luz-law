import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Calendar, MessageSquare, PenTool, Clock, TrendingUp } from "lucide-react";

type DashboardStats = {
  totalClients: number;
  activeClients: number;
  totalDocuments: number;
  pendingSignatures: number;
  signedDocuments: number;
  upcomingAppointments: number;
  todayAppointments: number;
  unreadContacts: number;
  totalContacts: number;
  recentClients: { id: string; full_name: string; created_at: string }[];
  recentAppointments: { id: string; title: string; appointment_date: string; start_time: string; client_name: string }[];
  recentSubmissions: { id: string; signer_name: string | null; status: string; created_at: string; doc_title: string }[];
};

const DashboardTab: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [clientsRes, docsRes, subsRes, apptsRes, contactsRes] = await Promise.all([
        supabase.from("clients").select("id, full_name, status, created_at").order("created_at", { ascending: false }),
        supabase.from("documents").select("id, title"),
        supabase.from("document_submissions").select("id, signer_name, status, created_at, document_id"),
        supabase.from("appointments").select("id, title, appointment_date, start_time, client_id, status").order("appointment_date"),
        supabase.from("contact_submissions").select("id, name, is_read, created_at").order("created_at", { ascending: false }),
      ]);

      const clients = clientsRes.data || [];
      const docs = docsRes.data || [];
      const subs = subsRes.data || [];
      const appts = apptsRes.data || [];
      const contacts = contactsRes.data || [];

      // Build doc title map
      const docMap = new Map<string, string>();
      docs.forEach((d: any) => docMap.set(d.id, d.title));

      // Build client name map
      const clientMap = new Map<string, string>();
      clients.forEach((c: any) => clientMap.set(c.id, c.full_name));

      const upcomingAppts = appts.filter((a: any) => a.appointment_date >= today && a.status === "scheduled");
      const todayAppts = appts.filter((a: any) => a.appointment_date === today && a.status === "scheduled");

      setStats({
        totalClients: clients.length,
        activeClients: clients.filter((c: any) => c.status === "active").length,
        totalDocuments: docs.length,
        pendingSignatures: subs.filter((s: any) => s.status === "pending").length,
        signedDocuments: subs.filter((s: any) => s.status === "signed").length,
        upcomingAppointments: upcomingAppts.length,
        todayAppointments: todayAppts.length,
        unreadContacts: contacts.filter((c: any) => !c.is_read).length,
        totalContacts: contacts.length,
        recentClients: clients.slice(0, 5).map((c: any) => ({
          id: c.id,
          full_name: c.full_name,
          created_at: c.created_at,
        })),
        recentAppointments: upcomingAppts.slice(0, 5).map((a: any) => ({
          id: a.id,
          title: a.title,
          appointment_date: a.appointment_date,
          start_time: a.start_time,
          client_name: a.client_id ? clientMap.get(a.client_id) || "לא ידוע" : "ללא לקוח",
        })),
        recentSubmissions: subs.slice(0, 5).map((s: any) => ({
          id: s.id,
          signer_name: s.signer_name,
          status: s.status,
          created_at: s.created_at,
          doc_title: docMap.get(s.document_id) || "מסמך",
        })),
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-muted-foreground">טוען דשבורד...</p>;
  if (!stats) return null;

  const statCards = [
    { label: "לקוחות", value: stats.totalClients, sub: `${stats.activeClients} פעילים`, icon: Users, color: "text-blue-500" },
    { label: "פגישות היום", value: stats.todayAppointments, sub: `${stats.upcomingAppointments} קרובות`, icon: Calendar, color: "text-green-500" },
    { label: "ממתינים לחתימה", value: stats.pendingSignatures, sub: `${stats.signedDocuments} נחתמו`, icon: PenTool, color: "text-amber-500" },
    { label: "פניות שלא נקראו", value: stats.unreadContacts, sub: `${stats.totalContacts} סה"כ`, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">דשבורד</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            פגישות קרובות
          </h3>
          {stats.recentAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין פגישות קרובות</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.client_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.appointment_date).toLocaleDateString("he-IL")}
                    </p>
                    <p className="text-xs text-primary">{a.start_time.slice(0, 5)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            לקוחות אחרונים
          </h3>
          {stats.recentClients.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין לקוחות</p>
          ) : (
            <div className="space-y-2">
              {stats.recentClients.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <p className="font-medium text-foreground">{c.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("he-IL")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <PenTool className="h-4 w-4 text-amber-500" />
            הגשות אחרונות
          </h3>
          {stats.recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין הגשות</p>
          ) : (
            <div className="space-y-2">
              {stats.recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{s.doc_title}</p>
                    <p className="text-xs text-muted-foreground">{s.signer_name || "טרם מולא"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    s.status === "signed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {s.status === "signed" ? "נחתם" : "ממתין"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
