'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AgendaHeader from '../components/AgendaHeader';
import DailyTimeline from '../components/DailyTimeline';
import MonthlyView from '../components/MonthlyView';
import { formatIndonesianDate, formatDigitalClock, sortAgendasByTime, getDateKey } from '../../lib/timeUtils';

export default function DashboardMonitorPage() {
  const [activeView, setActiveView] = useState('harian');
  const [currentTime, setCurrentTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendaList, setAgendaList] = useState([]);
  const [categories, setCategories] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [resAgendas, resCategories] = await Promise.all([
        fetch('/api/agendas'),
        fetch('/api/categories'),
      ]);

      const [jsonAgendas, jsonCategories] = await Promise.all([
        resAgendas.json(),
        resCategories.json(),
      ]);

      if (jsonCategories.success && Array.isArray(jsonCategories.data)) {
        setCategories(jsonCategories.data);
      }
      if (jsonAgendas.success && Array.isArray(jsonAgendas.data)) {
        setAgendaList(sortAgendasByTime(jsonAgendas.data));
      } else {
        setAgendaList([]);
      }
    } catch {
      setAgendaList([]);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh 30s
    const refreshTimer = setInterval(loadData, 30000);
    return () => clearInterval(refreshTimer);
  }, [loadData]);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = formatIndonesianDate(selectedDate);
  const liveClockString = currentTime ? formatDigitalClock(currentTime) : '';

  // Filter harian
  const dailyAgendas = useMemo(() => {
    const targetKey = getDateKey(selectedDate);
    return agendaList.filter((a) => a.dateKey === targetKey);
  }, [agendaList, selectedDate]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleToggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }
  };

  return (
    <div className="w-screen h-screen max-h-screen bg-[#f0f5fa] overflow-hidden flex flex-col">
      <div className="w-full h-screen max-h-screen p-[1.4rem_2rem] gap-0 overflow-hidden flex flex-1">
        <main className="w-full max-w-full h-full max-h-full p-[2rem_2.5rem_1rem] rounded-[20px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] bg-white border border-[#e8ecf2] flex flex-col overflow-hidden">
          <AgendaHeader
            currentDate={formattedDate}
            liveClock={liveClockString}
            activeView={activeView}
            onViewChange={setActiveView}
            showAddButton={false}
            isMonitorMode={true}
            onToggleFullscreen={handleToggleFullscreen}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
          />

          {activeView === 'harian' && (
            <DailyTimeline
              agendas={dailyAgendas}
              selectedAgendaId={null}
              currentTime={currentTime}
            />
          )}

          {activeView === 'bulanan' && (
            <MonthlyView
              agendas={agendaList}
              onSwitchToDaily={(dayDate) => {
                if (dayDate) setSelectedDate(dayDate);
                setActiveView('harian');
              }}
              categories={categories}
            />
          )}
        </main>
      </div>
    </div>
  );
}
