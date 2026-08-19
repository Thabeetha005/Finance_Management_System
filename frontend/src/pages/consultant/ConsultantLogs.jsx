import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, FileText, Calendar, User } from 'lucide-react';
import api from '../../api/axios';

const ConsultantLogs = () => {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultant/sessions');
      const allSessions = Array.isArray(response.data) ? response.data : (response.data?.success ? response.data.data : []);
      
      const completed = allSessions.filter(session => session.status === 'COMPLETED');
      // Sort by date descending
      completed.sort((a, b) => {
        const dateA = a.assignment?.consultation?.preferredDate ? new Date(a.assignment.consultation.preferredDate) : new Date(0);
        const dateB = b.assignment?.consultation?.preferredDate ? new Date(b.assignment.consultation.preferredDate) : new Date(0);
        return dateB - dateA;
      });
      setCompletedSessions(completed);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Consultation Logs</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {completedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No completed sessions found in logs.
          </div>
        ) : (
          <div className="relative border-l border-gray-200 ml-3 space-y-8 py-4">
            {completedSessions.map((session, index) => {
              const consultation = session.assignment?.consultation;
              return (
                <div key={session.id || index} className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-green-100 rounded-full border-4 border-white flex items-center justify-center -left-3 top-0 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{consultation?.type || 'General Consultation'}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {consultation?.user?.name || 'Unknown Client'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {consultation?.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {consultation?.preferredTime || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full shrink-0">
                        Completed
                      </span>
                    </div>

                    {session.notes && session.notes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                          <FileText className="w-4 h-4" />
                          Consultant Report / Notes
                        </div>
                        {session.notes.map((note, i) => (
                          <p key={i} className="text-gray-600 text-sm whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-100 mb-2">
                            {note.content}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantLogs;
