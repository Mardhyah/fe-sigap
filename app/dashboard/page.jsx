'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AgendaHeader from '../components/AgendaHeader';
import DailyTimeline from '../components/DailyTimeline';
import MonthlyView from '../components/MonthlyView';
import MiniCalendar from '../components/MiniCalendar';
import AgendaDetail from '../components/AgendaDetail';
import UpcomingAgenda from '../components/UpcomingAgenda';
import { formatIndonesianDate, formatDigitalClock, sortAgendasByTime, getDateKey, getAgendaStatus } from '../../lib/timeUtils';
import { Maximize } from 'lucide-react';

export default function DashboardMonitorPage() {
  const [activeView, setActiveView] = useState('harian');
  const [currentTime, setCurrentTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendaList, setAgendaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAgenda, setSelectedAgenda] = useState(null);

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

  // Otomatis pilih agenda yang sedang berlangsung atau simpan pilihan manual
  useEffect(() => {
    if (!currentTime || dailyAgendas.length === 0) {
      setSelectedAgenda(null);
      return;
    }
    const isToday = getDateKey(selectedDate) === getDateKey(currentTime);
    setSelectedAgenda((prev) => {
      if (prev && dailyAgendas.some((a) => a.id === prev.id)) {
        return prev;
      }
      if (isToday) {
        return dailyAgendas.find((a) => getAgendaStatus(a.time, currentTime, a.dateKey) === 'ongoing') || null;
      }
      return null;
    });
  }, [dailyAgendas, selectedDate, currentTime]);

  // Agenda setelahnya (upcoming)
  const upcomingAgendasLive = useMemo(() => {
    if (!currentTime) return [];
    return dailyAgendas
      .filter((a) => getAgendaStatus(a.time, currentTime, a.dateKey) === 'upcoming' && a.id !== selectedAgenda?.id)
      .slice(0, 5);
  }, [dailyAgendas, currentTime, selectedAgenda]);

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
    <div className="w-full min-h-screen lg:h-screen lg:max-h-screen bg-[#f0f5fa] overflow-x-hidden lg:overflow-hidden flex flex-col">
      <header className="w-full h-[76px] sm:h-[84px] bg-white border-b border-[#e4eaf2] flex items-center justify-between px-3.5 sm:px-6 lg:px-8 shrink-0">
        <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
          <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] flex items-center justify-center shrink-0">
            <img
              src="/assets/logo-baznasdki.png"
              alt="Logo BAZNAS (BAZIS) DKI Jakarta"
              className="w-full h-full object-contain block"
            />
          </div>
          <img
            src="/assets/logo-sigap.png"
            alt="Logo SIGAP"
            className="h-[38px] sm:h-[48px] w-auto object-contain block"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-1.5 bg-brand-green text-white border-0 rounded-lg py-2 px-3.5 sm:px-4 text-[0.8rem] sm:text-[0.85rem] font-bold cursor-pointer transition-all shadow-[0_1px_3px_rgba(10,92,54,0.2)] hover:bg-brand-hover hover:-translate-y-0.5 active:translate-y-0"
            title="Layar Penuh (F11)"
          >
            <Maximize size={15} strokeWidth={2.2} />
            <span className="hidden sm:inline">Layar Penuh</span>
          </button>
        </div>
      </header>

      <div className="w-full h-[38px] sm:h-[42px] bg-[#eaf1eb] border-b border-[#c6d8c9] flex items-center px-3.5 sm:px-6 lg:px-8 shrink-0 overflow-hidden shadow-[0_1px_3px_rgba(22,56,33,0.05)]">
        <div className="bg-[#1b4d2e] text-white px-2.5 py-0.5 rounded-md text-[0.72rem] sm:text-[0.76rem] font-extrabold shrink-0 mr-3.5 shadow-sm tracking-wider">
          INFO
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee text-[0.8rem] sm:text-[0.85rem] text-[#163821] font-bold tracking-wide">
            <span className="mr-8">Selamat Datang di BAZNAS (BAZIS) Provinsi DKI Jakarta</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Sistem Informasi Agenda Pimpinan (SIGAP)</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Semoga seluruh aktivitas hari ini berjalan lancar dan penuh keberkahan</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Dari Asma' binti Abi Bakr, Rasulullah shallallahu 'alaihi wa sallam bersabda padaku : &quot;Janganlah engkau menyimpan harta (tanpa mensedekahkannya). Jika tidak, maka Allah akan menahan rizki untukmu.&quot;</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Selamat Datang di BAZNAS (BAZIS) Provinsi DKI Jakarta</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Sistem Informasi Agenda Pimpinan (SIGAP)</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Semoga seluruh aktivitas hari ini berjalan lancar dan penuh keberkahan</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
            <span className="mr-8">Dari Asma' binti Abi Bakr, Rasulullah shallallahu 'alaihi wa sallam bersabda padaku : &quot;Janganlah engkau menyimpan harta (tanpa mensedekahkannya). Jika tidak, maka Allah akan menahan rizki untukmu.&quot;</span>
            <span className="text-[#6b9075] font-bold mr-8">|</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 w-full lg:h-[calc(100vh-124px)] lg:max-h-[calc(100vh-124px)] bg-[#f0f5fa] p-3 sm:p-4 lg:p-[1.2rem_1.4rem] gap-3 sm:gap-4 lg:gap-[1.4rem] overflow-y-auto lg:overflow-hidden">
        <main className="flex-1 bg-white rounded-xl sm:rounded-2xl border border-[#e8ecf2] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-4 sm:p-6 lg:p-[1.8rem_2.2rem_1rem] min-w-0 flex flex-col min-h-[480px] lg:h-full lg:max-h-full overflow-hidden">
          <AgendaHeader
            currentDate={formattedDate}
            liveClock={liveClockString}
            activeView={activeView}
            onViewChange={setActiveView}
            showAddButton={false}
            isMonitorMode={false}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
          />

          {activeView === 'harian' && (
            <DailyTimeline
              agendas={dailyAgendas}
              selectedAgendaId={selectedAgenda?.id}
              onSelectAgenda={setSelectedAgenda}
              currentTime={currentTime}
            />
          )}

          {activeView === 'bulanan' && (
            <MonthlyView
              agendas={agendaList}
              selectedAgendaId={selectedAgenda?.id}
              onSelectAgenda={setSelectedAgenda}
              onSwitchToDaily={(dayDate) => {
                if (dayDate) setSelectedDate(dayDate);
                setActiveView('harian');
              }}
              categories={categories}
            />
          )}
        </main>

        {activeView !== 'bulanan' && (
          <aside className="w-full lg:w-[320px] xl:w-[340px] 2xl:w-[360px] shrink-0 flex flex-col gap-3.5 h-auto lg:h-full lg:max-h-full overflow-y-visible lg:overflow-y-auto overflow-x-hidden lg:pr-1">
            <MiniCalendar
              agendas={agendaList}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <AgendaDetail
              agenda={selectedAgenda}
            />

            <UpcomingAgenda
              agendas={upcomingAgendasLive}
              onSelectAgenda={setSelectedAgenda}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
