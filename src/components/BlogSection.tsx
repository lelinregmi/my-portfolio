import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Getting Started with React and TypeScript",
    date: "Mar 15, 2026",
    excerpt: "A beginner-friendly guide to setting up your first React project with TypeScript for type-safe development.",
    tag: "Web Dev",
  },
  {
    title: "Building REST APIs with Node.js",
    date: "Feb 28, 2026",
    excerpt: "Step-by-step walkthrough of creating scalable RESTful APIs using Express.js and PostgreSQL.",
    tag: "Backend",
  },
  {
    title: "My Journey into IoT with Arduino",
    date: "Jan 10, 2026",
    excerpt: "How I built my first IoT project — a smart sensor dashboard connected to the cloud.",
    tag: "IoT",
  },
];

const BlogSection = () => {
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

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 cursor-pointer"
            >
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
