// Lo stato dell'editor: il progetto, la selezione, il cursore e l'annulla/ripeti.
// Ogni modifica passa da edit(): prima si fa la fotografia, poi si cambia, poi si avvisa chi disegna.
import type { Project } from './tipi';
import { newProject } from './progetto';
import { FORMATI } from './tipi';

type Snap = Pick<Project, 'tracks' | 'clips' | 'markers' | 'inF' | 'outF' | 'media' | 'w' | 'h' | 'rate' | 'drop' | 'name'> & { label: string };

export type StoreEvent = 'doc' | 'sel' | 'head' | 'view' | 'status';

const LIMITE_ANNULLA = 200;

class Store {
  doc: Project = newProject(FORMATI[0]);
  sel = new Set<string>();
  /** cursore della timeline in fotogrammi (durante la riproduzione può avere la virgola) */
  head = 0;
  /** traccia su cui si è cliccato per ultimo */
  focusTrack: string | null = null;
  dirty = false;
  private undo: Snap[] = [];
  private redo: Snap[] = [];
  private subs = new Map<StoreEvent, Set<() => void>>();
  private pending = new Set<StoreEvent>();
  private raf = 0;

  on(ev: StoreEvent, fn: () => void) {
    if (!this.subs.has(ev)) this.subs.set(ev, new Set());
    this.subs.get(ev)!.add(fn);
    return () => this.subs.get(ev)!.delete(fn);
  }

  /** gli avvisi si raccolgono e partono una volta per fotogramma */
  emit(...evs: StoreEvent[]) {
    for (const e of evs) this.pending.add(e);
    if (!this.raf) this.raf = requestAnimationFrame(() => this.flush());
  }

  flushNow() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.flush();
  }

  private flush() {
    this.raf = 0;
    const evs = [...this.pending];
    this.pending.clear();
    for (const e of evs) for (const fn of this.subs.get(e) ?? []) fn();
  }

  private snap(label: string): Snap {
    const d = this.doc;
    return structuredClone({ tracks: d.tracks, clips: d.clips, markers: d.markers, inF: d.inF, outF: d.outF, media: d.media, w: d.w, h: d.h, rate: d.rate, drop: d.drop, name: d.name, label });
  }

  private restore(s: Snap) {
    const { label: _l, ...rest } = s;
    Object.assign(this.doc, structuredClone(rest));
    const ids = new Set(this.doc.clips.map((c) => c.id));
    for (const id of [...this.sel]) if (!ids.has(id)) this.sel.delete(id);
  }

  /** esegue una modifica annullabile */
  edit<T>(label: string, fn: (p: Project) => T): T {
    const before = this.snap(label);
    const r = fn(this.doc);
    this.undo.push(before);
    if (this.undo.length > LIMITE_ANNULLA) this.undo.shift();
    this.redo.length = 0;
    this.dirty = true;
    const ids = new Set(this.doc.clips.map((c) => c.id));
    for (const id of [...this.sel]) if (!ids.has(id)) this.sel.delete(id);
    this.emit('doc', 'sel');
    return r;
  }

  /** modifica "dal vivo" (trascinamenti): la fotografia la prende begin(), la chiude commit() */
  private live: Snap | null = null;
  begin(label: string) {
    this.live = this.snap(label);
  }
  liveChange() {
    this.dirty = true;
    this.emit('doc');
  }
  commit(changed = true) {
    if (this.live && changed) {
      this.undo.push(this.live);
      this.redo.length = 0;
    } else if (this.live && !changed) {
      this.restore(this.live);
    }
    this.live = null;
    this.emit('doc', 'sel');
  }
  cancelLive() {
    if (this.live) this.restore(this.live);
    this.live = null;
    this.emit('doc', 'sel');
  }

  canUndo() { return this.undo.length > 0; }
  canRedo() { return this.redo.length > 0; }
  undoLabel() { return this.undo[this.undo.length - 1]?.label ?? ''; }
  redoLabel() { return this.redo[this.redo.length - 1]?.label ?? ''; }

  doUndo(): string | null {
    const s = this.undo.pop();
    if (!s) return null;
    this.redo.push(this.snap(s.label));
    this.restore(s);
    this.dirty = true;
    this.emit('doc', 'sel', 'view');
    return s.label;
  }

  doRedo(): string | null {
    const s = this.redo.pop();
    if (!s) return null;
    this.undo.push(this.snap(s.label));
    this.restore(s);
    this.dirty = true;
    this.emit('doc', 'sel', 'view');
    return s.label;
  }

  load(p: Project) {
    this.doc = p;
    this.sel.clear();
    this.undo = [];
    this.redo = [];
    this.head = 0;
    this.dirty = false;
    this.emit('doc', 'sel', 'head', 'view');
  }

  select(ids: Iterable<string>, add = false) {
    if (!add) this.sel.clear();
    for (const id of ids) this.sel.add(id);
    this.emit('sel');
  }

  setHead(f: number) {
    const nf = Math.max(0, f);
    if (nf === this.head) return;
    this.head = nf;
    this.emit('head');
  }
}

export const store = new Store();
(globalThis as any).__dpv = store; // per le prove automatiche e per curiosare dalla console
