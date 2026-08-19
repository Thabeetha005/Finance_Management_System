import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { HelpCircle, Plus, X, Clock, CheckCircle, AlertCircle, FileText, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CustomerSupportPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    category: 'GENERAL',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const res = await api.get('/support/tickets');
      return res.data;
    }
  });

  const createTicketMutation = useMutation({
    mutationFn: async (newTicket) => {
      const res = await api.post('/support/tickets', newTicket);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setIsFormOpen(false);
      setFormData({ category: 'GENERAL', subject: '', description: '', priority: 'MEDIUM' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to submit ticket');
      console.error(err);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTicketMutation.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-2xl w-full"></div>
        <div className="h-64 bg-gray-100 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="text-[#1b4d3e]" />
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Submit and track your support requests.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1b4d3e] text-white rounded-lg hover:bg-[#153a2f] transition-colors font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-250px)] flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Your Tickets</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {tickets.length === 0 ? (
                <div className="text-center p-8 text-gray-500 text-sm">No tickets found. Create one to get started.</div>
              ) : (
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket.id || ticket._id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-xl cursor-pointer border transition-colors ${selectedTicket?.id === ticket.id ? 'border-[#1b4d3e] bg-emerald-50/30' : 'border-gray-100 hover:border-emerald-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-500">{ticket.ticketNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-[#1b4d3e]">{selectedTicket.ticketNumber}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">Category</div>
                    <div className="text-sm font-bold text-gray-900">{selectedTicket.category}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="space-y-6">
                  {/* Original Request */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">You</div>
                      <div className="text-sm font-bold text-gray-900">Description</div>
                      <div className="text-xs text-gray-400 ml-auto">{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</div>
                  </div>

                  {/* Admin Resolution */}
                  {selectedTicket.status === 'RESOLVED' && selectedTicket.adminResponse && (
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-bold text-[#1b4d3e]">Support Agent</div>
                        <div className="text-xs text-emerald-600/70 ml-auto">{new Date(selectedTicket.resolvedAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-emerald-900 whitespace-pre-wrap">{selectedTicket.adminResponse}</div>
                      
                      {selectedTicket.resolutionNotes && (
                        <div className="mt-4 pt-4 border-t border-emerald-200/50">
                          <div className="text-xs font-bold text-emerald-800 mb-1">Resolution Notes:</div>
                          <div className="text-sm text-emerald-700">{selectedTicket.resolutionNotes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-16 h-16 text-gray-200 mb-4" />
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b4d3e]/20 focus:border-[#1b4d3e] outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="GENERAL">General Inquiry</option>
                  <option value="PAYMENT">Payment Issue</option>
                  <option value="TECHNICAL">Technical Issue</option>
                  <option value="LOAN">Loan Related</option>
                  <option value="INVESTMENT">Investment Related</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b4d3e]/20 focus:border-[#1b4d3e] outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b4d3e]/20 focus:border-[#1b4d3e] outline-none"
                  placeholder="Brief summary of the issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1b4d3e]/20 focus:border-[#1b4d3e] outline-none min-h-[120px] resize-none"
                  placeholder="Please provide details about your issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </form>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                disabled={createTicketMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={createTicketMutation.isPending}
                className="px-6 py-2 bg-[#1b4d3e] text-white font-bold rounded-lg hover:bg-[#153a2f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {createTicketMutation.isPending ? 'Submitting...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSupportPage;
