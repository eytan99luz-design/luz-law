import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Trash2, Save, MessageSquare, Star, HelpCircle, BarChart3, Eye, EyeOff, FileText } from "lucide-react";
import logoDark from "@/assets/logo-dark.jpg";

type Testimonial = {
  id?: string;
  name_he: string;
  name_en: string;
  text_he: string;
  text_en: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
};

type FAQ = {
  id?: string;
  question_he: string;
  question_en: string;
  answer_he: string;
  answer_en: string;
  is_active: boolean;
  sort_order: number;
};

type Stat = {
  id?: string;
  label_he: string;
  label_en: string;
  value: number;
  icon: string;
  sort_order: number;
};

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

type BlogPost = {
  id?: string;
  title_he: string;
  title_en: string;
  slug: string;
  excerpt_he: string;
  excerpt_en: string;
  content_he: string;
  content_en: string;
  cover_image: string;
  is_published: boolean;
  published_at: string;
  sort_order: number;
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/admin/login");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin/login");
      } else {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const [t, f, s, c, b] = await Promise.all([
      supabase.from("testimonials").select("*").order("sort_order"),
      supabase.from("faqs").select("*").order("sort_order"),
      supabase.from("stats").select("*").order("sort_order"),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("sort_order"),
    ]);
    if (t.data) setTestimonials(t.data as Testimonial[]);
    if (f.data) setFaqs(f.data as FAQ[]);
    if (s.data) setStats(s.data as Stat[]);
    if (c.data) setContacts(c.data as ContactSubmission[]);
    if (b.data) setBlogPosts(b.data as BlogPost[]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const saveTestimonial = async (item: Testimonial) => {
    const { id, ...data } = item;
    if (id) {
      await supabase.from("testimonials").update(data).eq("id", id);
    } else {
      await supabase.from("testimonials").insert(data);
    }
    toast({ title: "נשמר בהצלחה" });
    loadData();
  };

  const deleteTestimonial = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "נמחק בהצלחה" });
    loadData();
  };

  const saveFAQ = async (item: FAQ) => {
    const { id, ...data } = item;
    if (id) {
      await supabase.from("faqs").update(data).eq("id", id);
    } else {
      await supabase.from("faqs").insert(data);
    }
    toast({ title: "נשמר בהצלחה" });
    loadData();
  };

  const deleteFAQ = async (id: string) => {
    await supabase.from("faqs").delete().eq("id", id);
    toast({ title: "נמחק בהצלחה" });
    loadData();
  };

  const saveStat = async (item: Stat) => {
    const { id, ...data } = item;
    if (id) {
      await supabase.from("stats").update(data).eq("id", id);
    } else {
      await supabase.from("stats").insert(data);
    }
    toast({ title: "נשמר בהצלחה" });
    loadData();
  };

  const deleteStat = async (id: string) => {
    await supabase.from("stats").delete().eq("id", id);
    toast({ title: "נמחק בהצלחה" });
    loadData();
  };

  const saveBlogPost = async (item: BlogPost) => {
    const { id, ...data } = item;
    if (id) {
      await supabase.from("blog_posts").update(data).eq("id", id);
    } else {
      await supabase.from("blog_posts").insert(data);
    }
    toast({ title: "נשמר בהצלחה" });
    loadData();
  };

  const deleteBlogPost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "נמחק בהצלחה" });
    loadData();
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    await supabase.from("contact_submissions").update({ is_read: !isRead }).eq("id", id);
    loadData();
  };

  if (loading) {
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
            <img src={logoDark} alt="Logo" className="h-10 rounded" />
            <h1 className="text-xl font-bold text-gradient-gold">לוח ניהול</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-primary/30 text-primary">
              <Eye className="h-4 w-4 ml-1" />
              צפה באתר
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-destructive/30 text-destructive">
              <LogOut className="h-4 w-4 ml-1" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-primary/20">
              <MessageSquare className="h-4 w-4 ml-1" />
              פניות ({contacts.filter(c => !c.is_read).length})
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-primary/20">
              <Star className="h-4 w-4 ml-1" />
              המלצות
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-primary/20">
              <HelpCircle className="h-4 w-4 ml-1" />
              שאלות נפוצות
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20">
              <BarChart3 className="h-4 w-4 ml-1" />
              מספרים
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-primary/20">
              <FileText className="h-4 w-4 ml-1" />
              מאמרים
            </TabsTrigger>
          </TabsList>

          {/* Contact Submissions */}
          <TabsContent value="contacts" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">פניות מהאתר</h2>
            {contacts.length === 0 ? (
              <p className="text-muted-foreground">אין פניות עדיין</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className={`bg-card border rounded-lg p-4 ${c.is_read ? "border-border opacity-60" : "border-primary/30"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <span className="text-sm text-muted-foreground">{c.email}</span>
                          {c.phone && <span className="text-sm text-muted-foreground">{c.phone}</span>}
                        </div>
                        <p className="text-foreground">{c.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(c.created_at).toLocaleDateString("he-IL")} {new Date(c.created_at).toLocaleTimeString("he-IL")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRead(c.id, c.is_read)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {c.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">המלצות</h2>
              <Button
                onClick={() => setTestimonials([...testimonials, { name_he: "", name_en: "", text_he: "", text_en: "", rating: 5, is_active: true, sort_order: testimonials.length }])}
                className="bg-gradient-gold text-primary-foreground"
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף המלצה
              </Button>
            </div>
            <div className="space-y-4">
              {testimonials.map((item, idx) => (
                <div key={item.id || idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>שם (עברית)</Label>
                      <Input value={item.name_he} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], name_he: e.target.value }; setTestimonials(arr); }} />
                    </div>
                    <div>
                      <Label>Name (English)</Label>
                      <Input value={item.name_en} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], name_en: e.target.value }; setTestimonials(arr); }} />
                    </div>
                    <div>
                      <Label>טקסט (עברית)</Label>
                      <Textarea value={item.text_he} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], text_he: e.target.value }; setTestimonials(arr); }} />
                    </div>
                    <div>
                      <Label>Text (English)</Label>
                      <Textarea value={item.text_en} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], text_en: e.target.value }; setTestimonials(arr); }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label>דירוג</Label>
                      <Input type="number" min={1} max={5} value={item.rating} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], rating: Number(e.target.value) }; setTestimonials(arr); }} className="w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>פעיל</Label>
                      <Switch checked={item.is_active} onCheckedChange={(v) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], is_active: v }; setTestimonials(arr); }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>סדר</Label>
                      <Input type="number" value={item.sort_order} onChange={(e) => { const arr = [...testimonials]; arr[idx] = { ...arr[idx], sort_order: Number(e.target.value) }; setTestimonials(arr); }} className="w-20" />
                    </div>
                    <div className="flex-1" />
                    <Button size="sm" onClick={() => saveTestimonial(item)} className="bg-gradient-gold text-primary-foreground">
                      <Save className="h-4 w-4 ml-1" />
                      שמור
                    </Button>
                    {item.id && (
                      <Button size="sm" variant="destructive" onClick={() => deleteTestimonial(item.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">שאלות נפוצות</h2>
              <Button
                onClick={() => setFaqs([...faqs, { question_he: "", question_en: "", answer_he: "", answer_en: "", is_active: true, sort_order: faqs.length }])}
                className="bg-gradient-gold text-primary-foreground"
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף שאלה
              </Button>
            </div>
            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div key={item.id || idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>שאלה (עברית)</Label>
                      <Input value={item.question_he} onChange={(e) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], question_he: e.target.value }; setFaqs(arr); }} />
                    </div>
                    <div>
                      <Label>Question (English)</Label>
                      <Input value={item.question_en} onChange={(e) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], question_en: e.target.value }; setFaqs(arr); }} />
                    </div>
                    <div>
                      <Label>תשובה (עברית)</Label>
                      <Textarea value={item.answer_he} onChange={(e) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], answer_he: e.target.value }; setFaqs(arr); }} />
                    </div>
                    <div>
                      <Label>Answer (English)</Label>
                      <Textarea value={item.answer_en} onChange={(e) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], answer_en: e.target.value }; setFaqs(arr); }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label>פעיל</Label>
                      <Switch checked={item.is_active} onCheckedChange={(v) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], is_active: v }; setFaqs(arr); }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>סדר</Label>
                      <Input type="number" value={item.sort_order} onChange={(e) => { const arr = [...faqs]; arr[idx] = { ...arr[idx], sort_order: Number(e.target.value) }; setFaqs(arr); }} className="w-20" />
                    </div>
                    <div className="flex-1" />
                    <Button size="sm" onClick={() => saveFAQ(item)} className="bg-gradient-gold text-primary-foreground">
                      <Save className="h-4 w-4 ml-1" />
                      שמור
                    </Button>
                    {item.id && (
                      <Button size="sm" variant="destructive" onClick={() => deleteFAQ(item.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">מספרים וסטטיסטיקות</h2>
              <Button
                onClick={() => setStats([...stats, { label_he: "", label_en: "", value: 0, icon: "Award", sort_order: stats.length }])}
                className="bg-gradient-gold text-primary-foreground"
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף מספר
              </Button>
            </div>
            <div className="space-y-4">
              {stats.map((item, idx) => (
                <div key={item.id || idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>תווית (עברית)</Label>
                      <Input value={item.label_he} onChange={(e) => { const arr = [...stats]; arr[idx] = { ...arr[idx], label_he: e.target.value }; setStats(arr); }} />
                    </div>
                    <div>
                      <Label>Label (English)</Label>
                      <Input value={item.label_en} onChange={(e) => { const arr = [...stats]; arr[idx] = { ...arr[idx], label_en: e.target.value }; setStats(arr); }} />
                    </div>
                    <div>
                      <Label>ערך</Label>
                      <Input type="number" value={item.value} onChange={(e) => { const arr = [...stats]; arr[idx] = { ...arr[idx], value: Number(e.target.value) }; setStats(arr); }} />
                    </div>
                    <div>
                      <Label>אייקון</Label>
                      <Input value={item.icon} onChange={(e) => { const arr = [...stats]; arr[idx] = { ...arr[idx], icon: e.target.value }; setStats(arr); }} placeholder="Award, Users, Briefcase..." />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label>סדר</Label>
                      <Input type="number" value={item.sort_order} onChange={(e) => { const arr = [...stats]; arr[idx] = { ...arr[idx], sort_order: Number(e.target.value) }; setStats(arr); }} className="w-20" />
                    </div>
                    <div className="flex-1" />
                    <Button size="sm" onClick={() => saveStat(item)} className="bg-gradient-gold text-primary-foreground">
                      <Save className="h-4 w-4 ml-1" />
                      שמור
                    </Button>
                    {item.id && (
                      <Button size="sm" variant="destructive" onClick={() => deleteStat(item.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Blog */}
          <TabsContent value="blog" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">מאמרים</h2>
              <Button
                onClick={() => setBlogPosts([...blogPosts, { title_he: "", title_en: "", slug: "", excerpt_he: "", excerpt_en: "", content_he: "", content_en: "", cover_image: "", is_published: false, published_at: new Date().toISOString(), sort_order: blogPosts.length }])}
                className="bg-gradient-gold text-primary-foreground"
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף מאמר
              </Button>
            </div>
            <div className="space-y-4">
              {blogPosts.map((item, idx) => (
                <div key={item.id || idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>כותרת (עברית)</Label>
                      <Input value={item.title_he} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], title_he: e.target.value }; setBlogPosts(arr); }} />
                    </div>
                    <div>
                      <Label>Title (English)</Label>
                      <Input value={item.title_en} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], title_en: e.target.value }; setBlogPosts(arr); }} />
                    </div>
                    <div>
                      <Label>Slug (כתובת URL)</Label>
                      <Input value={item.slug} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], slug: e.target.value }; setBlogPosts(arr); }} placeholder="my-article" dir="ltr" />
                    </div>
                    <div>
                      <Label>תמונת כיסוי (URL)</Label>
                      <Input value={item.cover_image} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], cover_image: e.target.value }; setBlogPosts(arr); }} placeholder="https://..." dir="ltr" />
                    </div>
                    <div>
                      <Label>תקציר (עברית)</Label>
                      <Textarea value={item.excerpt_he} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], excerpt_he: e.target.value }; setBlogPosts(arr); }} rows={2} />
                    </div>
                    <div>
                      <Label>Excerpt (English)</Label>
                      <Textarea value={item.excerpt_en} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], excerpt_en: e.target.value }; setBlogPosts(arr); }} rows={2} />
                    </div>
                    <div>
                      <Label>תוכן (עברית)</Label>
                      <Textarea value={item.content_he} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], content_he: e.target.value }; setBlogPosts(arr); }} rows={6} />
                    </div>
                    <div>
                      <Label>Content (English)</Label>
                      <Textarea value={item.content_en} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], content_en: e.target.value }; setBlogPosts(arr); }} rows={6} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label>מפורסם</Label>
                      <Switch checked={item.is_published} onCheckedChange={(v) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], is_published: v }; setBlogPosts(arr); }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>סדר</Label>
                      <Input type="number" value={item.sort_order} onChange={(e) => { const arr = [...blogPosts]; arr[idx] = { ...arr[idx], sort_order: Number(e.target.value) }; setBlogPosts(arr); }} className="w-20" />
                    </div>
                    <div className="flex-1" />
                    <Button size="sm" onClick={() => saveBlogPost(item)} className="bg-gradient-gold text-primary-foreground">
                      <Save className="h-4 w-4 ml-1" />
                      שמור
                    </Button>
                    {item.id && (
                      <Button size="sm" variant="destructive" onClick={() => deleteBlogPost(item.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
