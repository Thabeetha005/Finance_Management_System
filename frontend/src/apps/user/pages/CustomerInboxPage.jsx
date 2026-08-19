import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { Mail, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerInboxPage = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['customerMessages'],
    queryFn: async () => {
      const res = await api.get('/messages/me');
      return res.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMessages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
    }
  });

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'UNREAD') return !m.isRead;
    if (activeTab !== 'ALL') return m.type === activeTab;
    return true;
  });

  const handleToggleExpand = (msg) => {
    if (expandedMessageId === msg._id || expandedMessageId === msg.id) {
      setExpandedMessageId(null);
    } else {
      const msgId = msg._id || msg.id;
      setExpandedMessageId(msgId);
      if (!msg.isRead) {
        markAsReadMutation.mutate(msgId);
      }
    }
  };

  const tabs = ['ALL', 'UNREAD', 'SYSTEM', 'LOAN', 'INVESTMENT', 'SUPPORT'];

  if (isLoading) return <div className="p-6">Loading inbox...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-[#1b4d3e]" />
            Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your notifications and messages.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab ? 'border-b-2 border-[#1b4d3e] text-[#1b4d3e]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No messages found.</div>
          ) : (
            filteredMessages.map((msg) => {
              const msgId = msg._id || msg.id;
              return (
              <div key={msgId} className={`transition-colors ${!msg.isRead ? 'bg-[#f0fdf4]' : 'bg-white hover:bg-gray-50'}`}>
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => handleToggleExpand(msg)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{msg.type}</span>
                      <span className="text-xs text-gray-400">• {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className={`text-base ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {msg.subject}
                    </h3>
                  </div>
                  <div className="ml-4 text-gray-400">
                    {expandedMessageId === msgId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {expandedMessageId === msgId && (
                  <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-50/50 bg-gray-50/30">
                    <div className="mt-4 whitespace-pre-wrap">{msg.body}</div>
                    {msg.actionUrl ? (
                      <div className="mt-4">
                        <a 
                          href={msg.actionUrl} 
                          className="inline-flex items-center justify-center px-4 py-2 bg-[#1b4d3e] text-white rounded-lg text-sm font-bold hover:bg-[#153a2f] transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    ) : msg.type === 'SUPPORT_TICKET' ? (
                      <div className="mt-4">
                        <Link 
                          to="/profile/support"
                          className="inline-flex items-center justify-center px-4 py-2 bg-[#1b4d3e] text-white rounded-lg text-sm font-bold hover:bg-[#153a2f] transition-colors"
                        >
                          View Ticket
                        </Link>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInboxPage;
