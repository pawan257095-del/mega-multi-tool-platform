"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SavedNote = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

const STORAGE_KEY = "mega-tool-platform-browser-notepad-v1";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(timestamp: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

export default function BrowserNotepadLocalSaveTool() {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [activeId, setActiveId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Loading notes from this browser…");
  const [search, setSearch] = useState("");
  const [storageError, setStorageError] = useState("");

    useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      // Defer initial state updates until after the effect has yielded.
      await Promise.resolve();
      if (cancelled) return;

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];

        let safeNotes: SavedNote[] = [];

        if (Array.isArray(parsed)) {
          safeNotes = parsed.filter(
            (item): item is SavedNote =>
              item &&
              typeof item.id === "string" &&
              typeof item.title === "string" &&
              typeof item.content === "string" &&
              typeof item.updatedAt === "number",
          );
        }

        if (cancelled) return;

        setNotes(safeNotes);

        if (safeNotes.length > 0) {
          setActiveId(safeNotes[0].id);
          setTitle(safeNotes[0].title);
          setContent(safeNotes[0].content);
        }

        setStatus(
          raw
            ? "Your browser notes are ready."
            : "Create a note. It will be saved in this browser.",
        );
      } catch {
        if (cancelled) return;

        setStorageError(
          "Local storage is unavailable in this browser session. You can still edit, but saving may not persist.",
        );
        setStatus("Storage could not be read.");
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistNotes = useCallback((nextNotes: SavedNote[]) => {
    setNotes(nextNotes);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotes));
      setStorageError("");
      setStatus("Saved in this browser.");
      return true;
    } catch {
      setStorageError("Could not save to local storage. Browser storage may be disabled or full. Export your note as a backup.");
      setStatus("Save failed.");
      return false;
    }
  }, []);

  const saveActiveNote = useCallback(() => {
    const now = Date.now();
    if (!activeId) {
      const note: SavedNote = { id: makeId(), title: title.trim() || "Untitled note", content, updatedAt: now };
      const next = [note, ...notes];
      persistNotes(next);
      setActiveId(note.id);
      setTitle(note.title);
      return;
    }
    const existing = notes.find((note) => note.id === activeId);
    const updated: SavedNote = {
      id: activeId,
      title: title.trim() || "Untitled note",
      content,
      updatedAt: now,
    };
    const next = existing
      ? notes.map((note) => note.id === activeId ? updated : note)
      : [updated, ...notes];
    persistNotes(next);
    setTitle(updated.title);
  }, [activeId, content, notes, persistNotes, title]);

  const createNote = () => {
    const note: SavedNote = { id: makeId(), title: "Untitled note", content: "", updatedAt: Date.now() };
    const next = [note, ...notes];
    persistNotes(next);
    setActiveId(note.id);
    setTitle(note.title);
    setContent("");
    setStatus("New note created.");
  };

  const openNote = (note: SavedNote) => {
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setStatus(`Opened “${note.title}”. Save after editing to keep your changes.`);
  };

  const deleteActiveNote = () => {
    if (!activeId) return;
    const next = notes.filter((note) => note.id !== activeId);
    persistNotes(next);
    if (next.length) {
      setActiveId(next[0].id);
      setTitle(next[0].title);
      setContent(next[0].content);
    } else {
      setActiveId("");
      setTitle("");
      setContent("");
    }
    setStatus("Note deleted from this browser.");
  };

  const exportNote = () => {
    const filenameBase = (title.trim() || "note")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "note";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenameBase}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Note exported as a plain-text file.");
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "browser-notes-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("All notes exported as a JSON backup.");
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
      const imported: SavedNote[] = parsed.filter((item): item is SavedNote =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.content === "string" &&
        typeof item.updatedAt === "number"
      );
      if (imported.length === 0 && parsed.length > 0) throw new Error("No valid notes were found in that backup.");
      const existingIds = new Set(notes.map((note) => note.id));
      const normalized = imported.map((note) => ({
        ...note,
        id: existingIds.has(note.id) ? makeId() : note.id,
      }));
      const next = [...normalized, ...notes];
      persistNotes(next);
      if (normalized.length) openNote(normalized[0]);
      setStatus(`Imported ${normalized.length} note${normalized.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? `Import failed: ${error.message}` : "Import failed: invalid backup file.");
    }
  };

  const filteredNotes = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((note) => note.title.toLowerCase().includes(needle) || note.content.toLowerCase().includes(needle));
  }, [notes, search]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characterCount = content.length;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Browser Notepad</h2>
            <p className="mt-1 text-sm text-muted-foreground">Write quick notes and save them locally in this browser. No account required.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={createNote} disabled={!isReady} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">New note</button>
            <button type="button" onClick={exportAll} disabled={!notes.length} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Backup all</button>
          </div>
        </div>

        {storageError && <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm" role="alert">{storageError}</p>}

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <label className="block text-sm font-medium">
              Search notes
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or text…" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
              {filteredNotes.length ? filteredNotes.map((note) => (
                <button key={note.id} type="button" onClick={() => openNote(note)} className={`block w-full rounded-xl border p-3 text-left transition hover:bg-muted ${note.id === activeId ? "border-primary bg-muted/70" : "border-border"}`}>
                  <span className="block truncate font-semibold">{note.title || "Untitled note"}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
                  <span className="mt-2 block line-clamp-2 text-sm text-muted-foreground">{note.content || "Empty note"}</span>
                </button>
              )) : (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{notes.length ? "No notes match your search." : "No saved notes yet. Create one to get started."}</p>
              )}
            </div>
          </aside>

          <div className="min-w-0">
            <label className="block text-sm font-medium">
              Note title
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled note" maxLength={160} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-base font-semibold" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Note content
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Start typing here…" rows={16} className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm leading-6" />
            </label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{wordCount} words · {characterCount} characters</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={saveActiveNote} disabled={!isReady} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">Save note</button>
                <button type="button" onClick={exportNote} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted">Export .txt</button>
                <button type="button" onClick={deleteActiveNote} disabled={!activeId} className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-50">Delete</button>
              </div>
            </div>
            <p className="mt-3 min-h-5 text-sm text-muted-foreground" role="status">{status}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Privacy and backup</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Notes are stored in this browser’s local storage on this device, not synced to an account or cloud.</li>
          <li>Clearing site data, using a different browser/device, or private browsing can remove or prevent persistence.</li>
          <li>Export important notes regularly. Avoid storing passwords or highly sensitive information here.</li>
          <li>Importing a JSON backup adds its notes to the current list; duplicate IDs are assigned new local IDs.</li>
        </ul>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-muted">
          Import JSON backup
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { void importBackup(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
      </section>
    </div>
  );
}
