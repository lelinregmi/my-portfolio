import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase, supabaseConfigError } from "@/lib/supabase";
import { subjectsByGrade, type Subject } from "@/lib/subjects";

const Notes = () => {
  const [subjects, setSubjects] = useState<Record<number, Subject[]>>(
    supabase ? {} : subjectsByGrade,
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    const loadNotes = async () => {
      const [{ data: subjectData, error: subjectError }, { data: noteData, error: noteError }] = await Promise.all([
        supabase.from("subjects").select("grade, id, name").order("grade").order("name"),
        supabase.from("notes").select("grade, subject").eq("published", true),
      ]);

      if (subjectError || noteError) {
        setLoadError(`Could not load notes: ${subjectError?.message ?? noteError?.message}`);
        setLoading(false);
        return;
      }

      const nextSubjects: Record<number, Subject[]> = {};
      for (const subject of subjectData ?? []) {
        (nextSubjects[subject.grade] ??= []).push({ id: subject.id, name: subject.name });
      }
      setSubjects(nextSubjects);

      const nextCounts: Record<string, number> = {};
      for (const note of noteData ?? []) {
        const key = `${note.grade}/${note.subject}`;
        nextCounts[key] = (nextCounts[key] ?? 0) + 1;
      }
      setLoadError("");
      setCounts(nextCounts);
      setLoading(false);
    };

    void loadNotes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-20 pt-28 sm:px-6">
        <p className="mb-3 font-mono text-sm uppercase tracking-widest text-primary">Computer Engineering</p>
        <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
          Class 9–12 <span className="gradient-text">Notes</span>
        </h1>
        <p className="mb-12 max-w-2xl text-muted-foreground">
          Browse computer studies subjects by class. Choose a subject to open its notes.
        </p>
        {loadError && <p role="status" className="mb-6 text-sm text-destructive">{loadError}</p>}
        {!supabase && (
          <p className="mb-8 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {supabaseConfigError || "Connect Supabase to publish notes. Admin setup instructions are available at the Admin login page."}
          </p>
        )}

        <div className="space-y-12">
          {loading && <p className="text-sm text-muted-foreground">Loading subjects…</p>}
          {Object.entries(subjects).map(([grade, gradeSubjects]) => (
            <section key={grade} aria-labelledby={`grade-${grade}`}>
              <h2 id={`grade-${grade}`} className="mb-5 text-2xl font-semibold text-foreground">
                Class {grade}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gradeSubjects.map((subject) => {
                  const count = counts[`${grade}/${subject.id}`] ?? 0;
                  return (
                    <Link
                      key={subject.id}
                      to={`/notes/${grade}/${subject.id}`}
                      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                    >
                      <h3 className="font-semibold text-foreground">{subject.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {count} {count === 1 ? "note" : "notes"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notes;
