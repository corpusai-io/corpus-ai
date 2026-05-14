'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { createPortal } from 'react-dom';
import { Save, Trash2, X, ChevronDown } from 'lucide-react';
import { Eyebrow, Button, Divider } from '@/components/corpus';

/* ─── Portal modal ─────────────────────────────────────────── */
function SimpleModal({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }} />
      <div
        className="relative w-full max-w-md rounded-2xl bg-canvas border border-line shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.2s cubic-bezier(0,0,0.2,1) both' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  const [loading,     setLoading]     = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);

  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [language, setLanguage] = useState('en');

  const [showDeleteDialog,   setShowDeleteDialog]   = useState(false);
  const [deleteConfirmName,  setDeleteConfirmName]  = useState('');
  const [deleting,           setDeleting]           = useState(false);

  useEffect(() => { loadSettings(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const chatbotData = await chatbotApi.get(chatbotId);
      const chatbot = (chatbotData as any).chatbot || chatbotData;
      setTitle(chatbot.title || '');
      setDesc(chatbot.desc || '');
      setLanguage(chatbot.language || 'en');
    } catch (err: any) {
      alert('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = async () => {
    try {
      setSavingBasic(true);
      await chatbotApi.update(chatbotId, { title, desc });
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSavingBasic(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== title) return;
    try {
      setDeleting(true);
      await chatbotApi.delete(chatbotId);
      router.push('/chatbots');
    } catch (err: any) {
      alert('Failed to delete chatbot: ' + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="v4-animate-in mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <div className="v4-shimmer rounded h-2.5 w-24" />
          <div className="v4-shimmer rounded h-7 w-48" />
        </div>
        <div className="v4-shimmer rounded-2xl h-80" />
        <div className="v4-shimmer rounded-2xl h-32" />
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <Eyebrow>Settings · general</Eyebrow>
        <h1
          className="font-display text-3xl font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Identity & basics.</span>{' '}
          <span className="text-muted">How your bot shows up.</span>
        </h1>
      </div>

      {/* Basic settings */}
      <div className="v4-card p-6 space-y-5">
        <Eyebrow>Basics</Eyebrow>

        <div>
          <label htmlFor="title" className="block text-[13px] font-medium text-muted mb-1.5">Chatbot name</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My chatbot"
            className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="desc" className="block text-[13px] font-medium text-muted mb-1.5">Description</label>
          <textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Describe what your chatbot does…"
            className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-[13px] font-medium text-muted mb-1.5">Language</label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink focus:outline-none focus:border-ink transition-colors appearance-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft pointer-events-none" />
          </div>
        </div>

        <Divider />

        <div className="flex justify-end">
          <Button variant="primary" icon={Save} onClick={handleSaveBasic} disabled={savingBasic}>
            {savingBasic ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-line bg-canvas p-6">
        <Eyebrow>Danger zone</Eyebrow>
        <h2
          className="font-display text-[18px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Delete this chatbot
        </h2>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          Removes the chatbot and every piece of data attached to it — query logs, leads, sources, embeddings. Not reversible.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium border border-line text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete chatbot
          </button>
        </div>
      </div>

      {/* Delete modal */}
      <SimpleModal
        open={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeleteConfirmName(''); }}
      >
        <Eyebrow>Confirm</Eyebrow>
        <h3
          className="font-display text-[20px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Delete <span className="text-muted">{title}</span>?
        </h3>
        <p className="text-[13px] text-muted leading-relaxed mt-2">
          Every piece of data attached to this chatbot will be permanently removed. This cannot be undone.
        </p>

        <div className="space-y-1.5 mt-5 mb-6">
          <label htmlFor="confirmName" className="block text-[13px] text-muted">
            Type <span className="font-medium text-ink">{title}</span> to confirm
          </label>
          <input
            id="confirmName"
            type="text"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder={title}
            className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmName(''); }}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteConfirmName !== title || deleting}
            className="px-4 py-2 rounded-lg text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
