'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadsApi } from '@/lib/api';
import { Button, Input, Label } from '@corpusai/ui';
import {
  ArrowLeft,
  Download,
  Settings,
  Search,
  Trash2,
  Mail,
  Phone,
  User,
} from 'lucide-react';

interface Lead {
  leadId: string;
  name?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, any>;
  createdAt: number;
}

interface LeadField {
  key: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'select';
  required: boolean;
  options?: string[];
}

export default function LeadsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [fields, setFields] = useState<LeadField[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFieldsModal, setShowFieldsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, fieldsData] = await Promise.all([
        leadsApi.list(chatbotId),
        leadsApi.getFields(chatbotId),
      ]);

      setLeads(leadsData.leads || []);
      setFields(fieldsData.fields || []);
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

  const handleDelete = async (leadId: string) => {
    if (!confirm('Delete this lead?')) return;

    try {
      // DELETE endpoint would be added to backend
      setLeads(leads.filter((l) => l.leadId !== leadId));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query)
    );
  });

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF56FF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/chatbots')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chatbots
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
              <p className="mt-2 text-gray-600">
                Manage captured leads from your chatbot
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFieldsModal(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configure Form
              </Button>
              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {leads.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {
                leads.filter(
                  (l) =>
                    new Date(l.createdAt).getMonth() === new Date().getMonth()
                ).length
              }
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No leads yet
            </h3>
            <p className="text-gray-600 mb-6">
              Leads will appear here when visitors submit the form
            </p>
            <Button
              variant="outline"
              onClick={() => setShowFieldsModal(true)}
            >
              Configure Lead Form
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.leadId}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {lead.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {lead.email || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {lead.phone || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.leadId)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Builder Modal (simplified) */}
        {showFieldsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-2xl w-full rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Lead Form Configuration
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowFieldsModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {getFieldIcon(field.type)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {field.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {field.type}
                          {field.required && ' • Required'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No fields configured yet.</p>
                    <p className="text-sm mt-2">
                      Default fields (name, email, phone) will be used.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFieldsModal(false)}
                >
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
