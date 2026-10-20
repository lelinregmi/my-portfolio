import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { subjectsByGrade, type Subject } from "@/lib/subjects";

interface NoteRecord {
  id: string;
  title: string;
  content: string;
  created_at: string;
  pdf_path: string | null;
  pdf_url: string | null;
}

const NotesDetail = () => {
  const { grade, subjectId } = useParams();
  const gradeNumber = Number(grade);
  const [subject, setSubject] = useState<Subject | null>(
    supabase ? null : subjectsByGrade[gradeNumber]?.find((item) => item.id === subjectId) ?? null,
  );
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadNotes = async () => {
      setLoading(true);
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("grade", gradeNumber)
        .eq("id", subjectId ?? "")
        .maybeSingle();
      if (subjectError) {
        setLoadError(`Could not load subject: ${subjectError.message}`);
        setLoading(false);
        return;
      }
      if (!subjectData) {
        setSubject(null);
        setNotes([]);
        setLoadError("");
        setLoading(false);
        return;
      }

      const currentSubject = { id: subjectData.id, name: subjectData.name };
      setSubject(currentSubject);
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, created_at, pdf_path")
        .eq("grade", gradeNumber)
        .eq("subject", currentSubject.id)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(`Could not load notes: ${error.message}`);
      } else {
        const pdfErrors: string[] = [];
        const notesWithPdfUrls = await Promise.all((data ?? []).map(async (note) => {
          if (!note.pdf_path) return { ...note, pdf_url: null };

          const { data: pdfData, error: pdfError } = await supabase.storage
            .from("portfolio-note-pdfs")
            .createSignedUrl(note.pdf_path, 3600);
          if (pdfError) {
            pdfErrors.push(`Could not open the PDF for "${note.title}": ${pdfError.message}`);
            return { ...note, pdf_url: null };
          }
          return { ...note, pdf_url: pdfData.signedUrl };
        }));

        setLoadError(pdfErrors.join(" "));
        setNotes(notesWithPdfUrls);
      }
      setLoading(false);
    };

    void loadNotes();
  }, [gradeNumber, subjectId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-20 pt-28 sm:px-6">
        <Link to="/notes" className="mb-6 inline-block text-sm text-primary hover:underline">
          ← All classes and subjects
        </Link>
        {subject ? (
          <>
            <p className="mb-3 font-mono text-sm uppercase tracking-widest text-primary">Class {gradeNumber}</p>
            <h1 className="mb-10 text-3xl font-bold text-foreground sm:text-4xl">{subject.name}</h1>
            {loadError && <p role="status" className="mb-6 text-sm text-destructive">{loadError}</p>}
            {!supabase && <p className="mb-6 text-sm text-muted-foreground">Notes will appear here once the site is connected to its content database.</p>}
            {loading ? (
              <p className="text-muted-foreground">Loading notes…</p>
            ) : notes.length ? (
              <div className="space-y-6">
                {notes.map((note) => (
                  <article key={note.id} className="rounded-xl border border-border bg-card p-6">
                    <h2 className="mb-3 text-xl font-semibold text-foreground">{note.title}</h2>
                    {note.content && (
                      <div className="mb-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{note.content}</div>
                    )}
                    {note.pdf_url && (
                      <div>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <h3 className="font-medium text-foreground">Chapter PDF</h3>
                          <a
                            href={note.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Open PDF in a new tab
                          </a>
                        </div>
                        <iframe
                          src={note.pdf_url}
                          title={`${note.title} PDF`}
                          className="h-[70vh] min-h-[400px] w-full rounded-lg border border-border bg-background"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : supabase && !loadError ? (
              <p className="text-muted-foreground">No published notes in this subject yet.</p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">That class or subject was not found.</p>
        )}
      </main>
    </div>
  );
};

export default NotesDetail;
