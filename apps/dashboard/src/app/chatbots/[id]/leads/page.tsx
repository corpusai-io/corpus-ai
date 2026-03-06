'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadsApi } from '@/lib/api';
import {
  Download,
  Settings,
  Search,
  Mail,
  Phone,
  User,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  MessageSquare,
  Flame,
  Target,
  Snowflake,
  X,
  BarChart3,
  FileText,
  Users,
} from 'lucide-react';

interface Lead {
  dataId: string;
  chatbotId: string;
  data?: Record<string, any>;
  sessionId?: string;
  intent?: string;
  status?: string;
  triggerType?: string;
  sourcePage?: string;
  notes?: string;
  dataCreatedAt?: string;
}

interface LeadField {
  key: string;
  name: string;
  description: string;
  required: boolean;
}

interface TriggerConfig {
  triggerType: string;
  messageThreshold: number;
  formStyle: string;
  enabled: boolean;
}

interface TranscriptMessage {
  role: string;
  content: string;
  createdAt: string;
}

interface Analytics {
  total: number;
  intentBreakdown: { hot: number; warm: number; cold: number };
  statusBreakdown: { new: number; contacted: number; converted: number; archived: number };
  leadsOverTime: Record<string, number>;
}

const ITEMS_PER_PAGE = 10;

const TRIGGER_TYPES = [
  { value: 'gated', label: 'Before Chat (Gated)', desc: 'Show form before chat starts' },
  { value: 'after_messages', label: 'After X Messages', desc: 'Show form after a number of messages' },
  { value: 'high_intent', label: 'High Intent Detected', desc: 'Trigger when pricing/purchase keywords detected' },
  { value: 'cant_answer', label: "Can't Answer", desc: "Trigger when bot can't answer a question" },
  { value: 'exit_intent', label: 'Exit Intent', desc: 'Trigger when user tries to leave' },
];

const DEFAULT_FIELDS: LeadField[] = [
  { key: 'name', name: 'Name', description: 'Your full name', required: true },
  { key: 'email', name: 'Email', description: 'Your email address', required: true },
  { key: 'phone', name: 'Phone', description: 'Your phone number', required: false },
  { key: 'company', name: 'Company', description: 'Company name', required: false },
];

function IntentBadge({ intent }: { intent?: string }) {
  switch (intent) {
    case 'hot':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20">
          <Flame className="h-2.5 w-2.5" /> Hot
        </span>
      );
    case 'warm':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
          <Target className="h-2.5 w-2.5" /> Warm
        </span>
      );
    case 'cold':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20">
          <Snowflake className="h-2.5 w-2.5" /> Cold
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-[#A1A1AA] border border-slate-200 dark:border-white/[0.08]">
          Unknown
        </span>
      );
  }
}

function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'contacted':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#F59E0B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Contacted
        </span>
      );
    case 'converted':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#22C55E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          Converted
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-[#A1A1AA]">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-[#A1A1AA]" />
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#60A5FA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
          New
        </span>
      );
  }
}

/* Custom toggle switch */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#BF56FF]' : 'bg-slate-200 dark:bg-white/[0.10]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-6 v4-animate-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="v4-shimmer h-7 w-20 rounded-lg mb-2" />
          <div className="v4-shimmer h-4 w-48 rounded-lg" />
        </div>
        <div className="v4-shimmer h-9 w-28 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="v4-card rounded-2xl p-5">
            <div className="v4-shimmer h-4 w-16 rounded mb-3" />
            <div className="v4-shimmer h-8 w-12 rounded" />
          </div>
        ))}
      </div>
      <div className="v4-card rounded-2xl overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.04]">
            <div className="v4-shimmer h-8 w-8 rounded-full" />
            <div className="v4-shimmer h-4 w-32 rounded" />
            <div className="v4-shimmer h-4 w-40 rounded ml-4" />
            <div className="v4-shimmer h-5 w-12 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [fieldsList, setFieldsList] = useState<LeadField[]>(DEFAULT_FIELDS);
  const [formTitle, setFormTitle] = useState('Contact Form');
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>({
    triggerType: 'gated',
    messageThreshold: 3,
    formStyle: 'popup',
    enabled: false,
  });
  const [savingFields, setSavingFields] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, fieldsData, analyticsData] = await Promise.all([
        leadsApi.list(chatbotId),
        leadsApi.getFields(chatbotId).catch(() => ({ fields: null })),
        leadsApi.analytics(chatbotId).catch(() => ({ analytics: null })),
      ]);

      setLeads((leadsData as any).leads || []);

      const fields = (fieldsData as any).fields;
      if (fields) {
        if (Array.isArray(fields.fields) && fields.fields.length > 0) setFieldsList(fields.fields);
        if (fields.title) setFormTitle(fields.title);
        if (fields.triggerConfig) {
          setTriggerConfig({
            triggerType: fields.triggerConfig.triggerType || 'gated',
            messageThreshold: fields.triggerConfig.messageThreshold || 3,
            formStyle: fields.triggerConfig.formStyle || 'popup',
            enabled: fields.triggerConfig.enabled ?? false,
          });
        }
      }

      if ((analyticsData as any).analytics) setAnalytics((analyticsData as any).analytics);
    } catch (err: any) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await leadsApi.export(chatbotId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${chatbotId}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export: ' + err.message);
    }
  };

  const handleSaveFields = async () => {
    try {
      setSavingFields(true);
      await leadsApi.updateFields(chatbotId, { title: formTitle, fields: fieldsList, triggerConfig });
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSavingFields(false);
    }
  };

  const handleOpenDetail = async (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status || 'new');
    setEditNotes(lead.notes || '');
    setTranscript([]);
    setDetailLoading(true);
    try {
      const result = await leadsApi.get(chatbotId, lead.dataId);
      setTranscript(result.transcript || []);
      if (result.lead) {
        setEditStatus(result.lead.status || 'new');
        setEditNotes(result.lead.notes || '');
      }
    } catch (err) {
      console.error('Failed to load lead detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveDetail = async () => {
    if (!selectedLead) return;
    try {
      setSavingDetail(true);
      await leadsApi.update(chatbotId, selectedLead.dataId, { status: editStatus, notes: editNotes });
      setLeads((prev) =>
        prev.map((l) => (l.dataId === selectedLead.dataId ? { ...l, status: editStatus, notes: editNotes } : l))
      );
      setSelectedLead((prev) => (prev ? { ...prev, status: editStatus, notes: editNotes } : null));
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSavingDetail(false);
    }
  };

  const addCustomField = () => {
    if (fieldsList.length >= 20) return;
    setFieldsList((prev) => [...prev, { key: `custom_${Date.now()}`, name: '', description: '', required: false }]);
  };

  const removeField = (index: number) => setFieldsList((prev) => prev.filter((_, i) => i !== index));
  const updateField = (index: number, updates: Partial<LeadField>) =>
    setFieldsList((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.data?.name?.toLowerCase().includes(q) ||
          lead.data?.email?.toLowerCase().includes(q) ||
          lead.data?.phone?.includes(q) ||
          lead.data?.company?.toLowerCase().includes(q)
      );
    }
    if (intentFilter !== 'all') result = result.filter((lead) => (lead.intent || 'cold') === intentFilter);
    if (statusFilter !== 'all') result = result.filter((lead) => (lead.status || 'new') === statusFilter);
    return result;
  }, [leads, searchQuery, intentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, intentFilter, statusFilter]);

  if (loading) return <SkeletonPage />;

  const maxBar = analytics ? Math.max(...Object.values(analytics.leadsOverTime), 1) : 1;

  return (
    <div className="space-y-5 v4-animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Leads</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-[#A1A1AA]">Manage captured leads from your chatbot</p>
        </div>
        <button
          onClick={handleExport}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Analytics Collapsible */}
      {analytics && (
        <div className="v4-card rounded-2xl overflow-hidden">
          <button
            onClick={() => setAnalyticsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#BF56FF]/10">
                <BarChart3 className="h-4 w-4 text-[#BF56FF]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Lead Analytics</p>
                <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">{analytics.total} total leads</p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 dark:text-[#A1A1AA] transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {analyticsOpen && (
            <div className="border-t border-slate-100 dark:border-white/[0.06] px-5 pb-5 pt-4 space-y-5">
              {/* Intent Breakdown */}
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-3">Intent Breakdown</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl border border-[#EC4899]/15 bg-[#EC4899]/[0.04] p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EC4899]/10">
                      <Flame className="h-4 w-4 text-[#EC4899]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics.intentBreakdown.hot}</p>
                      <p className="text-xs text-[#EC4899]">Hot Leads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[#F59E0B]/15 bg-[#F59E0B]/[0.04] p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/10">
                      <Target className="h-4 w-4 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics.intentBreakdown.warm}</p>
                      <p className="text-xs text-[#F59E0B]">Warm Leads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[#60A5FA]/15 bg-[#60A5FA]/[0.04] p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#60A5FA]/10">
                      <Snowflake className="h-4 w-4 text-[#60A5FA]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{analytics.intentBreakdown.cold}</p>
                      <p className="text-xs text-[#60A5FA]">Cold Leads</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-3">Status Breakdown</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {Object.entries(analytics.statusBreakdown).map(([key, count]) => (
                    <div key={key} className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-3 text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                      <p className="text-xs text-slate-400 dark:text-[#71717A] capitalize mt-0.5">{key}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leads Over Time */}
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-3">Leads — Last 30 Days</p>
                <div className="flex items-end gap-px h-20">
                  {Object.entries(analytics.leadsOverTime).map(([date, count]) => {
                    const pct = (count / maxBar) * 100;
                    return (
                      <div key={date} className="flex-1 group relative flex flex-col justify-end h-full">
                        <div
                          className="w-full rounded-t-sm bg-[#BF56FF]/40 group-hover:bg-[#BF56FF]/70 transition-colors cursor-default"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        {count > 0 && (
                          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="v4-card rounded-md px-2 py-1 text-[10px] text-slate-900 dark:text-white whitespace-nowrap">
                              {date}: {count}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-[#52525B]">30 days ago</span>
                  <span className="text-[10px] text-slate-400 dark:text-[#52525B]">Today</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#52525B]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-[#BF56FF]/40 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-[#A1A1AA] focus:outline-none focus:border-[#BF56FF]/40 transition-colors cursor-pointer"
          >
            <option value="all">All Intents</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-600 dark:text-[#A1A1AA] focus:outline-none focus:border-[#BF56FF]/40 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] pointer-events-none" />
        </div>
      </div>

      {/* Leads Table */}
      {paginatedLeads.length === 0 ? (
        <div className="v4-card rounded-2xl p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.04] mx-auto mb-4">
            <Users className="h-7 w-7 text-slate-400 dark:text-[#52525B]" />
          </div>
          <p className="text-base font-medium text-slate-900 dark:text-white mb-1">
            {searchQuery || intentFilter !== 'all' || statusFilter !== 'all'
              ? 'No matching leads'
              : 'No leads captured yet'}
          </p>
          <p className="text-sm text-slate-400 dark:text-[#71717A]">
            {searchQuery || intentFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Leads will appear here when visitors submit the form on your chatbot'}
          </p>
        </div>
      ) : (
        <div className="v4-card rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2.5fr_90px_90px_110px_100px] gap-4 px-5 py-2.5 border-b border-slate-100 dark:border-white/[0.04]">
            {['Name', 'Email', 'Intent', 'Status', 'Source', 'Date'].map((h) => (
              <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#52525B]">{h}</span>
            ))}
          </div>

          {paginatedLeads.map((lead, idx) => (
            <div
              key={lead.dataId}
              onClick={() => handleOpenDetail(lead)}
              className={`grid grid-cols-[2fr_2.5fr_90px_90px_110px_100px] gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                idx < paginatedLeads.length - 1 ? 'border-b border-slate-100 dark:border-white/[0.04]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#BF56FF]/10">
                  <User className="h-3.5 w-3.5 text-[#BF56FF]" />
                </div>
                <span className="text-sm text-slate-900 dark:text-white truncate">{lead.data?.name || '—'}</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-[#A1A1AA] truncate self-center">{lead.data?.email || '—'}</span>
              <div className="self-center"><IntentBadge intent={lead.intent} /></div>
              <div className="self-center"><StatusBadge status={lead.status} /></div>
              <span className="text-xs text-slate-400 dark:text-[#71717A] truncate self-center">
                {lead.sourcePage
                  ? (() => { try { return new URL(lead.sourcePage).pathname; } catch { return lead.sourcePage; } })()
                  : '—'}
              </span>
              <span className="text-xs text-slate-400 dark:text-[#71717A] self-center">
                {lead.dataCreatedAt
                  ? new Date(lead.dataCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.04] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400 dark:text-[#71717A]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-[#A1A1AA] hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-slate-400 dark:text-[#71717A] px-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-[#A1A1AA] hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-[#0E0E10] border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#BF56FF]/10">
                  <User className="h-4 w-4 text-[#BF56FF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedLead.data?.name || 'Lead Details'}</p>
                  <p className="text-xs text-slate-400 dark:text-[#71717A]">
                    {selectedLead.dataCreatedAt
                      ? new Date(selectedLead.dataCreatedAt).toLocaleString()
                      : 'Unknown date'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-[#71717A] hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Contact info */}
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedLead.data?.name && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <User className="h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] flex-shrink-0" />
                    <span className="text-slate-900 dark:text-white">{selectedLead.data.name}</span>
                  </div>
                )}
                {selectedLead.data?.email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] flex-shrink-0" />
                    <span className="text-slate-900 dark:text-white">{selectedLead.data.email}</span>
                  </div>
                )}
                {selectedLead.data?.phone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] flex-shrink-0" />
                    <span className="text-slate-900 dark:text-white">{selectedLead.data.phone}</span>
                  </div>
                )}
                {selectedLead.data?.company && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] flex-shrink-0" />
                    <span className="text-slate-900 dark:text-white">{selectedLead.data.company}</span>
                  </div>
                )}
              </div>

              {/* Custom fields */}
              {selectedLead.data &&
                Object.entries(selectedLead.data).filter(([k]) => !['name','email','phone','company'].includes(k)).length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider">Additional Info</p>
                    {Object.entries(selectedLead.data)
                      .filter(([k]) => !['name','email','phone','company'].includes(k))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2.5 text-sm">
                          <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] flex-shrink-0" />
                          <span className="text-slate-400 dark:text-[#71717A] capitalize">{key}:</span>
                          <span className="text-slate-900 dark:text-white">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                )}

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2">
                <IntentBadge intent={selectedLead.intent} />
                {selectedLead.triggerType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-[#A1A1AA] border border-slate-200 dark:border-white/[0.08] capitalize">
                    {selectedLead.triggerType.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Status & Notes */}
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 dark:text-[#A1A1AA] w-14">Status</span>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#BF56FF]/40 transition-colors cursor-pointer"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#52525B] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-slate-500 dark:text-[#A1A1AA]">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-[#BF56FF]/40 resize-none transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveDetail}
                    disabled={savingDetail}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingDetail ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Conversation Transcript
                </p>
                {detailLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                        <div className={`v4-shimmer rounded-xl h-9 ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
                      </div>
                    ))}
                  </div>
                ) : transcript.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-[#52525B] italic">No conversation transcript available</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-3">
                    {transcript.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-slate-800 dark:bg-white text-white dark:text-[#08080A]'
                              : 'bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.06]'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Configuration */}
      <div className="v4-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setFieldsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04]">
              <Settings className="h-4 w-4 text-slate-500 dark:text-[#A1A1AA]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Lead Capture Configuration</p>
              <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">Configure triggers, form fields, and display settings</p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 dark:text-[#A1A1AA] transition-transform duration-200 ${fieldsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {fieldsOpen && (
          <div className="border-t border-slate-100 dark:border-white/[0.06] px-5 pb-5 pt-4 space-y-5">
            {/* Enable toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Enable Lead Capture</p>
                <p className="text-xs text-slate-400 dark:text-[#71717A] mt-0.5">Show lead capture form in your chatbot widget</p>
              </div>
              <Toggle
                checked={triggerConfig.enabled}
                onChange={(checked) => setTriggerConfig((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            {triggerConfig.enabled && (
              <>
                {/* Trigger Type */}
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-2.5">Trigger Type</p>
                  <div className="space-y-2">
                    {TRIGGER_TYPES.map((t) => (
                      <label
                        key={t.value}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                          triggerConfig.triggerType === t.value
                            ? 'border-[#BF56FF]/40 bg-[#BF56FF]/[0.06]'
                            : 'border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="triggerType"
                          value={t.value}
                          checked={triggerConfig.triggerType === t.value}
                          onChange={() => setTriggerConfig((prev) => ({ ...prev, triggerType: t.value }))}
                          className="accent-[#BF56FF]"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{t.label}</p>
                          <p className="text-xs text-slate-400 dark:text-[#71717A]">{t.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message Threshold */}
                {triggerConfig.triggerType === 'after_messages' && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-1.5">
                      Message Threshold
                    </p>
                    <p className="text-xs text-slate-400 dark:text-[#52525B] mb-2">Number of user messages before showing the form</p>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={triggerConfig.messageThreshold}
                      onChange={(e) =>
                        setTriggerConfig((prev) => ({
                          ...prev,
                          messageThreshold: Math.max(1, Math.min(20, Number(e.target.value) || 3)),
                        }))
                      }
                      className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#BF56FF]/40 transition-colors"
                    />
                  </div>
                )}

                {/* Form Style */}
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-2.5">Form Display Style</p>
                  <div className="flex gap-3">
                    {[
                      { value: 'popup', label: 'Popup', desc: 'Overlay card' },
                      { value: 'inline', label: 'Inline', desc: 'In message flow' },
                    ].map((s) => (
                      <label
                        key={s.value}
                        className={`flex-1 flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${
                          triggerConfig.formStyle === s.value
                            ? 'border-[#BF56FF]/40 bg-[#BF56FF]/[0.06]'
                            : 'border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formStyle"
                          value={s.value}
                          checked={triggerConfig.formStyle === s.value}
                          onChange={() => setTriggerConfig((prev) => ({ ...prev, formStyle: s.value }))}
                          className="accent-[#BF56FF]"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{s.label}</p>
                          <p className="text-xs text-slate-400 dark:text-[#71717A]">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Title */}
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-2">Form Title</p>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contact Form"
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-[#BF56FF]/40 transition-colors"
                  />
                </div>

                {/* Form Fields */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-400 dark:text-[#71717A] uppercase tracking-wider">Form Fields</p>
                    <button
                      onClick={addCustomField}
                      disabled={fieldsList.length >= 20}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/[0.10] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.16] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {fieldsList.map((field, index) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-3"
                      >
                        <div className="flex-1 grid gap-2 sm:grid-cols-3">
                          <input
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            placeholder="Field name"
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-[#BF56FF]/40 transition-colors"
                          />
                          <input
                            value={field.description}
                            onChange={(e) => updateField(index, { description: e.target.value })}
                            placeholder="Placeholder text"
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-[#BF56FF]/40 transition-colors"
                          />
                          <div className="flex items-center gap-2">
                            <Toggle
                              checked={field.required}
                              onChange={(checked) => updateField(index, { required: checked })}
                            />
                            <span className="text-xs text-slate-400 dark:text-[#71717A]">Required</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeField(index)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-[#52525B] hover:text-[#EC4899] hover:bg-[#EC4899]/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveFields}
                disabled={savingFields}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-[#08080A] hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {savingFields ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
