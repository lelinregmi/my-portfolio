import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    tech: "React · Node.js · PostgreSQL",
    desc: "Full-stack web application with payment integration, inventory management, and analytics dashboard.",
  },
  {
    title: "Portfolio & Blog CMS",
    tech: "Next.js · Tailwind · Supabase",
    desc: "Custom content management system with markdown support, SEO optimization, and dynamic theming.",
  },
  {
    title: "IoT Smart Dashboard",
    tech: "React · MQTT · Arduino",
    desc: "Web dashboard for monitoring IoT sensor data in real-time with alerts and data visualization.",
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 md:py-32 bg-card/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">Projects</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Selected <span className="gradient-text">work</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative p-8 rounded-xl border border-border bg-background hover:border-primary/40 transition-all duration-300"
            >
              <p className="font-mono text-xs text-primary mb-4">{project.tech}</p>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:gradient-text transition-all">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{project.desc}</p>
              <div className="flex gap-3 text-muted-foreground">
                <Github className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
                <ExternalLink className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
