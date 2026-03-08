import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Post {
  id: string;
  title_he: string;
  title_en: string;
  content_he: string;
  content_en: string;
  cover_image: string | null;
  published_at: string | null;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
  }, [slug]);

  const Arrow = language === "he" ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">
          {language === "he" ? "טוען..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === "he" ? "המאמר לא נמצא" : "Article not found"}
          </h1>
          <Link to="/" className="text-primary hover:underline">
            {language === "he" ? "חזור לדף הבית" : "Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/#blog"
              className="inline-flex items-center gap-1 text-primary hover:underline mb-8 text-sm"
            >
              <Arrow className="h-4 w-4" />
              {language === "he" ? "חזרה למאמרים" : "Back to articles"}
            </Link>

            {post.cover_image && (
              <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-gold-lg">
                <img
                  src={post.cover_image}
                  alt={language === "he" ? post.title_he : post.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.published_at && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString(
                  language === "he" ? "he-IL" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-8 leading-tight">
              {language === "he" ? post.title_he : post.title_en}
            </h1>

            <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {language === "he" ? post.content_he : post.content_en}
            </div>
          </motion.div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
