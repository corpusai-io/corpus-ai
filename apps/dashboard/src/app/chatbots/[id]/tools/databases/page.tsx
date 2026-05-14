'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Table,
  Server,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  ArrowRight,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { databaseApi, type DbSslConfig } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DatabaseType = 'postgresql' | 'mysql' | 'mssql' | 'mongodb';

interface DatabaseConnection {
  id: string;
  dbType: DatabaseType;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: 'connected' | 'error';
  selectedTables: string[];
  sslEnabled?: boolean;
  mssqlEncrypt?: boolean;
  createdAt?: number;
  updatedAt?: number;
  schemaLastSynced?: number;
}

const DB_TYPE_META: Record<DatabaseType, { label: string; defaultPort: string; color: string; icon: string }> = {
  postgresql: { label: 'PostgreSQL', defaultPort: '5432',  color: 'bg-surface border border-line text-ink', icon: 'PG' },
  mysql:      { label: 'MySQL',      defaultPort: '3306',  color: 'bg-surface border border-line text-ink', icon: 'MY' },
  mongodb:    { label: 'MongoDB',    defaultPort: '27017', color: 'bg-surface border border-line text-ink', icon: 'MG' },
  mssql:      { label: 'SQL Server', defaultPort: '1433',  color: 'bg-surface border border-line text-ink', icon: 'MS' },
};

const EXAMPLE_QUERIES = [
  'How many users signed up this month?',
  'Show top 10 products by revenue',
  "What's the average order value?",
];

const MAX_TABLES = 10;

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function FieldInput({
  id, value, onChange, placeholder, type = 'text', disabled = false, className = '', style
}: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; className?: string; style?: React.CSSProperties;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      className={`w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Portal Modal
// ---------------------------------------------------------------------------

function SimpleModal({
  open,
  onClose,
  children,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full bg-[#0E0E10] rounded-2xl border border-white/[0.08] shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#71717A] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function WizardStepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive    = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : isActive
                    ? 'bg-ink text-white'
                    : 'bg-white/[0.06] text-[#71717A]'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`mt-1.5 text-[11px] font-medium ${
                isActive ? 'text-ink' : isCompleted ? 'text-[#22C55E]' : 'text-[#71717A]'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded-full ${isCompleted ? 'bg-[#22C55E]/60' : 'bg-white/[0.06]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SSL Section (MySQL, PostgreSQL)
// ---------------------------------------------------------------------------

interface SslSectionProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  ca: string;
  onCa: (v: string) => void;
  cert: string;
  onCert: (v: string) => void;
  key: string;
  onKey: (v: string) => void;
  rejectUnauthorized: boolean;
  onRejectUnauthorized: (v: boolean) => void;
}

function SslSection({ enabled, onToggle, ca, onCa, cert, onCert, key: keyVal, onKey, rejectUnauthorized, onRejectUnauthorized }: SslSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#71717A]" />
          <span className="text-sm font-medium text-[#A1A1AA]">SSL / TLS</span>
          {enabled && (
            <span className="inline-flex items-center rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
              Enabled
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[#71717A]" /> : <ChevronDown className="h-4 w-4 text-[#71717A]" />}
      </button>

      {expanded && (
        <div className="px-4 py-4 space-y-4 border-t border-white/[0.06]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-4 w-4 rounded accent-[#171717] cursor-pointer"
            />
            <span className="text-sm text-[#A1A1AA]">Enable SSL/TLS encryption</span>
          </label>

          {enabled && (
            <>
              <label className="flex items-center gap-3 cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={rejectUnauthorized}
                  onChange={(e) => onRejectUnauthorized(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#171717] cursor-pointer"
                />
                <div>
                  <span className="text-sm text-[#A1A1AA]">Verify server certificate</span>
                  <p className="text-xs text-[#71717A]">Uncheck only for self-signed certs in dev environments</p>
                </div>
              </label>

              <div>
                <label htmlFor="sslCa" className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] mb-1.5">
                  CA Certificate <span className="text-[#71717A] font-normal">(optional)</span>
                </label>
                <textarea
                  id="sslCa"
                  value={ca}
                  onChange={(e) => onCa(e.target.value)}
                  placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
                  rows={4}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-mono text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none resize-y"
                />
                <p className="mt-1 text-xs text-[#71717A]">Paste the CA certificate PEM content</p>
              </div>

              <div>
                <label htmlFor="sslCert" className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Client Certificate <span className="text-[#71717A] font-normal">(optional)</span>
                </label>
                <textarea
                  id="sslCert"
                  value={cert}
                  onChange={(e) => onCert(e.target.value)}
                  placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
                  rows={4}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-mono text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none resize-y"
                />
              </div>

              <div>
                <label htmlFor="sslKey" className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Client Key <span className="text-[#71717A] font-normal">(optional)</span>
                </label>
                <textarea
                  id="sslKey"
                  value={keyVal}
                  onChange={(e) => onKey(e.target.value)}
                  placeholder={"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"}
                  rows={4}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-mono text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none resize-y"
                />
                <p className="mt-1 text-xs text-[#71717A]">Paste the private key PEM content</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MSSQL Encryption Section
// ---------------------------------------------------------------------------

function MssqlEncryptionSection({ encrypt, onEncrypt, trustCert, onTrustCert }: {
  encrypt: boolean; onEncrypt: (v: boolean) => void; trustCert: boolean; onTrustCert: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#71717A]" />
          <span className="text-sm font-medium text-[#A1A1AA]">Encryption Settings</span>
          {encrypt && (
            <span className="inline-flex items-center rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
              Encrypted
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[#71717A]" /> : <ChevronDown className="h-4 w-4 text-[#71717A]" />}
      </button>

      {expanded && (
        <div className="px-4 py-4 space-y-4 border-t border-white/[0.06]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={encrypt}
              onChange={(e) => onEncrypt(e.target.checked)}
              className="h-4 w-4 rounded accent-[#171717] cursor-pointer mt-0.5"
            />
            <div>
              <span className="text-sm text-[#A1A1AA]">Encrypt connection</span>
              <p className="text-xs text-[#71717A] mt-0.5">Required for Azure SQL Database and SQL Server with TLS enabled</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trustCert}
              onChange={(e) => onTrustCert(e.target.checked)}
              className="h-4 w-4 rounded accent-[#171717] cursor-pointer mt-0.5"
            />
            <div>
              <span className="text-sm text-[#A1A1AA]">Trust server certificate</span>
              <p className="text-xs text-[#71717A] mt-0.5">Bypass certificate validation. Disable on production Azure SQL if you have a valid cert.</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NL Query Answer (renders markdown tables/lists from formatter)
// ---------------------------------------------------------------------------

function NlQueryAnswer({ answer }: { answer: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border-collapse border border-white/[0.08]">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
        th: ({ children }) => (
          <th className="border border-white/[0.08] px-3 py-1.5 text-left font-semibold text-[#A1A1AA] whitespace-nowrap">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-white/[0.08] px-3 py-1.5 text-[#A1A1AA]">{children}</td>
        ),
        tr: ({ children }) => <tr className="even:bg-white/[0.02]">{children}</tr>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        p: ({ children }) => <p className="mb-1 last:mb-0 text-[#A1A1AA]">{children}</p>,
      }}
    >
      {answer}
    </ReactMarkdown>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DatabasesPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Step 1
  const [selectedType, setSelectedType] = useState<DatabaseType | null>(null);

  // Step 2: credentials
  const [credForm, setCredForm] = useState({ name: '', host: '', port: '', database: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // SSL
  const [sslEnabled, setSslEnabled]                     = useState(false);
  const [sslCa, setSslCa]                               = useState('');
  const [sslCert, setSslCert]                           = useState('');
  const [sslKey, setSslKey]                             = useState('');
  const [sslRejectUnauthorized, setSslRejectUnauthorized] = useState(true);

  // MSSQL
  const [mssqlEncrypt, setMssqlEncrypt]   = useState(false);
  const [mssqlTrustCert, setMssqlTrustCert] = useState(true);

  // MongoDB
  const [mongoAuthSource, setMongoAuthSource]                   = useState('');
  const [mongoUseConnectionString, setMongoUseConnectionString] = useState(false);
  const [mongoConnectionString, setMongoConnectionString]       = useState('');

  // Connection test
  const [isConnecting, setIsConnecting]           = useState(false);
  const [connectionResult, setConnectionResult]   = useState<'idle' | 'success' | 'fail'>('idle');
  const [connectionError, setConnectionError]     = useState('');

  // Step 3: Tables
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables]   = useState<string[]>([]);
  const [tableFilter, setTableFilter]         = useState('');
  const [isFetchingTables, setIsFetchingTables] = useState(false);
  const [tablesError, setTablesError]         = useState('');

  // Step 4
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // Refresh schema
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshNotification, setRefreshNotification] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

  // NL query
  const [queryText, setQueryText]   = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    answer: string; executedQuery: string; queryType: 'sql' | 'mql'; rowCount: number; connectionName: string; duration: number;
  } | null>(null);
  const [queryError, setQueryError] = useState('');

  // ------- Load connections -------

  const loadConnections = useCallback(async () => {
    try {
      setLoadingConnections(true);
      const data = await databaseApi.getConnections(chatbotId);
      setDatabases(data.connections || []);
    } catch (err) {
      console.error('Failed to load database connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  }, [chatbotId]);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  // ------- Wizard helpers -------

  function resetAdvanced() {
    setSslEnabled(false); setSslCa(''); setSslCert(''); setSslKey(''); setSslRejectUnauthorized(true);
    setMssqlEncrypt(false); setMssqlTrustCert(true);
    setMongoAuthSource(''); setMongoUseConnectionString(false); setMongoConnectionString('');
  }

  function openWizard() {
    setWizardStep(1);
    setSelectedType(null);
    setCredForm({ name: '', host: '', port: '', database: '', username: '', password: '' });
    setShowPassword(false);
    setIsConnecting(false);
    setConnectionResult('idle');
    setConnectionError('');
    setAvailableTables([]);
    setSelectedTables([]);
    setTableFilter('');
    setTablesError('');
    setIsFetchingTables(false);
    setIsSaving(false);
    resetAdvanced();
    setWizardOpen(true);
  }

  function closeWizard() { setWizardOpen(false); }

  function buildPayload() {
    const base = {
      dbType: selectedType!,
      host: credForm.host.trim(),
      port: Number(credForm.port),
      database: credForm.database.trim(),
      username: credForm.username.trim(),
      password: credForm.password,
    };
    if (selectedType === 'mysql' || selectedType === 'postgresql') {
      return {
        ...base,
        ssl: sslEnabled ? {
          enabled: true,
          rejectUnauthorized: sslRejectUnauthorized,
          ...(sslCa.trim() ? { ca: sslCa.trim() } : {}),
          ...(sslCert.trim() ? { cert: sslCert.trim() } : {}),
          ...(sslKey.trim() ? { key: sslKey.trim() } : {}),
        } : { enabled: false },
      };
    }
    if (selectedType === 'mssql') return { ...base, mssqlEncrypt, mssqlTrustServerCert: mssqlTrustCert };
    if (selectedType === 'mongodb') {
      if (mongoUseConnectionString) return { ...base, mongoConnectionString: mongoConnectionString.trim() };
      return { ...base, ...(mongoAuthSource.trim() ? { mongoAuthSource: mongoAuthSource.trim() } : {}) };
    }
    return base;
  }

  function handleSelectType(type: DatabaseType) {
    setSelectedType(type);
    setCredForm((prev) => ({ ...prev, port: DB_TYPE_META[type].defaultPort }));
    setConnectionResult('idle');
    setConnectionError('');
    setWizardStep(2);
  }

  async function handleTestConnection() {
    setIsConnecting(true);
    setConnectionResult('idle');
    setConnectionError('');
    try {
      const result = await databaseApi.testConnection(buildPayload());
      if (result.success) { setConnectionResult('success'); }
      else { setConnectionResult('fail'); setConnectionError(result.error || 'Connection failed. Please check your credentials.'); }
    } catch (err: any) {
      setConnectionResult('fail');
      setConnectionError(err.message || 'Connection failed. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleProceedToTables() {
    setIsFetchingTables(true);
    setTablesError('');
    setWizardStep(3);
    try {
      const result = await databaseApi.fetchTables(buildPayload());
      if (result.error) { setTablesError(result.error); setAvailableTables([]); }
      else { setAvailableTables(result.tables || []); }
    } catch (err: any) {
      setTablesError(err.message || 'Failed to fetch tables');
      setAvailableTables([]);
    } finally {
      setIsFetchingTables(false);
    }
  }

  function toggleTable(table: string) {
    setSelectedTables((prev) => {
      if (prev.includes(table)) return prev.filter((t) => t !== table);
      if (prev.length >= MAX_TABLES) return prev;
      return [...prev, table];
    });
  }

  async function handleFinish() {
    if (!selectedType) return;
    setIsSaving(true);
    try {
      const payload = buildPayload();
      const result = await databaseApi.saveConnection({
        ...payload,
        chatbotId,
        name: credForm.name || credForm.database || 'MongoDB',
        selectedTables,
      });
      if (result.success && result.connection) {
        setDatabases((prev) => [...prev, result.connection]);
      }
      setWizardStep(4);
    } catch (err: any) {
      console.error('Failed to save connection:', err);
      setTablesError(err.message || 'Failed to save connection');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      await databaseApi.deleteConnection(id);
      setDatabases((prev) => prev.filter((db) => db.id !== id));
    } catch (err) {
      console.error('Failed to delete connection:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleRefreshSchema(connectionId: string) {
    setRefreshingId(connectionId);
    setRefreshNotification(null);
    try {
      await databaseApi.refreshSchema(connectionId);
      await loadConnections();
      setRefreshNotification({ id: connectionId, type: 'success', message: 'Database schema has been updated.' });
    } catch (err: any) {
      setRefreshNotification({ id: connectionId, type: 'error', message: err.message || 'Failed to refresh schema.' });
    } finally {
      setRefreshingId(null);
    }
  }

  async function handleNlQuery() {
    if (!queryText.trim()) return;
    setIsQuerying(true);
    setQueryResult(null);
    setQueryError('');
    try {
      const result = await databaseApi.nlQuery(chatbotId, queryText.trim());
      if (result.success && result.answer) {
        setQueryResult({
          answer: result.answer,
          executedQuery: result.executedQuery || '',
          queryType: result.queryType || 'sql',
          rowCount: result.rowCount || 0,
          connectionName: result.connectionName || '',
          duration: result.duration || 0,
        });
      } else {
        setQueryError(result.error || 'No result returned. Try refreshing the schema.');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Query failed');
    } finally {
      setIsQuerying(false);
    }
  }

  const isMongoWithCstr = selectedType === 'mongodb' && mongoUseConnectionString;
  const credValid = isMongoWithCstr
    ? mongoConnectionString.trim().length > 0
    : credForm.host.trim().length > 0 &&
      credForm.database.trim().length > 0 &&
      (selectedType === 'mongodb' || credForm.username.trim().length > 0);

  const filteredTables = tableFilter
    ? availableTables.filter((t) => t.toLowerCase().includes(tableFilter.toLowerCase()))
    : availableTables;

  // ------- Render -------

  return (
    <div className="space-y-8 v4-animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Databases</h1>
          <p className="mt-1 text-[#71717A]">
            Connect external databases to enable natural language SQL queries through your chatbot
          </p>
        </div>
        {databases.length > 0 && (
          <button
            onClick={openWizard}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Connect Database
          </button>
        )}
      </div>

      {/* Loading */}
      {loadingConnections && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-ink" />
        </div>
      )}

      {/* Empty state */}
      {!loadingConnections && databases.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] p-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04]">
            <Database className="h-10 w-10 text-[#3F3F46]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No databases connected</h3>
          <p className="mx-auto max-w-md text-[#71717A] mb-6">
            Connect your first database to start querying data with natural language
          </p>
          <button
            onClick={openWizard}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect Database
          </button>
        </div>
      )}

      {/* Connection list */}
      {!loadingConnections && databases.length > 0 && (
        <div className="space-y-4">
          {databases.map((db) => {
            const meta = DB_TYPE_META[db.dbType as DatabaseType];
            if (!meta) return null;
            return (
              <div key={db.id} className="v4-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink/10">
                      <Database className="h-6 w-6 text-ink" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white truncate">{db.name}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <span className={`inline-block h-2 w-2 rounded-full ${db.status === 'connected' ? 'bg-[#22C55E]' : 'bg-ink'}`} />
                          <span className={db.status === 'connected' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                            {db.status === 'connected' ? 'Connected' : 'Error'}
                          </span>
                        </span>
                        {db.sslEnabled && (
                          <span className="flex items-center gap-1 text-xs text-[#60A5FA]">
                            <Shield className="h-3 w-3" /> SSL
                          </span>
                        )}
                        {db.mssqlEncrypt && (
                          <span className="flex items-center gap-1 text-xs text-[#60A5FA]">
                            <Lock className="h-3 w-3" /> Encrypted
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#71717A]">Port {db.port}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#71717A]">
                        <span className="flex items-center gap-1">
                          <Table className="h-3.5 w-3.5" />
                          {(db.selectedTables || []).length} tables selected
                        </span>
                        {db.createdAt && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Connected {new Date(db.createdAt).toLocaleString()}
                          </span>
                        )}
                        {db.schemaLastSynced && db.schemaLastSynced > 0 ? (
                          <span>Schema synced: {new Date(db.schemaLastSynced).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-[#F59E0B]">Schema not yet synced</span>
                        )}
                      </div>
                      {refreshNotification && refreshNotification.id === db.id && (
                        <div className={`mt-2 flex items-center gap-2 rounded-lg px-2 py-1 text-xs ${refreshNotification.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-ink/10 text-[#EF4444]'}`}>
                          {refreshNotification.type === 'success'
                            ? <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                            : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                          {refreshNotification.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleRefreshSchema(db.id)}
                      disabled={refreshingId === db.id}
                      title="Refresh schema"
                      className="rounded-lg border border-white/[0.10] p-2 text-[#A1A1AA] hover:text-white hover:border-white/[0.20] transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshingId === db.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(db.id)}
                      className="rounded-lg border border-line p-2 text-[#EF4444] hover:bg-ink/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NL Query panel */}
      {databases.length > 0 && (
        <div className="v4-card p-6">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-5 w-5 text-ink" />
            <h2 className="text-lg font-semibold text-white">Natural Language Query</h2>
          </div>
          <p className="mb-4 text-sm text-[#71717A]">Test how your chatbot queries the database. Ask questions in plain English.</p>

          {/* Example chips */}
          <div className="mb-3 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button key={q} type="button" onClick={() => setQueryText(q)}
                className="cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#A1A1AA] transition-colors hover:border-ink hover:bg-ink/[0.06] hover:text-ink">
                {q}
              </button>
            ))}
          </div>

          {/* Input + Send */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
              <input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isQuerying) handleNlQuery(); }}
                placeholder="e.g. How many orders were placed this week?"
                disabled={isQuerying}
                className="w-full rounded-lg border border-line bg-canvas pl-10 pr-4 py-2 text-sm text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none transition-colors disabled:opacity-40"
              />
            </div>
            <button
              onClick={handleNlQuery}
              disabled={!queryText.trim() || isQuerying}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            </button>
          </div>

          {/* Results */}
          {isQuerying && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8">
              <Loader2 className="h-5 w-5 animate-spin text-ink" />
              <span className="text-sm text-[#71717A]">Querying database...</span>
            </div>
          )}

          {!isQuerying && queryError && (
            <div className="flex items-start gap-2 rounded-xl bg-ink/[0.06] border border-line px-4 py-3">
              <XCircle className="h-4 w-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-sm text-[#EF4444]">{queryError}</p>
            </div>
          )}

          {!isQuerying && queryResult && (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-[#71717A]">
                  <Database className="h-3.5 w-3.5 text-ink" />
                  <span className="font-medium text-[#A1A1AA]">{queryResult.connectionName}</span>
                  <span>·</span>
                  <span>{queryResult.rowCount} row{queryResult.rowCount !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{queryResult.duration}ms</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  queryResult.queryType === 'mql'
                    ? 'bg-[#22C55E]/10 text-[#22C55E]'
                    : 'bg-[#60A5FA]/10 text-[#60A5FA]'
                }`}>
                  {queryResult.queryType}
                </span>
              </div>
              <div className="px-4 py-3 text-sm">
                <NlQueryAnswer answer={queryResult.answer} />
              </div>
              {queryResult.executedQuery && (
                <details className="border-t border-white/[0.06]">
                  <summary className="px-4 py-2 text-xs text-[#71717A] cursor-pointer hover:text-[#A1A1AA] select-none bg-white/[0.02]">
                    View {queryResult.queryType === 'mql' ? 'MQL' : 'SQL'} query
                  </summary>
                  <pre className="px-4 py-3 text-xs font-mono text-[#A1A1AA] bg-white/[0.02] overflow-x-auto whitespace-pre-wrap">
                    {queryResult.executedQuery}
                  </pre>
                </details>
              )}
            </div>
          )}

          {!isQuerying && !queryResult && !queryError && (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <Table className="mx-auto mb-2 h-8 w-8 text-[#3F3F46]" />
              <p className="text-sm text-[#71717A]">Query results will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Wizard                                                            */}
      {/* ================================================================= */}
      <SimpleModal open={wizardOpen} onClose={closeWizard} className="max-w-xl">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Server className="h-5 w-5 text-ink" />
            Connect a Database
          </h2>
          <p className="mt-1 text-sm text-[#71717A]">
            {wizardStep === 4 ? 'Your database has been connected successfully!' : 'Follow the steps below to connect your database.'}
          </p>
        </div>

        {wizardStep < 4 && (
          <WizardStepIndicator currentStep={wizardStep} steps={['Select Type', 'Credentials', 'Select Tables']} />
        )}

        {/* ============ Step 1: Select Type ============ */}
        {wizardStep === 1 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-[#71717A]">
              Choose the type of database you want to connect.
              <span className="block mt-1 text-xs text-[#F59E0B]">Note: One database per chatbot.</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(DB_TYPE_META) as DatabaseType[]).map((type) => {
                const meta = DB_TYPE_META[type];
                return (
                  <button key={type} type="button" onClick={() => handleSelectType(type)}
                    className="cursor-pointer flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:border-ink hover:bg-ink/[0.04]">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{meta.label}</p>
                      <p className="text-xs text-[#71717A]">Port {meta.defaultPort}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ Step 2: Credentials ============ */}
        {wizardStep === 2 && selectedType && (
          <div className="space-y-4 py-2">
            {/* Security badge */}
            <div className="flex items-center gap-2 rounded-xl bg-[#22C55E]/[0.06] border border-[#22C55E]/20 px-3 py-2">
              <Shield className="h-4 w-4 text-[#22C55E]" />
              <p className="text-xs text-[#22C55E]">Your credentials are encrypted with AES-256 encryption</p>
            </div>

            {/* MongoDB: Connection String toggle */}
            {selectedType === 'mongodb' && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mongoUseConnectionString}
                    onChange={(e) => {
                      setMongoUseConnectionString(e.target.checked);
                      setConnectionResult('idle');
                      setConnectionError('');
                    }}
                    className="h-4 w-4 rounded accent-[#171717] cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
                      <Link className="h-3.5 w-3.5" />
                      Use Connection String
                    </span>
                    <p className="text-xs text-[#71717A] mt-0.5">For MongoDB Atlas or custom URI (mongodb+srv://...)</p>
                  </div>
                </label>
              </div>
            )}

            {/* MongoDB connection string input */}
            {selectedType === 'mongodb' && mongoUseConnectionString ? (
              <>
                <div>
                  <label htmlFor="connName" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Connection Name</label>
                  <FieldInput id="connName" value={credForm.name} onChange={(v) => setCredForm((p) => ({ ...p, name: v }))} placeholder="e.g. Atlas Production" />
                </div>
                <div>
                  <label htmlFor="mongoUri" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Connection String</label>
                  <FieldInput id="mongoUri" type="password" value={mongoConnectionString} onChange={setMongoConnectionString}
                    placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname" style={{ fontFamily: 'monospace' }} />
                  <p className="mt-1 text-xs text-[#71717A]">Include database name in the URI. Credentials are encrypted before storage.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="connName" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Connection Name</label>
                  <FieldInput id="connName" value={credForm.name} onChange={(v) => setCredForm((p) => ({ ...p, name: v }))} placeholder="e.g. Production DB" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="host" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                      {selectedType === 'mssql' ? 'Server / Host' : 'Host'}
                    </label>
                    <FieldInput id="host" value={credForm.host} onChange={(v) => setCredForm((p) => ({ ...p, host: v }))}
                      placeholder={selectedType === 'mssql' ? 'server.database.windows.net' : 'localhost or db.example.com'} />
                  </div>
                  <div>
                    <label htmlFor="port" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Port</label>
                    <FieldInput id="port" value={credForm.port} onChange={(v) => setCredForm((p) => ({ ...p, port: v }))}
                      placeholder={DB_TYPE_META[selectedType].defaultPort} />
                  </div>
                </div>
                <div>
                  <label htmlFor="dbname" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    {selectedType === 'mongodb' ? 'Database / Auth DB' : 'Database Name'}
                  </label>
                  <FieldInput id="dbname" value={credForm.database} onChange={(v) => setCredForm((p) => ({ ...p, database: v }))}
                    placeholder={selectedType === 'mongodb' ? 'myDatabase' : 'my_database'} />
                </div>
                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Username</label>
                  <FieldInput id="username" value={credForm.username} onChange={(v) => setCredForm((p) => ({ ...p, username: v }))} placeholder="db_user" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                    <FieldInput id="password" type={showPassword ? 'text' : 'password'} value={credForm.password}
                      onChange={(v) => setCredForm((p) => ({ ...p, password: v }))} placeholder="••••••••" className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white cursor-pointer transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* MongoDB: Auth Source */}
                {selectedType === 'mongodb' && (
                  <div>
                    <label htmlFor="mongoAuthSource" className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] mb-1.5">
                      Auth Source <span className="text-[#71717A] font-normal">(optional)</span>
                    </label>
                    <FieldInput id="mongoAuthSource" value={mongoAuthSource} onChange={setMongoAuthSource} placeholder="admin" />
                    <p className="mt-1 text-xs text-[#71717A]">The database used for authentication. Defaults to the database field above.</p>
                  </div>
                )}
              </>
            )}

            {/* SSL section */}
            {(selectedType === 'mysql' || selectedType === 'postgresql') && (
              <SslSection
                enabled={sslEnabled} onToggle={setSslEnabled}
                ca={sslCa} onCa={setSslCa}
                cert={sslCert} onCert={setSslCert}
                key={sslKey} onKey={setSslKey}
                rejectUnauthorized={sslRejectUnauthorized} onRejectUnauthorized={setSslRejectUnauthorized}
              />
            )}

            {/* MSSQL encryption */}
            {selectedType === 'mssql' && (
              <MssqlEncryptionSection
                encrypt={mssqlEncrypt} onEncrypt={setMssqlEncrypt}
                trustCert={mssqlTrustCert} onTrustCert={setMssqlTrustCert}
              />
            )}

            {/* Test result banners */}
            {connectionResult === 'success' && (
              <div className="flex items-center gap-2 rounded-xl bg-[#22C55E]/[0.06] border border-[#22C55E]/20 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                <p className="text-sm text-[#22C55E] font-medium">Connection successful!</p>
              </div>
            )}
            {connectionResult === 'fail' && (
              <div className="flex items-start gap-2 rounded-xl bg-ink/[0.06] border border-line px-3 py-2">
                <XCircle className="h-4 w-4 text-[#EF4444] mt-0.5 shrink-0" />
                <p className="text-sm text-[#EF4444] font-medium">{connectionError}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => { setWizardStep(1); setConnectionResult('idle'); setConnectionError(''); }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.20] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex gap-2">
                {connectionResult !== 'success' && (
                  <button
                    onClick={handleTestConnection}
                    disabled={!credValid || isConnecting}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.20] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
                    {isConnecting ? 'Testing...' : 'Test Connection'}
                  </button>
                )}
                {connectionResult === 'success' && (
                  <button
                    onClick={handleProceedToTables}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ Step 3: Select Tables ============ */}
        {wizardStep === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#71717A]">
                Select the {selectedType === 'mongodb' ? 'collections' : 'tables'} your chatbot can query (up to {MAX_TABLES}).
              </p>
              <span className="text-xs font-medium text-ink">{selectedTables.length}/{MAX_TABLES} selected</span>
            </div>

            {isFetchingTables && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-ink mr-2" />
                <span className="text-sm text-[#71717A]">
                  Fetching {selectedType === 'mongodb' ? 'collections' : 'tables'}...
                </span>
              </div>
            )}

            {!isFetchingTables && tablesError && (
              <div className="flex items-start gap-2 rounded-xl bg-ink/[0.06] border border-line px-3 py-2">
                <XCircle className="h-4 w-4 text-[#EF4444] mt-0.5 shrink-0" />
                <p className="text-sm text-[#EF4444]">{tablesError}</p>
              </div>
            )}

            {!isFetchingTables && !tablesError && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <input
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    placeholder={`Search ${selectedType === 'mongodb' ? 'collections' : 'tables'}...`}
                    className="w-full rounded-lg border border-line bg-canvas pl-10 pr-4 py-2 text-sm text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none transition-colors"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-white/[0.08] divide-y divide-white/[0.06]">
                  {filteredTables.map((table) => {
                    const isSelected = selectedTables.includes(table);
                    const isDisabled = !isSelected && selectedTables.length >= MAX_TABLES;
                    return (
                      <label key={table}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-ink/[0.06]' : 'hover:bg-white/[0.03]'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && toggleTable(table)}
                          disabled={isDisabled}
                          className="h-4 w-4 rounded accent-[#171717] cursor-pointer"
                        />
                        <Table className="h-3.5 w-3.5 text-[#71717A] shrink-0" />
                        <span className="text-sm text-[#A1A1AA]">{table}</span>
                      </label>
                    );
                  })}
                  {filteredTables.length === 0 && availableTables.length > 0 && (
                    <div className="px-4 py-6 text-center text-sm text-[#71717A]">No results match your search</div>
                  )}
                  {availableTables.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-[#71717A]">
                      No {selectedType === 'mongodb' ? 'collections' : 'tables'} found in this database
                    </div>
                  )}
                </div>

                {selectedTables.length >= MAX_TABLES && (
                  <p className="text-xs text-[#F59E0B]">
                    Maximum of {MAX_TABLES} {selectedType === 'mongodb' ? 'collections' : 'tables'} reached.
                  </p>
                )}
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setWizardStep(2)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.20] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={selectedTables.length === 0 || isFetchingTables || isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>Connect Database <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============ Step 4: Success ============ */}
        {wizardStep === 4 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/10">
              <CheckCircle className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Database Connected Successfully!</h3>
            <p className="text-sm text-[#71717A] mb-1">
              <span className="font-medium text-white">{credForm.name || credForm.database || 'MongoDB'}</span>
              {selectedType && ` (${DB_TYPE_META[selectedType].label})`}
            </p>
            <p className="text-sm text-[#71717A] mb-6">
              {selectedTables.length} {selectedType === 'mongodb' ? 'collection' : 'table'}{selectedTables.length !== 1 ? 's' : ''} selected for querying
            </p>
            <button
              onClick={closeWizard}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </SimpleModal>

      {/* Delete Confirmation */}
      <SimpleModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/10">
            <Trash2 className="h-5 w-5 text-[#EF4444]" />
          </div>
          <h2 className="text-base font-semibold text-white">Remove Database</h2>
        </div>
        <p className="text-sm text-[#A1A1AA] mb-6">
          Are you sure you want to remove this database connection? This will not affect the external database itself, only the link from your chatbot.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            className="rounded-xl border border-white/[0.10] px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:border-white/[0.20] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteTarget && handleDelete(deleteTarget)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/80 transition-colors disabled:opacity-40"
          >
            {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</> : 'Remove'}
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
