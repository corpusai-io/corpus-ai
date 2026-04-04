'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chatbotApi } from '@/lib/api';
import { createPortal } from 'react-dom';
import {
  Save,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Portal-based Modal (V4 dark)                                      */
/* ------------------------------------------------------------------ */
function SimpleModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0E0E10] border border-slate-200 dark:border-white/[0.08] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ------------------------------------------------------------------ */
/*  Settings Page                                                     */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);

  // Basic settings
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [language, setLanguage] = useState('en');

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
      alert('Basic settings saved!');
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

  /* ---- Skeleton loading state ---- */
  if (loading) {
    return (
      <div className="v4-animate-in mx-auto max-w-2xl space-y-5">
        <div className="space-y-2">
          <div className="v4-shimmer rounded-lg" style={{ height: '28px', width: '180px' }} />
          <div className="v4-shimmer rounded-lg" style={{ height: '18px', width: '280px' }} />
        </div>
        <div className="v4-shimmer rounded-2xl" style={{ height: '320px' }} />
        <div className="v4-shimmer rounded-2xl" style={{ height: '120px' }} />
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#A1A1AA]">
          Configure your chatbot&apos;s behavior and appearance
        </p>
      </div>

      {/* Basic Settings Card */}
      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5">
        <label className="text-xs font-medium text-slate-500 dark:text-[#71717A] uppercase tracking-wider mb-2 block">
          Basic Settings
        </label>
        <div className="space-y-4 mt-3">
          {/* Chatbot Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-500 dark:text-[#A1A1AA] mb-1.5">
              Chatbot Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Chatbot"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-300 dark:focus:border-white/[0.16] transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-slate-500 dark:text-[#A1A1AA] mb-1.5">
              Description
            </label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Describe what your chatbot does..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-300 dark:focus:border-white/[0.16] transition-colors text-sm resize-none"
            />
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-500 dark:text-[#A1A1AA] mb-1.5">
              Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-white/[0.16] transition-colors text-sm appearance-none cursor-pointer"
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-[#71717A] pointer-events-none" />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveBasic}
              disabled={savingBasic}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {savingBasic ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-[#EC4899]/20 bg-[#EC4899]/[0.03] p-5">
        <h2 className="text-sm font-semibold text-[#EC4899]">Danger Zone</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#71717A]">
          Permanently delete this chatbot and all associated data. This action cannot be undone.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#EC4899]/30 text-[#EC4899] hover:bg-[#EC4899]/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Chatbot
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <SimpleModal
        open={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeleteConfirmName(''); }}
      >
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#EC4899]">
            <AlertTriangle className="h-5 w-5" />
            Delete Chatbot
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-[#A1A1AA]">
            This will permanently delete{' '}
            <span className="font-medium text-slate-900 dark:text-white">{title}</span> and
            all its data, including query logs, leads, and data sources.
          </p>
          <p className="mt-2 text-sm font-medium text-[#EC4899]">
            This action cannot be undone. All data will be permanently lost.
          </p>
        </div>

        <div className="space-y-1.5 mb-6">
          <label htmlFor="confirmName" className="block text-sm text-slate-500 dark:text-[#A1A1AA]">
            Type <span className="font-semibold text-slate-900 dark:text-white">{title}</span> to confirm
          </label>
          <input
            id="confirmName"
            type="text"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder={title}
            className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-300 dark:focus:border-white/[0.16] transition-colors text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowDeleteDialog(false);
              setDeleteConfirmName('');
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteConfirmName !== title || deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#EC4899] text-white hover:bg-[#EC4899]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
