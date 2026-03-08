import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title_he: string;
  title_en: string;
  slug: string;
  excerpt_he: string;
  excerpt_en: string;
  cover_image: string | null;
  published_at: string | null;
}

const BlogSection: React.FC = () => {
  const { language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title_he, title_en, slug, excerpt_he, excerpt_en, cover_image, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPosts(data as BlogPost[]);
      });
  }, []);

  if (posts.length === 0) return null;

  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <section id="blog" className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="container mx-auto px-4">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-4">
              {language === "he" ? "מאמרים" : "Articles"}
            </h2>
            <div className="w-12 h-0.5 bg-gradient-gold mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link to={`/blog/${post.slug}`} className="block group">
                  <div className="glass rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-gold h-full">
                    {post.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.cover_image}
                          alt={language === "he" ? post.title_he : post.title_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.published_at && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString(language === "he" ? "he-IL" : "en-US")}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {language === "he" ? post.title_he : post.title_en}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {language === "he" ? post.excerpt_he : post.excerpt_en}
                      </p>
                      <span className="text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        {language === "he" ? "קרא עוד" : "Read more"}
                        <Arrow className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
