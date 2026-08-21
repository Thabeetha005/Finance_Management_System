import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { 
  Mail, CheckCircle, ChevronDown, ChevronUp, Eye, EyeOff, 
  CheckCheck, Bell, Shield, Video, HandCoins, TrendingUp, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CustomerInboxPage = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all messages for current user
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['customerMessages'],
    queryFn: async () => {
      const res = await api.get('/messages/me');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  // Mark single message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
    }
  });

  // Mark all messages as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/messages/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
      toast.success('All notifications marked as seen.');
    }
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'UNREAD') return !m.isRead;
    if (activeTab === 'READ') return m.isRead;
    if (activeTab === 'CONSULTATION') return m.relatedEntityType === 'CONSULTATION' || m.messageType === 'NOTIFICATION';
    if (activeTab === 'LOAN') return m.relatedEntityType === 'LOAN';
    if (activeTab === 'INVESTMENT') return m.relatedEntityType === 'INVESTMENT';
    if (activeTab === 'SYSTEM') return m.messageType === 'SYSTEM' || m.senderRole === 'ADMIN';
    return true;
  });

  const handleToggleExpand = (msg) => {
    const msgId = msg.id || msg._id;
    if (expandedMessageId === msgId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(msgId);
      if (!msg.isRead) {
        markAsReadMutation.mutate(msgId);
      }
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Notifications' },
    { key: 'UNREAD', label: `Unseen (${unreadCount})` },
    { key: 'READ', label: 'Seen' },
    { key: 'CONSULTATION', label: 'Consultations' },
    { key: 'LOAN', label: 'Loans' },
    { key: 'INVESTMENT', label: 'Investments' },
  ];

  const getEntityIcon = (type, role) => {
    if (type === 'CONSULTATION') return <Video className="w-4 h-4 text-purple-600" />;
    if (type === 'LOAN') return <HandCoins className="w-4 h-4 text-blue-600" />;
    if (type === 'INVESTMENT') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (role === 'ADMIN') return <Shield className="w-4 h-4 text-amber-600" />;
    return <Bell className="w-4 h-4 text-teal-600" />;
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '';
    try {
      return new Date(dtStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(dtStr);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b4d3e]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="text-[#1b4d3e] w-6 h-6" />
              Inbox & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-amber-500 text-white rounded-full">
                {unreadCount} Unseen
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Real-time status updates, consultation alerts, and system notifications.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors border border-emerald-200 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Seen
          </button>
        )}
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Navigation Filter Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide bg-gray-50/50 p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.key 
                  ? 'bg-white text-[#1b4d3e] shadow-sm border border-gray-100' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm space-y-2">
              <Mail className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
              <p className="font-semibold text-gray-600">No notifications found in this category.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const msgId = msg.id || msg._id;
              const isUnread = !msg.isRead;
              const isExpanded = expandedMessageId === msgId;

              return (
                <div 
                  key={msgId} 
                  className={`transition-colors ${isUnread ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'bg-white hover:bg-gray-50/60'}`}
                >
                  <div 
                    className="p-5 cursor-pointer flex items-start justify-between gap-4"
                    onClick={() => handleToggleExpand(msg)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-xl bg-gray-100 border border-gray-200 mt-0.5 flex-shrink-0">
                        {getEntityIcon(msg.relatedEntityType, msg.senderRole)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* Sender Role Tag */}
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md uppercase tracking-wider">
                            {msg.senderRole || msg.relatedEntityType || 'SYSTEM'}
                          </span>

                          {/* Created Timestamp */}
                          <span className="text-xs text-gray-400 font-medium">
                            {formatDateTime(msg.createdAt)}
                          </span>
                        </div>

                        {/* Subject */}
                        <h3 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'} truncate`}>
                          {msg.subject || 'System Notification'}
                        </h3>
                      </div>
                    </div>

                    {/* SEEN vs UNSEEN STATUS BADGE */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isUnread ? (
                        <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5 shadow-sm">
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          Unseen
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Seen {msg.readAt ? formatDateTime(msg.readAt) : ''}
                        </span>
                      )}

                      <div className="text-gray-400 p-1 hover:text-gray-600 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Message Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 text-xs text-gray-700 border-t border-gray-100 bg-gray-50/50 space-y-4">
                      <div className="p-4 rounded-xl bg-white border border-gray-200/80 leading-relaxed font-medium mt-3 whitespace-pre-wrap">
                        {msg.messageContent || msg.message || msg.body || 'No detailed content available.'}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <span>Message ID: #{msgId}</span>
                        {isUnread ? (
                          <span className="text-amber-600 font-bold">Marked as Seen upon opening</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Recorded in audit history</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInboxPage;
