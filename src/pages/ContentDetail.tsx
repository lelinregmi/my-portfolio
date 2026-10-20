import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, ExternalLink, Github } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { defaultPosts, defaultProjects, type BlogPost, type Project } from "@/lib/publicContent";
import { supabase } from "@/lib/supabase";

interface ContentDetailProps {
  kind: "blog" | "project";
}

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const ContentDetail = ({ kind }: ContentDetailProps) => {
  const { contentId } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    setBlog(null);
    setProject(null);
    setLoadError("");
    setLoading(true);

    const loadContent = async () => {
      if (!supabase) {
        if (kind === "blog") {
          setBlog(defaultPosts.find((post) => post.id === contentId) ?? null);
        } else {
          setProject(defaultProjects.find((item) => item.id === contentId) ?? null);
        }
        setLoading(false);
        return;
      }

      if (kind === "blog") {
        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, date, excerpt, tag, image_path")
          .eq("id", contentId ?? "")
          .eq("published", true)
          .maybeSingle();
        if (!active) return;
        if (error) {
          setLoadError(`Could not load blog post: ${error.message}`);
          setLoading(false);
          return;
        }
        if (!data) {
          setLoading(false);
          return;
        }

        let imageUrl: string | null = null;
        if (data.image_path) {
          const { data: image, error: imageError } = await supabase.storage
            .from("portfolio-media")
            .createSignedUrl(data.image_path, 3600);
          if (!active) return;
          if (imageError) setLoadError(`Could not load image for "${data.title}": ${imageError.message}`);
          else imageUrl = image.signedUrl;
        }
        setBlog({
          id: data.id,
          title: data.title,
          date: formatDate(data.date),
          excerpt: data.excerpt,
          tag: data.tag,
          image_url: imageUrl,
        });
      } else {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title, tech, description, github_url, live_url, image_path, video_path")
          .eq("id", contentId ?? "")
          .eq("published", true)
          .maybeSingle();
        if (!active) return;
        if (error) {
          setLoadError(`Could not load project: ${error.message}`);
          setLoading(false);
          return;
        }
        if (!data) {
          setLoading(false);
          return;
        }

        const [imageResult, videoResult] = await Promise.all([
          data.image_path
            ? supabase.storage.from("portfolio-media").createSignedUrl(data.image_path, 3600)
            : Promise.resolve({ data: null, error: null }),
          data.video_path
            ? supabase.storage.from("portfolio-media").createSignedUrl(data.video_path, 3600)
            : Promise.resolve({ data: null, error: null }),
        ]);
        if (!active) return;
        const mediaErrors = [
          imageResult.error && `Could not load project image: ${imageResult.error.message}`,
          videoResult.error && `Could not load project video: ${videoResult.error.message}`,
        ].filter(Boolean);
        if (mediaErrors.length) setLoadError(mediaErrors.join(" "));
        setProject({
          id: data.id,
          title: data.title,
          tech: data.tech,
          desc: data.description,
          github_url: data.github_url,
          live_url: data.live_url,
          image_url: imageResult.data?.signedUrl ?? null,
          video_url: videoResult.data?.signedUrl ?? null,
        });
      }

      if (active) setLoading(false);
    };

    void loadContent();
    return () => {
      active = false;
    };
  }, [contentId, kind]);

  const title = kind === "blog" ? blog?.title : project?.title;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
        <Link
          to={kind === "blog" ? "/#blog" : "/#projects"}
          className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {kind === "blog" ? "blog" : "projects"}
        </Link>

        {loading ? (
          <p className="text-muted-foreground">Loading {kind}…</p>
        ) : loadError && !title ? (
          <p role="status" className="text-sm text-destructive">{loadError}</p>
        ) : title ? (
          <article>
            {kind === "blog" && blog ? (
              <>
                <span className="mb-4 inline-block rounded bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                  {blog.tag}
                </span>
                <h1 className="mb-5 text-3xl font-bold text-foreground sm:text-5xl">{blog.title}</h1>
                <p className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {blog.date}
                </p>
                {blog.image_url && (
                  <img src={blog.image_url} alt="" className="mb-8 aspect-video w-full rounded-xl object-cover" />
                )}
                <div className="whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground">
                  {blog.excerpt}
                </div>
              </>
            ) : project ? (
              <>
                <p className="mb-4 font-mono text-sm text-primary">{project.tech}</p>
                <h1 className="mb-8 text-3xl font-bold text-foreground sm:text-5xl">{project.title}</h1>
                {project.image_url && (
                  <img src={project.image_url} alt="" className="mb-8 aspect-video w-full rounded-xl object-cover" />
                )}
                <div className="mb-8 whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground">
                  {project.desc}
                </div>
                {project.video_url && (
                  <video src={project.video_url} controls preload="metadata" className="mb-8 aspect-video w-full rounded-xl bg-black">
                    Your browser does not support embedded video.
                  </video>
                )}
                <div className="flex flex-wrap gap-4">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <Github className="h-4 w-4" /> Source code
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" /> Live demo
                    </a>
                  )}
                </div>
              </>
            ) : null}
            {loadError && <p role="status" className="mt-6 text-sm text-destructive">{loadError}</p>}
          </article>
        ) : (
          <p className="text-muted-foreground">This {kind} was not found or is no longer published.</p>
        )}
      </main>
    </div>
  );
};

export default ContentDetail;
