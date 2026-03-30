'use client';

import { useState } from 'react';
import useSWR from 'swr';

type KnowledgeEntry = { id: number; content: string; category: string; source: string; createdAt: string };

const CATEGORIES = ['all', 'fact', 'preference', 'skill', 'project', 'person', 'idea', 'general'];
const ICONS: Record<string, string> = { fact: '\uD83D\uDCCB', preference: '\u2764\uFE0F', skill: '\u26A1', project: '\uD83D\uDD28', person: '\uD83D\uDC64', idea: '\uD83D\uDCA1', general: '\uD83D\uDCDD' };
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function KnowledgePage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  const { data, mutate } = useSWR(`/api/knowledge?${params.toString()}`, fetcher);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, category: newCategory }),
    });
    setNewContent('');
    mutate();
  }

  const entries: KnowledgeEntry[] = data?.entries ?? [];
  const stats = data?.stats;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">\uD83E\uDDE0 Knowledge Base</h1>
        {stats && <p className="text-sm text-muted-foreground">{stats.total} entries across {stats.categories} categories</p>}
      </div>
      <form onSubmit={addEntry} className="mb-6 p-4 border rounded-lg">
        <p className="text-sm font-medium mb-2">Add Knowledge</p>
        <div className="flex gap-2">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            {CATEGORIES.filter((c) => c !== 'all').map((c) => (<option key={c} value={c}>{ICONS[c]} {c}</option>))}
          </select>
          <input type="text" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What do you want me to remember?" className="flex-1 px-3 py-2 border rounded-md" />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">Add</button>
        </div>
      </form>
      <div className="flex gap-2 mb-4 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-sm border ${category === c ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
            {c === 'all' ? '\uD83C\uDF10 All' : `${ICONS[c]} ${c}`}
          </button>
        ))}
      </div>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search knowledge..." className="w-full px-3 py-2 border rounded-md mb-4" />
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="p-3 border rounded-md flex items-start gap-3">
            <span className="text-lg">{ICONS[entry.category] ?? '\uD83D\uDCDD'}</span>
            <div className="flex-1">
              <p className="text-sm">{entry.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{entry.category} \u00B7 {entry.source} \u00B7 {new Date(entry.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-muted-foreground py-8">No knowledge entries yet. Start chatting or add manually!</p>}
      </div>
    </div>
  );
}
