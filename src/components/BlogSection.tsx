import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tag: string;
  image_url?: string | null;
}

const defaultPosts: BlogPost[] = [
  {
    id: "pagal-basti",
    title: "Pagal Basti: Exploring Love, Ego, and Existential Madness",
    date: "July 21, 2026",
    excerpt: "Set against the scenic backdrops of Pokhara and the remote Himalayan village of Ghandruk," +
      " the narrative begins through the eyes of a curious journalist drawn to tales of an isolated, unconventional community. Sarubhakta uses an experimental storytelling structure: starting as a " +
      "first-person journalistic account of a mysterious haven, the story gradually shifts into a deep, third-person psychological character study that breaks standard literary conventions.",
    tag: "Review of novel pagal-Basti",
  },
  {
    id: "building-rest-apis",
    title: "Building REST APIs with Node.js",
    date: "Feb 28, 2026",
    excerpt: "Step-by-step walkthrough of creating scalable RESTful APIs using Express.js and PostgreSQL.",
    tag: "Backend",
  },
  {
    id: "iot-journey",
    title: "My Journey into IoT with Arduino",
    date: "Jan 10, 2026",
    excerpt: "How I built my first IoT project — a smart sensor dashboard connected to the cloud.",
    tag: "IoT",
  },
];

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>(supabase ? [] : defaultPosts);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    const loadPosts = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, date, excerpt, tag, image_path")
        .eq("published", true)
        .order("date", { ascending: false });

      if (error) {
        setLoadError(`Could not load blog posts: ${error.message}`);
        setLoading(false);
        return;
      }

      const mediaErrors: string[] = [];
      const postsWithMedia = await Promise.all((data ?? []).map(async (post) => {
        let image_url: string | null = null;
        if (post.image_path) {
          const { data: image, error: imageError } = await supabase.storage
            .from("portfolio-media")
            .createSignedUrl(post.image_path, 3600);
          if (imageError) mediaErrors.push(`Could not load image for "${post.title}": ${imageError.message}`);
          else image_url = image.signedUrl;
        }
        return {
          ...post,
          image_url,
          date: new Date(`${post.date}T00:00:00`).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }));
      setLoadError(mediaErrors.join(" "));
      setPosts(postsWithMedia);
      setLoading(false);
    };

    void loadPosts();
  }, []);

  return (
    <section id="blog" className="py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">Blog</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Latest <span className="gradient-text">thoughts</span>
          </h2>
        </motion.div>

        {loadError && <p role="status" className="mb-6 text-sm text-destructive">{loadError}</p>}
        {loading && <p className="mb-6 text-sm text-muted-foreground">Loading blog posts…</p>}
        {!loading && !loadError && posts.length === 0 && (
          <p className="mb-6 text-sm text-muted-foreground">No published blog posts yet.</p>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 cursor-pointer"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  loading="lazy"
                  className="mb-5 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <span className="inline-block font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded mb-4">
                {post.tag}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
                <ArrowRight className="w-3 h-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
