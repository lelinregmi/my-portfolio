import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { defaultProjects, type Project } from "@/lib/publicContent";

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>(supabase ? [] : defaultProjects);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, tech, description, github_url, live_url, image_path, video_path")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(`Could not load projects: ${error.message}`);
        setLoading(false);
        return;
      }

      const mediaErrors: string[] = [];
      const projectsWithMedia = await Promise.all((data ?? []).map(async (project) => {
        const [imageResult, videoResult] = await Promise.all([
          project.image_path
            ? supabase.storage.from("portfolio-media").createSignedUrl(project.image_path, 3600)
            : Promise.resolve({ data: null, error: null }),
          project.video_path
            ? supabase.storage.from("portfolio-media").createSignedUrl(project.video_path, 3600)
            : Promise.resolve({ data: null, error: null }),
        ]);
        if (imageResult.error) mediaErrors.push(`Could not load image for "${project.title}": ${imageResult.error.message}`);
        if (videoResult.error) mediaErrors.push(`Could not load demo video for "${project.title}": ${videoResult.error.message}`);
        return {
          id: project.id,
          title: project.title,
          tech: project.tech,
          desc: project.description,
          github_url: project.github_url,
          live_url: project.live_url,
          image_url: imageResult.data?.signedUrl ?? null,
          video_url: videoResult.data?.signedUrl ?? null,
        };
      }));
      setLoadError(mediaErrors.join(" "));
      setProjects(projectsWithMedia);
      setLoading(false);
    };

    void loadProjects();
  }, []);

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

        {loadError && <p role="status" className="mb-6 text-sm text-destructive">{loadError}</p>}
        {loading && <p className="mb-6 text-sm text-muted-foreground">Loading projects…</p>}
        {!loading && !loadError && projects.length === 0 && (
          <p className="mb-6 text-sm text-muted-foreground">No published projects yet.</p>
        )}
        <div className="grid gap-8 md:grid-cols-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative p-8 rounded-xl border border-border bg-background hover:border-primary/40 transition-all duration-300"
            >
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt=""
                  loading="lazy"
                  className="mb-6 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <p className="font-mono text-xs text-primary mb-4">{project.tech}</p>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:gradient-text transition-all">
                <Link to={`/projects/${project.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {project.title}
                </Link>
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{project.desc}</p>
              {project.desc.length > 180 && (
                <Link to={`/projects/${project.id}`} className="mt-2 mb-6 inline-block text-sm font-medium text-primary hover:underline">
                  See more
                </Link>
              )}
              <div className="flex gap-3 text-muted-foreground">
                {project.github_url ? (
                  <a href={project.github_url} target="_blank" rel="noreferrer" aria-label={`${project.title} source code`}>
                    <Github className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
                  </a>
                ) : <Github className="w-4 h-4" />}
                {project.live_url ? (
                  <a href={project.live_url} target="_blank" rel="noreferrer" aria-label={`${project.title} live demo`}>
                    <ExternalLink className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
                  </a>
                ) : <ExternalLink className="w-4 h-4" />}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
