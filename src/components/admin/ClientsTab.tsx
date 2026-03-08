import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Search, User, Phone, Mail, FileText, ChevronDown, ChevronUp } from "lucide-react";
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

type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const ClientsTab: React.FC = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setClients(data as Client[]);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const saveClient = async () => {
    if (!editingClient?.full_name?.trim()) {
      toast({ title: "נא להזין שם לקוח", variant: "destructive" });
      return;
    }

    const payload = {
      full_name: editingClient.full_name,
      email: editingClient.email || null,
      phone: editingClient.phone || null,
      id_number: editingClient.id_number || null,
      address: editingClient.address || null,
      notes: editingClient.notes || null,
      status: editingClient.status || "active",
    };

    if (editingClient.id) {
      const { error } = await supabase.from("clients").update(payload).eq("id", editingClient.id);
      if (error) {
        toast({ title: "שגיאה בעדכון", variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase.from("clients").insert(payload);
      if (error) {
        toast({ title: "שגיאה ביצירת לקוח", variant: "destructive" });
        return;
      }
    }

    toast({ title: "נשמר בהצלחה" });
    setDialogOpen(false);
    setEditingClient(null);
    loadClients();
  };

  const deleteClient = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    toast({ title: "הלקוח נמחק" });
    loadClients();
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.id_number?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600 text-white">פעיל</Badge>;
      case "inactive":
        return <Badge variant="secondary">לא פעיל</Badge>;
      case "potential":
        return <Badge className="bg-blue-600 text-white">פוטנציאלי</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <p className="text-muted-foreground">טוען לקוחות...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">ניהול לקוחות</h2>
        <Button
          onClick={() => {
            setEditingClient({ status: "active" });
            setDialogOpen(true);
          }}
          className="bg-gradient-gold text-primary-foreground"
        >
          <Plus className="h-4 w-4 ml-1" />
          לקוח חדש
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון, מייל, ת.ז..."
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="active">פעיל</SelectItem>
            <SelectItem value="inactive">לא פעיל</SelectItem>
            <SelectItem value="potential">פוטנציאלי</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filteredClients.length} לקוחות</p>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{client.full_name}</span>
                {statusBadge(client.status)}
              </div>
              <div className="flex items-center gap-2">
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3 w-3" /> {client.phone}
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary">
                    <Mail className="h-3 w-3" /> {client.email}
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                >
                  {expandedId === client.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {expandedId === client.id && (
              <div className="mt-4 pt-3 border-t border-border space-y-2">
                {client.id_number && (
                  <p className="text-sm"><span className="text-muted-foreground">ת.ז:</span> {client.id_number}</p>
                )}
                {client.address && (
                  <p className="text-sm"><span className="text-muted-foreground">כתובת:</span> {client.address}</p>
                )}
                {client.notes && (
                  <div className="bg-muted/30 rounded p-3 text-sm">
                    <span className="text-muted-foreground font-medium">הערות:</span>
                    <p className="mt-1 whitespace-pre-line">{client.notes}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  נוצר: {new Date(client.created_at).toLocaleDateString("he-IL")} | 
                  עודכן: {new Date(client.updated_at).toLocaleDateString("he-IL")}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingClient(client);
                      setDialogOpen(true);
                    }}
                  >
                    <Save className="h-3 w-3 ml-1" />
                    ערוך
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteClient(client.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredClients.length === 0 && (
          <p className="text-muted-foreground text-center py-8">לא נמצאו לקוחות</p>
        )}
      </div>

      {/* Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient?.id ? "עריכת לקוח" : "לקוח חדש"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם מלא <span className="text-destructive">*</span></Label>
              <Input
                value={editingClient?.full_name || ""}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>טלפון</Label>
                <Input
                  value={editingClient?.phone || ""}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, phone: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>אימייל</Label>
                <Input
                  value={editingClient?.email || ""}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, email: e.target.value }))}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ת.ז</Label>
                <Input
                  value={editingClient?.id_number || ""}
                  onChange={(e) => setEditingClient((prev) => ({ ...prev, id_number: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>סטטוס</Label>
                <Select
                  value={editingClient?.status || "active"}
                  onValueChange={(v) => setEditingClient((prev) => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="inactive">לא פעיל</SelectItem>
                    <SelectItem value="potential">פוטנציאלי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>כתובת</Label>
              <Input
                value={editingClient?.address || ""}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea
                value={editingClient?.notes || ""}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveClient} className="bg-gradient-gold text-primary-foreground">
              <Save className="h-4 w-4 ml-1" />
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsTab;
