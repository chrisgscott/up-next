'use client';

import { useState, useCallback, useMemo } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useCurrentTime, getTimeUntilEvent } from '@/hooks/useTime';
import { useCalendarSelection } from '@/hooks/useCalendarSelection';
import { SettingsModal } from '@/components/SettingsModal';
import { Calendar } from '@/lib/calendars';
import { CalendarEvent } from '@/lib/calendar';
import { Settings, LogOut, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';

type UrgencyLevel = 'urgent' | 'warning' | 'calm' | 'none';

function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 6,
  urgency
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  urgency: UrgencyLevel;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const strokeColor = {
    urgent: '#ef4444',
    warning: '#f59e0b',
    calm: '#6366f1',
    none: '#52525b'
  }[urgency];

  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
    >
      {/* Background ring */}
      <circle
        stroke="rgba(255,255,255,0.06)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress ring */}
      <circle
        className="progress-ring-circle"
        stroke={strokeColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: offset,
        }}
      />
    </svg>
  );
}

export default function Home() {
  const { accessToken, isLoading, signIn, signOut } = useGoogleAuth();
  const { selectedCalendars, toggleCalendar } = useCalendarSelection();
  const { events, nextEvent, error } = useCalendar(accessToken, selectedCalendars);
  const { formattedDate, timeDisplay } = useCurrentTime();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [calendarNames, setCalendarNames] = useState<Record<string, string>>({});

  const handleCalendarsLoaded = useCallback((calendars: Calendar[]) => {
    const names: Record<string, string> = {};
    calendars.forEach(cal => {
      names[cal.id] = cal.summary;
    });
    setCalendarNames(names);
  }, []);

  const isEventPast = (event: CalendarEvent) => {
    if (!event.end.dateTime) return false;
    return new Date(event.end.dateTime) < new Date();
  };

  const getUrgencyLevel = (event: CalendarEvent | undefined): UrgencyLevel => {
    if (!event || !event.start.dateTime) return 'none';
    const now = new Date();
    const eventStart = new Date(event.start.dateTime);
    const minutesUntil = (eventStart.getTime() - now.getTime()) / (1000 * 60);

    if (minutesUntil <= 15) return 'urgent';
    if (minutesUntil <= 30) return 'warning';
    return 'calm';
  };

  const getProgressUntilEvent = (event: CalendarEvent | undefined): number => {
    if (!event || !event.start.dateTime) return 0;
    const now = new Date();
    const eventStart = new Date(event.start.dateTime);
    const minutesUntil = (eventStart.getTime() - now.getTime()) / (1000 * 60);

    // Progress from 100% (60 min or more) down to 0% (event starting)
    const progress = Math.min(100, Math.max(0, (minutesUntil / 60) * 100));
    return 100 - progress; // Invert so it fills up as time approaches
  };

  const urgency = useMemo(() => getUrgencyLevel(nextEvent), [nextEvent]);
  const progress = useMemo(() => getProgressUntilEvent(nextEvent), [nextEvent]);

  const urgencyTextColors = {
    urgent: 'text-red-400',
    warning: 'text-amber-400',
    calm: 'text-indigo-400',
    none: 'text-zinc-500'
  };

  const urgencyBgColors = {
    urgent: 'bg-gradient-to-b from-red-950 via-red-950/50 to-transparent',
    warning: 'bg-gradient-to-b from-amber-950 via-amber-950/40 to-transparent',
    calm: 'bg-gradient-to-b from-indigo-950/60 via-indigo-950/20 to-transparent',
    none: ''
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-zinc-400 text-lg">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock size={40} className="text-white" />
            </div>
            <h1 className="font-display text-6xl tracking-wide mb-3">UP NEXT</h1>
            <p className="text-zinc-400 text-lg">Your next moment, always in view</p>
          </div>

          <button
            onClick={signIn}
            className="btn btn-primary inline-flex items-center gap-3 text-lg px-8 py-4"
          >
            <CalendarIcon size={22} />
            <span>Connect Google Calendar</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-zinc-600 text-sm mt-6">
            Securely access your calendar to see what&apos;s coming up
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-6 py-8 md:px-12 md:py-12 transition-all duration-1000 ${urgencyBgColors[urgency]}`}>
      <div className="max-w-5xl mx-auto">

        {/* Monumental Clock */}
        <section className="text-center mb-20 pt-8 animate-fade-in-up" style={{ opacity: 0 }}>
          <time className="font-display leading-none tracking-tight block whitespace-nowrap">
            <span className="text-[6rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem]">
              {timeDisplay}
            </span>
          </time>
          <p className="text-zinc-500 text-xl md:text-2xl mt-2 tracking-wide uppercase">
            {formattedDate}
          </p>
        </section>

        {/* Error message */}
        {error && (
          <div className="card card-urgent p-6 mb-8 animate-fade-in">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Next Event Hero */}
        <section className="mb-12 animate-fade-in-up delay-200" style={{ opacity: 0 }}>
          {nextEvent ? (
            <div className="card p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Progress Ring */}
                <div className="relative shrink-0">
                  <ProgressRing
                    progress={progress}
                    size={220}
                    strokeWidth={10}
                    urgency={urgency}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-display text-5xl md:text-6xl ${urgencyTextColors[urgency]} ${urgency === 'urgent' ? 'animate-countdown-pulse' : ''}`}>
                      {getTimeUntilEvent(nextEvent.start.dateTime!)}
                    </span>
                    <span className="text-zinc-500 text-base uppercase tracking-wider">until</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-zinc-500 text-base uppercase tracking-wider mb-2">Next Up</p>
                  <h2 className="font-display text-5xl md:text-7xl tracking-wide mb-4">
                    {nextEvent.summary}
                  </h2>
                  <p className="text-zinc-400 text-2xl">
                    {new Date(nextEvent.start.dateTime!).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {nextEvent.end.dateTime && (
                      <>
                        {' — '}
                        {new Date(nextEvent.end.dateTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </>
                    )}
                  </p>
                  {nextEvent.calendarId && calendarNames[nextEvent.calendarId] && (
                    <span className="inline-block mt-3 text-sm px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      {calendarNames[nextEvent.calendarId]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <CalendarIcon size={28} className="text-zinc-600" />
              </div>
              <h2 className="font-display text-3xl tracking-wide mb-2">ALL CLEAR</h2>
              <p className="text-zinc-500 text-lg">No more events scheduled for today</p>
            </div>
          )}
        </section>

        {/* Today's Events */}
        <section className="animate-fade-in-up delay-300" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl tracking-wide text-zinc-400">TODAY&apos;S SCHEDULE</h3>
            <span className="text-sm text-zinc-600">{events.length} events</span>
          </div>

          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => {
                const isPast = isEventPast(event);
                const isNext = event.id === nextEvent?.id;

                return (
                  <div
                    key={`${event.calendarId}-${event.id}`}
                    className={`event-item p-4 md:p-5 animate-slide-in ${isNext ? 'is-next' : ''} ${isPast ? 'is-past' : ''}`}
                    style={{
                      opacity: 0,
                      animationDelay: `${400 + index * 50}ms`
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Time indicator */}
                        <div className={`shrink-0 w-1.5 h-12 rounded-full ${
                          isNext ? 'bg-indigo-500' : isPast ? 'bg-zinc-700' : 'bg-zinc-600'
                        }`} />

                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className={`font-medium truncate ${isPast ? 'text-zinc-600' : 'text-white'}`}>
                              {event.summary}
                            </h4>
                            {isNext && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                Next
                              </span>
                            )}
                            {event.calendarId && calendarNames[event.calendarId] && (
                              <span className={`text-xs px-2 py-0.5 rounded-md ${
                                isPast ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                {calendarNames[event.calendarId]}
                              </span>
                            )}
                          </div>

                          <p className={`text-sm mt-1 ${isPast ? 'text-zinc-700' : 'text-zinc-500'}`}>
                            {event.start.dateTime ? (
                              <>
                                {new Date(event.start.dateTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                                {event.end.dateTime && (
                                  <>
                                    {' — '}
                                    {new Date(event.end.dateTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </>
                                )}
                              </>
                            ) : (
                              'All day'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Countdown for upcoming events */}
                      {event.start.dateTime && !isPast && (
                        <div className="text-right shrink-0">
                          <span className={`font-display text-2xl ${
                            isNext ? urgencyTextColors[urgency] : 'text-zinc-500'
                          }`}>
                            {getTimeUntilEvent(event.start.dateTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-zinc-500">No events scheduled for today</p>
            </div>
          )}
        </section>

        {/* Footer controls */}
        <footer className="flex justify-center gap-2 pt-8 pb-4 mt-8 border-t border-white/5 animate-fade-in-up delay-500" style={{ opacity: 0 }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-ghost p-3 text-zinc-600 hover:text-zinc-400"
            title="Calendar Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={signOut}
            className="btn btn-ghost p-3 text-zinc-600 hover:text-zinc-400"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedCalendars={selectedCalendars}
        onCalendarToggle={toggleCalendar}
        accessToken={accessToken!}
        onCalendarsLoaded={handleCalendarsLoaded}
      />
    </div>
  );
}
