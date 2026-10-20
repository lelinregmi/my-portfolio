import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, FolderKanban, LogOut, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { subjectIdFromName } from "@/lib/subjects";

type ContentSection = "notes" | "blogs" | "projects" | "subjects";

interface SubjectRecord {
  grade: number;
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  title?: string;
  published?: boolean;
  grade?: number;
  subject?: string;
  content?: string;
  pdf_path?: string | null;
  date?: string;
  tag?: string;
  excerpt?: string;
  tech?: string;
  description?: string;
  github_url?: string | null;
  live_url?: string | null;
  image_path?: string | null;
  video_path?: string | null;
  name?: string;
}

interface ContentForm {
  id: string;
  title: string;
  grade: string;
  subject: string;
  content: string;
  pdfPath: string | null;
  pdfFile: File | null;
  removePdf: boolean;
  subjectName: string;
  imagePath: string | null;
  imageFile: File | null;
  removeImage: boolean;
  videoPath: string | null;
  videoFile: File | null;
  removeVideo: boolean;
  date: string;
  tag: string;
  excerpt: string;
  tech: string;
  description: string;
  github_url: string;
  live_url: string;
  published: boolean;
}

const emptyForm: ContentForm = {
  id: "",
  title: "",
  grade: "9",
  subject: "",
  content: "",
  pdfPath: null,
  pdfFile: null,
  removePdf: false,
  subjectName: "",
  imagePath: null,
  imageFile: null,
  removeImage: false,
  videoPath: null,
  videoFile: null,
  removeVideo: false,
  date: new Date().toISOString().slice(0, 10),
  tag: "",
  excerpt: "",
  tech: "",
  description: "",
  github_url: "",
  live_url: "",
  published: true,
};

const sectionOptions: { id: ContentSection; label: string; icon: typeof BookOpen }[] = [
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "blogs", label: "Blogs", icon: FileText },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "subjects", label: "Subjects", icon: Settings2 },
];

const createUploadId = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const AdminPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [section, setSection] = useState<ContentSection>("notes");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const verifyAdmin = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setIsAdmin(false);

      if (!nextSession) {
        setAuthLoading(false);
        return;
      }

      const { data, error: roleError } = await supabase.rpc("is_admin");
      if (!active) return;
      if (roleError) {
        setError(`Could not verify admin access: ${roleError.message}`);
        setAuthLoading(false);
        return;
      }

      if (!data) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (!active) return;
        setSession(null);
        setError(signOutError
          ? `This account is not an admin. Sign-out failed: ${signOutError.message}`
          : "This account does not have admin access.");
      } else {
        setError("");
        setIsAdmin(true);
      }
      setAuthLoading(false);
    };

    const initialize = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(`Could not check login status: ${sessionError.message}`);
        setAuthLoading(false);
        return;
      }
      await verifyAdmin(data.session);
    };
    void initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void verifyAdmin(nextSession);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadItems = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoadingItems(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from(section)
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`Could not load ${section}: ${queryError.message}`);
    } else {
      setItems(data ?? []);
    }
    setLoadingItems(false);
  }, [isAdmin, section]);

  const loadSubjects = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    const { data, error: queryError } = await supabase
      .from("subjects")
      .select("grade, id, name")
      .order("grade", { ascending: true })
      .order("name", { ascending: true });
    if (queryError) {
      setError(`Could not load subjects: ${queryError.message}`);
      return;
    }
    setSubjects(data ?? []);
    if (section === "subjects") setItems(data ?? []);
  }, [isAdmin, section]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setNotice("");
    setSaving(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) setError(`Login failed: ${loginError.message}`);
    setSaving(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Could not sign out: ${signOutError.message}`);
    else {
      setNotice("You have been signed out.");
      setForm(emptyForm);
      setItems([]);
    }
  };

  const editItem = (item: ContentItem) => {
    setForm({
      ...emptyForm,
      ...item,
      id: item.id,
      grade: item.grade === undefined ? "9" : String(item.grade),
      subject: item.subject ?? emptyForm.subject,
      content: item.content ?? "",
      pdfPath: item.pdf_path ?? null,
      pdfFile: null,
      removePdf: false,
      subjectName: item.name ?? "",
      imagePath: item.image_path ?? null,
      imageFile: null,
      removeImage: false,
      videoPath: item.video_path ?? null,
      videoFile: null,
      removeVideo: false,
      date: item.date ?? emptyForm.date,
      tag: item.tag ?? "",
      excerpt: item.excerpt ?? "",
      tech: item.tech ?? "",
      description: item.description ?? "",
      github_url: item.github_url ?? "",
      live_url: item.live_url ?? "",
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    if (section === "notes" && !form.subject) {
      setError("Select a book before saving the note.");
      return;
    }
    if (section === "subjects" && !form.subjectName.trim()) {
      setError("Enter a subject name.");
      return;
    }
    if (section === "subjects" && !subjectIdFromName(form.subjectName)) {
      setError("Use a subject name with at least one letter or number.");
      return;
    }
    const mediaFiles = [
      { file: form.imageFile, label: "Image", maxSize: 10 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
      { file: form.videoFile, label: "Video", maxSize: 50 * 1024 * 1024, types: ["video/mp4", "video/webm"] },
    ];
    for (const { file, label, maxSize, types } of mediaFiles) {
      if (!file) continue;
      if (!types.includes(file.type)) {
        setError(`${label} must use one of these supported formats: ${types.map((type) => type.split("/")[1].toUpperCase()).join(", ")}.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`${label} file must be ${label === "Video" ? "50" : "10"} MB or smaller.`);
        return;
      }
    }
    if (section === "notes" && form.pdfFile) {
      const file = form.pdfFile;
      if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
        setError("Choose a valid PDF file.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("PDF files must be 20 MB or smaller.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setNotice("");

    const uploadedMediaPaths: string[] = [];
    const uploadMedia = async (file: File | null, kind: "blog-image" | "project-image" | "project-video") => {
      if (!file) return null;
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${kind}/${createUploadId()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-media")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw new Error(`Could not upload ${kind.replace("-", " ")}: ${uploadError.message}`);
      uploadedMediaPaths.push(path);
      return path;
    };

    let uploadedPdfPath: string | null = null;
    let uploadedImagePath: string | null = null;
    let uploadedVideoPath: string | null = null;
    try {
      if (section === "notes" && form.pdfFile) {
        const safeFileName = form.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        uploadedPdfPath = `${form.grade}/${form.subject}/${createUploadId()}-${safeFileName}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolio-note-pdfs")
          .upload(uploadedPdfPath, form.pdfFile, {
            cacheControl: "3600",
            contentType: "application/pdf",
            upsert: false,
          });
        if (uploadError) throw new Error(`Could not upload PDF: ${uploadError.message}`);
      }

      if (section === "blogs") {
        uploadedImagePath = await uploadMedia(form.imageFile, "blog-image");
      }
      if (section === "projects") {
        uploadedImagePath = await uploadMedia(form.imageFile, "project-image");
        uploadedVideoPath = await uploadMedia(form.videoFile, "project-video");
      }
    } catch (uploadError) {
      const pathsToRemove = [...uploadedMediaPaths, ...(uploadedPdfPath ? [uploadedPdfPath] : [])];
      if (pathsToRemove.length) {
        const [mediaCleanup, pdfCleanup] = await Promise.all([
          uploadedMediaPaths.length
            ? supabase.storage.from("portfolio-media").remove(uploadedMediaPaths)
            : Promise.resolve({ error: null }),
          uploadedPdfPath
            ? supabase.storage.from("portfolio-note-pdfs").remove([uploadedPdfPath])
            : Promise.resolve({ error: null }),
        ]);
        const cleanupErrors = [mediaCleanup.error, pdfCleanup.error].filter(Boolean).map((item) => item!.message);
        setError(`${uploadError instanceof Error ? uploadError.message : "File upload failed."}${cleanupErrors.length ? ` Uploaded files could not be cleaned up: ${cleanupErrors.join("; ")}` : ""}`);
      } else {
        setError(uploadError instanceof Error ? uploadError.message : "File upload failed.");
      }
      setSaving(false);
      return;
    }

    let saveError: { message: string } | null = null;
    if (section === "subjects") {
      const payload = {
        grade: Number(form.grade),
        id: subjectIdFromName(form.subjectName),
        name: form.subjectName.trim(),
      };
      const result = form.id
        ? await supabase.from("subjects").update(payload).eq("grade", Number(form.grade)).eq("id", form.id)
        : await supabase.from("subjects").insert(payload);
      saveError = result.error;
    } else if (section === "notes") {
      const payload = {
        grade: Number(form.grade),
        subject: form.subject,
        title: form.title.trim(),
        content: form.content.trim(),
        pdf_path: uploadedPdfPath ?? (form.removePdf ? null : form.pdfPath),
        published: form.published,
      };
      const result = form.id
        ? await supabase.from("notes").update(payload).eq("id", form.id)
        : await supabase.from("notes").insert(payload);
      saveError = result.error;
    } else if (section === "blogs") {
      const payload = {
        title: form.title.trim(),
        date: form.date,
        tag: form.tag.trim(),
        excerpt: form.excerpt.trim(),
        image_path: uploadedImagePath ?? (form.removeImage ? null : form.imagePath),
        published: form.published,
      };
      const result = form.id
        ? await supabase.from("blogs").update(payload).eq("id", form.id)
        : await supabase.from("blogs").insert(payload);
      saveError = result.error;
    } else {
      const payload = {
        title: form.title.trim(),
        tech: form.tech.trim(),
        description: form.description.trim(),
        github_url: form.github_url.trim() || null,
        live_url: form.live_url.trim() || null,
        image_path: uploadedImagePath ?? (form.removeImage ? null : form.imagePath),
        video_path: uploadedVideoPath ?? (form.removeVideo ? null : form.videoPath),
        published: form.published,
      };
      const result = form.id
        ? await supabase.from("projects").update(payload).eq("id", form.id)
        : await supabase.from("projects").insert(payload);
      saveError = result.error;
    }

    if (saveError) {
      let message = `Could not save ${section}: ${saveError.message}`;
      if (uploadedPdfPath || uploadedMediaPaths.length) {
        const [mediaCleanup, pdfCleanup] = await Promise.all([
          uploadedMediaPaths.length
            ? supabase.storage.from("portfolio-media").remove(uploadedMediaPaths)
            : Promise.resolve({ error: null }),
          uploadedPdfPath
            ? supabase.storage.from("portfolio-note-pdfs").remove([uploadedPdfPath])
            : Promise.resolve({ error: null }),
        ]);
        const cleanupErrors = [mediaCleanup.error, pdfCleanup.error].filter(Boolean).map((item) => item!.message);
        if (cleanupErrors.length) message += ` Uploaded files could not be cleaned up: ${cleanupErrors.join("; ")}`;
      }
      setError(message);
    } else {
      const previousPdfPath = section === "notes" ? form.pdfPath : null;
      const nextPdfPath = section === "notes"
        ? uploadedPdfPath ?? (form.removePdf ? null : form.pdfPath)
        : null;
      const oldMediaPaths = section === "blogs"
        ? [form.imagePath]
        : section === "projects" ? [form.imagePath, form.videoPath] : [];
      const retainedMediaPaths = new Set([
        uploadedImagePath ?? (form.removeImage ? null : form.imagePath),
        uploadedVideoPath ?? (form.removeVideo ? null : form.videoPath),
      ]);
      const mediaPathsToRemove = oldMediaPaths.filter(
        (path): path is string => Boolean(path) && !retainedMediaPaths.has(path),
      );
      let cleanupErrorMessage = "";
      if (previousPdfPath && previousPdfPath !== nextPdfPath) {
        const { error: cleanupError } = await supabase.storage
          .from("portfolio-note-pdfs")
          .remove([previousPdfPath]);
        if (cleanupError) cleanupErrorMessage = `Content was saved, but the old PDF could not be removed: ${cleanupError.message}`;
      }
      if (mediaPathsToRemove.length) {
        const { error: mediaCleanupError } = await supabase.storage.from("portfolio-media").remove(mediaPathsToRemove);
        if (mediaCleanupError) cleanupErrorMessage += ` Content was saved, but old media could not be removed: ${mediaCleanupError.message}`;
      }
      resetForm(section === "notes" || section === "subjects");
      setNotice(`${section === "notes" ? "Note" : section === "subjects" ? "Subject" : section.slice(0, -1)} ${form.id ? "updated" : "added"}.${cleanupErrorMessage ? ` ${cleanupErrorMessage}` : ""}`);
      if (section === "subjects") {
        await loadSubjects();
        await loadItems();
      } else await loadItems();
    }
    setSaving(false);
  };

  const deleteItem = async (item: ContentItem) => {
    const itemLabel = section === "subjects" ? item.name : item.title;
    if (!supabase || !window.confirm(`Delete "${itemLabel}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    const table = section === "subjects" ? "subjects" : section;
    const deleteQuery = supabase.from(table).delete();
    const { error: deleteError } = section === "subjects"
      ? await deleteQuery.eq("grade", item.grade).eq("id", item.id)
      : await deleteQuery.eq("id", item.id);
    if (deleteError) {
      setError(`Could not delete ${section}: ${deleteError.message}`);
      return;
    }
    let pdfCleanupError = "";
    if (section === "notes" && item.pdf_path) {
      const { error: storageError } = await supabase.storage
        .from("portfolio-note-pdfs")
        .remove([item.pdf_path]);
      if (storageError) pdfCleanupError = ` The note was deleted, but its PDF could not be removed from storage: ${storageError.message}`;
    }
    const mediaPaths = section === "blogs"
      ? [item.image_path]
      : section === "projects" ? [item.image_path, item.video_path] : [];
    const pathsToRemove = mediaPaths.filter((path): path is string => Boolean(path));
    if (pathsToRemove.length) {
      const { error: mediaError } = await supabase.storage.from("portfolio-media").remove(pathsToRemove);
      if (mediaError) pdfCleanupError += ` Content was deleted, but attached media could not be removed: ${mediaError.message}`;
    }
    if (form.id === item.id) resetForm(section === "notes" || section === "subjects");
    setNotice(`Content deleted.${pdfCleanupError}`);
    if (section === "subjects") {
      await loadSubjects();
      await loadItems();
    } else await loadItems();
  };

  const updateForm = (changes: Partial<ContentForm>) =>
    setForm((current) => ({ ...current, ...changes }));

  const resetForm = (preserveSelection = false) =>
    setForm({
      ...emptyForm,
      ...(preserveSelection && (section === "notes" || section === "subjects")
        ? {
            grade: form.grade,
            ...(section === "notes" ? { subject: form.subject } : {}),
          }
        : {}),
    });

  const subjectsForGrade = subjects.filter((subject) => subject.grade === Number(form.grade));
  const selectedSubject = subjectsForGrade.find((subject) => subject.id === form.subject);
  const visibleItems = section === "subjects"
    ? items.filter((item) => item.grade === Number(form.grade))
    : section === "notes"
      ? items.filter((item) => item.grade === Number(form.grade) && item.subject === form.subject)
      : items;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-sm text-primary hover:underline">← Portfolio</Link>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Portfolio Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage notes, blog posts, and projects.</p>
          </div>
          {isAdmin && (
            <Button type="button" variant="outline" onClick={handleSignOut}>
              <LogOut /> Sign out
            </Button>
          )}
        </header>

        {authLoading ? (
          <p className="text-muted-foreground">Checking admin access…</p>
        ) : !supabase ? (
          <section className="max-w-2xl rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">Connect Supabase to continue</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {supabaseConfigError}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Copy the Project URL and public anon/publishable key from Supabase Project Settings → API into your local .env file. Apply <code>supabase/schema.sql</code>, create your user in Supabase Auth, then add that user to the admin_users table as shown in the setup SQL.
            </p>
          </section>
        ) : !isAdmin ? (
          <form onSubmit={handleLogin} className="mx-auto max-w-md rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">Admin sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use the email and password for your authorized Supabase admin account.</p>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
            <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="admin-email">Email</label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2"
            />
            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="admin-password">Password</label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2"
            />
            <Button type="submit" disabled={saving} className="mt-6 w-full">
              {saving ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <>
            <nav aria-label="Admin content" className="mb-8 flex flex-wrap gap-2">
              {sectionOptions.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={section === id ? "default" : "outline"}
                  onClick={() => {
                    setSection(id);
                    setForm(emptyForm);
                    setNotice("");
                    setError("");
                  }}
                >
                  <Icon /> {label}
                </Button>
              ))}
            </nav>

            {error && <p role="alert" className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {notice && <p role="status" className="mb-5 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">{notice}</p>}

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {form.id ? "Edit" : "Add"} {section === "subjects" ? "subject" : sectionOptions.find((item) => item.id === section)?.label.slice(0, -1)}
                  </h2>
                  {form.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => resetForm(section === "notes" || section === "subjects")}
                    >
                      Cancel edit
                    </Button>
                  )}
                </div>

                {(section === "notes" || section === "subjects") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-foreground">
                      Class
                      <select
                        value={form.grade}
                        onChange={(event) => {
                          const nextGrade = event.target.value;
                          updateForm({
                            grade: nextGrade,
                            subject: "",
                          });
                        }}
                        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {[9, 10, 11, 12].map((grade) => <option key={grade} value={grade}>Class {grade}</option>)}
                      </select>
                    </label>
                    {section === "notes" ? <label className="text-sm font-medium text-foreground">
                      Subject
                      <select
                        required
                        value={form.subject}
                        onChange={(event) => updateForm({ subject: event.target.value })}
                        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select a book</option>
                        {subjectsForGrade.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                      </select>
                    </label> : <div className="self-end text-sm text-muted-foreground">
                      {form.id && <>Subject ID: {form.id}</>}
                    </div>}
                  </div>
                )}

                {section === "subjects" && (
                  <label className="block text-sm font-medium text-foreground">
                    Subject name
                    <Input
                      required
                      value={form.subjectName}
                      onChange={(event) => updateForm({ subjectName: event.target.value })}
                      className="mt-2"
                    />
                  </label>
                )}

                {section !== "subjects" && <label className="block text-sm font-medium text-foreground">
                  Title
                  <Input required value={form.title} onChange={(event) => updateForm({ title: event.target.value })} className="mt-2" />
                </label>}

                {section === "notes" && (
                  <>
                    <label className="block text-sm font-medium text-foreground">
                      Chapter or topic text (optional when a PDF is attached)
                      <Textarea
                        required={!form.pdfFile && (!form.pdfPath || form.removePdf)}
                        rows={8}
                        value={form.content}
                        onChange={(event) => updateForm({ content: event.target.value })}
                        className="mt-2"
                      />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Chapter/topic PDF (maximum 20 MB)
                      <Input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => updateForm({ pdfFile: event.target.files?.[0] ?? null, removePdf: false })}
                        className="mt-2 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1"
                      />
                    </label>
                    {form.pdfPath && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>PDF attached: {form.pdfPath.split("/").at(-1)?.replace(/^[0-9a-f-]+-/i, "")}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.removePdf}
                            onChange={(event) => updateForm({ removePdf: event.target.checked })}
                            className="accent-primary"
                          />
                          Remove attached PDF
                        </label>
                      </div>
                    )}
                  </>
                )}

                {section === "blogs" && (
                  <>
                    <label className="block text-sm font-medium text-foreground">
                      Date
                      <Input required type="date" value={form.date} onChange={(event) => updateForm({ date: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Category/tag
                      <Input required value={form.tag} onChange={(event) => updateForm({ tag: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Excerpt
                      <Textarea required rows={4} value={form.excerpt} onChange={(event) => updateForm({ excerpt: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Blog image (JPEG, PNG, WebP, or GIF; maximum 10 MB)
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(event) => updateForm({ imageFile: event.target.files?.[0] ?? null, removeImage: false })}
                        className="mt-2 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1"
                      />
                    </label>
                    {form.imagePath && (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={form.removeImage} onChange={(event) => updateForm({ removeImage: event.target.checked })} className="accent-primary" />
                        Remove existing blog image
                      </label>
                    )}
                  </>
                )}

                {section === "projects" && (
                  <>
                    <label className="block text-sm font-medium text-foreground">
                      Technologies
                      <Input required value={form.tech} onChange={(event) => updateForm({ tech: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Description
                      <Textarea required rows={5} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      GitHub URL (optional)
                      <Input type="url" value={form.github_url} onChange={(event) => updateForm({ github_url: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Live project URL (optional)
                      <Input type="url" value={form.live_url} onChange={(event) => updateForm({ live_url: event.target.value })} className="mt-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Project image (JPEG, PNG, WebP, or GIF; maximum 10 MB)
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(event) => updateForm({ imageFile: event.target.files?.[0] ?? null, removeImage: false })}
                        className="mt-2 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1"
                      />
                    </label>
                    {form.imagePath && (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={form.removeImage} onChange={(event) => updateForm({ removeImage: event.target.checked })} className="accent-primary" />
                        Remove existing project image
                      </label>
                    )}
                    <label className="block text-sm font-medium text-foreground">
                      Demo video (MP4 or WebM; maximum 50 MB)
                      <Input
                        type="file"
                        accept="video/mp4,video/webm,.mp4,.webm"
                        onChange={(event) => updateForm({ videoFile: event.target.files?.[0] ?? null, removeVideo: false })}
                        className="mt-2 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1"
                      />
                    </label>
                    {form.videoPath && (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={form.removeVideo} onChange={(event) => updateForm({ removeVideo: event.target.checked })} className="accent-primary" />
                        Remove existing demo video
                      </label>
                    )}
                  </>
                )}

                {section !== "subjects" && <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.published} onChange={(event) => updateForm({ published: event.target.checked })} className="accent-primary" />
                  Published (visible to everyone)
                </label>}
                <Button type="submit" disabled={saving} className="w-full">
                  <Plus /> {saving ? "Saving…" : form.id ? "Save changes" : `Add ${section === "subjects" ? "subject" : "content"}`}
                </Button>
              </form>

              <section aria-label={`Existing ${section}`} className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Existing {section}
                  {section === "subjects"
                    ? ` — Class ${form.grade}`
                    : section === "notes"
                      ? ` — Class ${form.grade}${selectedSubject ? ` · ${selectedSubject.name}` : ""}`
                      : ""}
                </h2>
                {loadingItems ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : visibleItems.length ? (
                  <ul className="space-y-3">
                    {visibleItems.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-foreground">{section === "subjects" ? item.name : item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {section === "subjects"
                              ? `Class ${item.grade} · ID: ${item.id}`
                              : section === "notes"
                                ? `Class ${item.grade} · ${subjects.find((subject) => subject.grade === item.grade && subject.id === item.subject)?.name ?? item.subject}`
                                : section === "blogs" ? `${item.tag} · ${item.date}` : item.tech}
                            {section !== "subjects" && !item.published && " · Draft"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${section === "subjects" ? item.name : item.title}`} onClick={() => editItem(item)}>
                            <Pencil />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${section === "subjects" ? item.name : item.title}`} onClick={() => void deleteItem(item)}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {section === "subjects"
                      ? `No subjects for Class ${form.grade} yet. Add one using the form.`
                      : section === "notes"
                        ? form.subject
                          ? `No notes for Class ${form.grade}${selectedSubject ? ` · ${selectedSubject.name}` : ""} yet. Add one using the form.`
                          : "Select a book to view its notes."
                        : `No ${section} yet. Add one using the form.`}
                  </p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminPage;
