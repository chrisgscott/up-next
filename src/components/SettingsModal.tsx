'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { getAvailableCalendars, Calendar as CalendarType } from '@/lib/calendars';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCalendars: string[];
  onCalendarToggle: (calendarId: string) => void;
  accessToken: string;
  onCalendarsLoaded?: (calendars: CalendarType[]) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  selectedCalendars,
  onCalendarToggle,
  accessToken,
  onCalendarsLoaded
}: SettingsModalProps) {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && accessToken) {
      setTimeout(() => setLoading(true), 0);
      getAvailableCalendars(accessToken)
        .then(calendars => {
          setCalendars(calendars);
          onCalendarsLoaded?.(calendars);
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [isOpen, accessToken, onCalendarsLoaded]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide">CALENDARS</h2>
              <p className="text-zinc-500 text-sm">Select which calendars to display</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2.5 rounded-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-zinc-500">Loading calendars...</p>
            </div>
          ) : calendars.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Calendar size={24} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 mb-1">No calendars found</p>
              <p className="text-zinc-600 text-sm">Make sure you have calendars in your Google account</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calendars.map((calendar, index) => {
                const isSelected = selectedCalendars.includes(calendar.id);

                return (
                  <button
                    key={calendar.id}
                    onClick={() => onCalendarToggle(calendar.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group animate-slide-in ${
                      isSelected
                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                        : 'bg-zinc-800/50 border border-transparent hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{
                      opacity: 0,
                      animationDelay: `${index * 40}ms`
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Custom checkbox */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-zinc-600 group-hover:border-zinc-500'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                            {calendar.summary}
                          </span>
                          {calendar.primary && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Primary
                            </span>
                          )}
                        </div>
                        {calendar.description && (
                          <p className={`text-sm mt-1 truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {calendar.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-sm">
              {selectedCalendars.length} of {calendars.length} selected
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
