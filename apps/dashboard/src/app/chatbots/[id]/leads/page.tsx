'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
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
  X,
  FileText,
  Users,
} from 'lucide-react';
import { Eyebrow, Stat, Pill, Button, Divider } from '@/components/corpus';

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
  intentBreakdown:  { hot: number; warm: number; cold: number };
  statusBreakdown: { new: number; contacted: number; converted: number; archived: number };
  leadsOverTime:   Record<string, number>;
}

const ITEMS_PER_PAGE = 10;

const TRIGGER_TYPES = [
  { value: 'gated',          label: 'Before chat (gated)',     desc: 'Show form before chat starts' },
  { value: 'after_messages', label: 'After X messages',         desc: 'Show form after a number of messages' },
  { value: 'high_intent',    label: 'High intent detected',     desc: 'Trigger when pricing/purchase keywords appear' },
  { value: 'cant_answer',    label: "Can't answer",             desc: "Trigger when the bot can't answer" },
  { value: 'exit_intent',    label: 'Exit intent',              desc: 'Trigger when the user tries to leave' },
];

const DEFAULT_FIELDS: LeadField[] = [
  { key: 'name',    name: 'Name',    description: 'Your full name',        required: true  },
  { key: 'email',   name: 'Email',   description: 'Your email address',    required: true  },
  { key: 'phone',   name: 'Phone',   description: 'Your phone number',     required: false },
  { key: 'company', name: 'Company', description: 'Company name',          required: false },
];

/* ─── Typographic Intent tick ─────────────────────────────── */
const INTENT_CFG: Record<string, { color: string; label: string }> = {
  hot:  { color: '#EF4444', label: 'HOT'  },
  warm: { color: '#F59E0B', label: 'WARM' },
  cold: { color: '#A1A1A1', label: 'COLD' },
};
function IntentTick({ intent }: { intent?: string }) {
  const cfg = INTENT_CFG[intent || 'cold'] || { color: '#C4C4C4', label: 'UNKNOWN' };
  return (
    <span className="inline-flex items-center gap-2">
      <span style={{ width: 4, height: 12, borderRadius: 2, background: cfg.color }} />
      <span
        className="font-mono uppercase text-[11px] font-medium text-ink"
        style={{ letterSpacing: '0.14em' }}
      >
        {cfg.label}
      </span>
    </span>
  );
}

/* ─── Typographic status tick ─────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; label: string; pulse: boolean }> = {
  new:       { color: '#171717', label: 'NEW',       pulse: true  },
  contacted: { color: '#F59E0B', label: 'CONTACTED', pulse: false },
  converted: { color: '#10B981', label: 'CONVERTED', pulse: false },
  archived:  { color: '#C4C4C4', label: 'ARCHIVED',  pulse: false },
};
function StatusTick({ status }: { status?: string }) {
  const cfg = STATUS_CFG[status || 'new'] || STATUS_CFG.new;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cfg.pulse ? 'st-pulse' : ''}
        style={{ width: 4, height: 12, borderRadius: 2, background: cfg.color, ['--st-c' as string]: cfg.color }}
      />
      <span
        className="font-mono uppercase text-[11px] font-medium text-ink"
        style={{ letterSpacing: '0.14em' }}
      >
        {cfg.label}
      </span>
    </span>
  );
}

/* ─── Toggle ──────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
        checked ? 'bg-ink' : 'bg-line-strong'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
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
        <div className="space-y-2"><div className="w-24 h-2.5 rounded v4-shimmer" /><div className="w-48 h-7 rounded v4-shimmer" /></div>
        <div className="w-28 h-9 rounded-lg v4-shimmer" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="v4-card p-5 space-y-2">
            <div className="w-16 h-2.5 rounded v4-shimmer" />
            <div className="w-12 h-7 rounded v4-shimmer" />
          </div>
        ))}
      </div>
      <div className="v4-card overflow-hidden">
        {[...Array(5)].map((_, i) => <div key={i} className="px-5 py-4 border-b border-line flex gap-4"><div className="w-8 h-8 rounded-full v4-shimmer" /><div className="flex-1 h-4 rounded v4-shimmer" /></div>)}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [leads,         setLeads]         = useState<Lead[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [currentPage,   setCurrentPage]   = useState(1);
  const [intentFilter,  setIntentFilter]  = useState<string>('all');
  const [statusFilter,  setStatusFilter]  = useState<string>('all');

  const [fieldsList,    setFieldsList]    = useState<LeadField[]>(DEFAULT_FIELDS);
  const [formTitle,     setFormTitle]     = useState('Contact form');
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>({
    triggerType: 'gated',
    messageThreshold: 3,
    formStyle: 'popup',
    enabled: false,
  });
  const [savingFields,  setSavingFields]  = useState(false);
  const [fieldsOpen,    setFieldsOpen]    = useState(false);

  const [selectedLead,  setSelectedLead]  = useState<Lead | null>(null);
  const [transcript,    setTranscript]    = useState<TranscriptMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editStatus,    setEditStatus]    = useState('');
  const [editNotes,     setEditNotes]     = useState('');
  const [savingDetail,  setSavingDetail]  = useState(false);

  const [analytics,     setAnalytics]     = useState<Analytics | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

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
    <div className="space-y-8 v4-animate-in">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Leads</Eyebrow>
          <h1
            className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-ink">Captured leads.</span>{' '}
            <span className="text-muted">Triaged by intent.</span>
          </h1>
        </div>
        <Button variant="primary" icon={Download} onClick={handleExport} disabled={leads.length === 0}>
          Export CSV
        </Button>
      </div>

      {/* Analytics collapse */}
      {analytics && (
        <div className="v4-card overflow-hidden">
          <button
            onClick={() => setAnalyticsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
          >
            <div>
              <Eyebrow>Analytics</Eyebrow>
              <p className="text-[13px] text-ink mt-1">{analytics.total} total leads</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-soft transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`} />
          </button>

          {analyticsOpen && (
            <div className="border-t border-line px-5 pb-5 pt-4 space-y-5">
              <div>
                <Eyebrow className="mb-3">Intent breakdown</Eyebrow>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="[HOT]"  value={analytics.intentBreakdown.hot}  sub="High intent" />
                  <Stat label="[WARM]" value={analytics.intentBreakdown.warm} sub="Engaged"     />
                  <Stat label="[COLD]" value={analytics.intentBreakdown.cold} sub="Low intent"  />
                </div>
              </div>

              <div>
                <Eyebrow className="mb-3">Status breakdown</Eyebrow>
                <div className="grid gap-2 sm:grid-cols-4">
                  {Object.entries(analytics.statusBreakdown).map(([key, count]) => (
                    <div key={key} className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                      <p className="font-display text-2xl font-medium text-ink" style={{ letterSpacing: '-0.02em' }}>{count}</p>
                      <p className="text-[11px] text-muted-soft font-mono uppercase mt-1" style={{ letterSpacing: '0.14em' }}>{key}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Eyebrow className="mb-3">Leads — last 30 days</Eyebrow>
                <div className="flex items-end gap-px h-20">
                  {Object.entries(analytics.leadsOverTime).map(([date, count]) => {
                    const pct = (count / maxBar) * 100;
                    return (
                      <div key={date} className="flex-1 group relative flex flex-col justify-end h-full">
                        <div
                          className="w-full rounded-t-sm bg-line-strong group-hover:bg-ink transition-colors cursor-default"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        {count > 0 && (
                          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="rounded-md bg-canvas border border-line px-2 py-1 text-[10px] text-ink whitespace-nowrap shadow-sm">
                              {date}: {count}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="font-mono text-[10px] text-muted-soft">30 days ago</span>
                  <span className="font-mono text-[10px] text-muted-soft">Today</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-muted-soft" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
          >
            <option value="all">All intents</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {paginatedLeads.length === 0 ? (
        <div className="v4-card p-16 text-center">
          <Users className="mx-auto w-9 h-9 text-line-strong mb-3" />
          <p className="text-[14px] font-medium text-ink mb-1">
            {searchQuery || intentFilter !== 'all' || statusFilter !== 'all' ? 'No matching leads' : 'No leads captured yet'}
          </p>
          <p className="text-[12px] text-muted-soft">
            {searchQuery || intentFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Leads appear here when visitors submit the form on your chatbot.'}
          </p>
        </div>
      ) : (
        <div className="v4-card overflow-hidden">
          <div className="grid grid-cols-[2fr_2.5fr_110px_110px_110px_110px] gap-4 px-5 py-2.5 border-b border-line bg-surface/50">
            {['Name', 'Email', 'Intent', 'Status', 'Source', 'Date'].map((h) => (
              <span
                key={h}
                className="font-mono uppercase text-[10px] font-semibold text-muted-soft"
                style={{ letterSpacing: '0.14em' }}
              >
                {h}
              </span>
            ))}
          </div>

          {paginatedLeads.map((lead, idx) => (
            <div
              key={lead.dataId}
              onClick={() => handleOpenDetail(lead)}
              className={`grid grid-cols-[2fr_2.5fr_110px_110px_110px_110px] gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface transition-colors ${
                idx < paginatedLeads.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface border border-line">
                  <User className="w-3.5 h-3.5 text-muted" />
                </div>
                <span className="text-[13px] text-ink truncate">{lead.data?.name || '—'}</span>
              </div>
              <span className="text-[13px] text-muted truncate self-center">{lead.data?.email || '—'}</span>
              <div className="self-center"><IntentTick intent={lead.intent} /></div>
              <div className="self-center"><StatusTick status={lead.status} /></div>
              <span className="text-[12px] text-muted-soft truncate self-center font-mono">
                {lead.sourcePage
                  ? (() => { try { return new URL(lead.sourcePage).pathname; } catch { return lead.sourcePage; } })()
                  : '—'}
              </span>
              <span className="text-[12px] text-muted-soft self-center font-mono">
                {lead.dataCreatedAt
                  ? new Date(lead.dataCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          ))}

          <div className="flex flex-col gap-2 border-t border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-muted-soft font-mono">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted-soft hover:text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[12px] text-muted font-mono px-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted-soft hover:text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedLead(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-canvas border border-line shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-line">
                  <User className="w-4 h-4 text-ink" />
                </div>
                <div>
                  <Eyebrow>Lead</Eyebrow>
                  <p className="text-[13px] font-medium text-ink mt-0.5">{selectedLead.data?.name || 'Details'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-soft hover:text-ink hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedLead.data?.name && (
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <User className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
                    <span className="text-ink">{selectedLead.data.name}</span>
                  </div>
                )}
                {selectedLead.data?.email && (
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <Mail className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
                    <span className="text-ink">{selectedLead.data.email}</span>
                  </div>
                )}
                {selectedLead.data?.phone && (
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <Phone className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
                    <span className="text-ink">{selectedLead.data.phone}</span>
                  </div>
                )}
                {selectedLead.data?.company && (
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <Building2 className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
                    <span className="text-ink">{selectedLead.data.company}</span>
                  </div>
                )}
              </div>

              {selectedLead.data &&
                Object.entries(selectedLead.data).filter(([k]) => !['name','email','phone','company'].includes(k)).length > 0 && (
                  <div className="space-y-1.5">
                    <Eyebrow>Additional info</Eyebrow>
                    {Object.entries(selectedLead.data)
                      .filter(([k]) => !['name','email','phone','company'].includes(k))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2.5 text-[13px]">
                          <FileText className="w-3.5 h-3.5 text-muted-soft flex-shrink-0" />
                          <span className="text-muted capitalize">{key}:</span>
                          <span className="text-ink">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                )}

              <div className="flex flex-wrap gap-3 items-center">
                <IntentTick intent={selectedLead.intent} />
                {selectedLead.triggerType && (
                  <Pill variant="mono">{selectedLead.triggerType.replace('_', ' ')}</Pill>
                )}
              </div>

              <div className="rounded-xl border border-line bg-surface/50 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-muted w-14">Status</span>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-canvas border border-line text-[13px] text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-soft pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink resize-none transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" size="sm" icon={Save} onClick={handleSaveDetail} disabled={savingDetail}>
                    {savingDetail ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-mono uppercase text-[10px] font-semibold text-muted-soft mb-3 flex items-center gap-2" style={{ letterSpacing: '0.14em' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Conversation transcript
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
                  <p className="text-[13px] text-muted-soft italic">No conversation transcript available.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-line bg-surface/50 p-3">
                    {transcript.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 text-[13px] ${
                          msg.role === 'user' ? 'bg-ink text-white' : 'bg-canvas border border-line text-ink'
                        }`}>
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

      {/* Capture config */}
      <div className="v4-card overflow-hidden">
        <button
          onClick={() => setFieldsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-line">
              <Settings className="w-4 h-4 text-ink" />
            </div>
            <div className="text-left">
              <Eyebrow>Capture</Eyebrow>
              <p className="text-[13px] text-ink mt-0.5">Triggers, form fields, display style</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-soft transition-transform duration-200 ${fieldsOpen ? 'rotate-180' : ''}`} />
        </button>

        {fieldsOpen && (
          <div className="border-t border-line px-5 pb-5 pt-4 space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface/50 p-4">
              <div>
                <p className="text-[13px] font-medium text-ink">Enable lead capture</p>
                <p className="text-[12px] text-muted-soft mt-0.5">Show the lead form inside the chatbot widget.</p>
              </div>
              <Toggle
                checked={triggerConfig.enabled}
                onChange={(checked) => setTriggerConfig((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            {triggerConfig.enabled && (
              <>
                <div>
                  <Eyebrow className="mb-3">Trigger</Eyebrow>
                  <div className="space-y-2">
                    {TRIGGER_TYPES.map((t) => (
                      <label
                        key={t.value}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                          triggerConfig.triggerType === t.value
                            ? 'border-ink bg-surface'
                            : 'border-line hover:bg-surface'
                        }`}
                      >
                        <input
                          type="radio"
                          name="triggerType"
                          value={t.value}
                          checked={triggerConfig.triggerType === t.value}
                          onChange={() => setTriggerConfig((prev) => ({ ...prev, triggerType: t.value }))}
                          className="accent-[#171717]"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-ink">{t.label}</p>
                          <p className="text-[12px] text-muted-soft">{t.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {triggerConfig.triggerType === 'after_messages' && (
                  <div>
                    <Eyebrow className="mb-2">Message threshold</Eyebrow>
                    <p className="text-[12px] text-muted-soft mb-2">Number of user messages before showing the form.</p>
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
                      className="w-24 px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                )}

                <div>
                  <Eyebrow className="mb-3">Display style</Eyebrow>
                  <div className="flex gap-3">
                    {[
                      { value: 'popup',  label: 'Popup',  desc: 'Overlay card' },
                      { value: 'inline', label: 'Inline', desc: 'In message flow' },
                    ].map((s) => (
                      <label
                        key={s.value}
                        className={`flex-1 flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${
                          triggerConfig.formStyle === s.value
                            ? 'border-ink bg-surface'
                            : 'border-line hover:bg-surface'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formStyle"
                          value={s.value}
                          checked={triggerConfig.formStyle === s.value}
                          onChange={() => setTriggerConfig((prev) => ({ ...prev, formStyle: s.value }))}
                          className="accent-[#171717]"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-ink">{s.label}</p>
                          <p className="text-[12px] text-muted-soft">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Eyebrow className="mb-2">Form title</Eyebrow>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contact form"
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Eyebrow>Form fields</Eyebrow>
                    <Button variant="secondary" size="sm" icon={Plus} onClick={addCustomField} disabled={fieldsList.length >= 20}>
                      Add field
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {fieldsList.map((field, index) => (
                      <div key={field.key} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface/50 p-3">
                        <div className="flex-1 grid gap-2 sm:grid-cols-3">
                          <input
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            placeholder="Field name"
                            className="px-3 py-1.5 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                          />
                          <input
                            value={field.description}
                            onChange={(e) => updateField(index, { description: e.target.value })}
                            placeholder="Placeholder"
                            className="px-3 py-1.5 rounded-lg bg-canvas border border-line text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                          />
                          <div className="flex items-center gap-2">
                            <Toggle checked={field.required} onChange={(checked) => updateField(index, { required: checked })} />
                            <span className="text-[12px] text-muted">Required</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeField(index)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-soft hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Divider />
            <div className="flex justify-end pt-1">
              <Button variant="primary" icon={Save} onClick={handleSaveFields} disabled={savingFields}>
                {savingFields ? 'Saving…' : 'Save configuration'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
