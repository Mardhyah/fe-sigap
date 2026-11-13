'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AgendaHeader from './components/AgendaHeader';
import DailyTimeline from './components/DailyTimeline';
import MonthlyView from './components/MonthlyView';
import MiniCalendar from './components/MiniCalendar';
import AgendaDetail from './components/AgendaDetail';
import UpcomingAgenda from './components/UpcomingAgenda';
import ModalTambahAgenda from './components/ModalTambahAgenda';
import { formatIndonesianDate, formatDigitalClock, sortAgendasByTime, getAgendaStatus, getDateKey } from '../lib/timeUtils';

export default function DashboardAgenda() {
  const [activeMenu, setActiveMenu] = useState('agenda-lembaga');
  const [activeView, setActiveView] = useState('harian');
  const [agendaList, setAgendaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };
  
  // Waktu berjalan
  const [currentTime, setCurrentTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Ambil agenda dan kategori 
  const loadData = async () => {
    try {
      const [resAgendas, resCategories] = await Promise.all([
        fetch('/api/agendas'),
        fetch('/api/categories'),
      ]);

      const jsonAgendas = await resAgendas.json();
      const jsonCategories = await resCategories.json();

      if (jsonCategories.success && Array.isArray(jsonCategories.data)) {
        setCategories(jsonCategories.data);
      }

      if (jsonAgendas.success && Array.isArray(jsonAgendas.data) && jsonAgendas.data.length > 0) {
        const sorted = sortAgendasByTime(jsonAgendas.data);
        setAgendaList(sorted);
        setSelectedAgenda((prev) => (prev ? sorted.find((a) => a.id === prev.id) || sorted[0] : sorted[0]));
      } else {
        setAgendaList([]);
        setSelectedAgenda(null);
      }
    } catch {
      setAgendaList([]);
      setSelectedAgenda(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = formatIndonesianDate(selectedDate);
  const liveClockString = currentTime ? formatDigitalClock(currentTime) : '';

  // Filter agenda untuk timeline harian murni sesuai tanggal yang dipilih
  const dailyAgendas = useMemo(() => {
    const targetKey = getDateKey(selectedDate);
    return agendaList.filter((a) => a.dateKey === targetKey);
  }, [agendaList, selectedDate]);

  // Sinkronkan selected agenda dengan agenda hari yang dipilih
  useEffect(() => {
    if (dailyAgendas.length > 0) {
      setSelectedAgenda((prev) => {
        if (!prev) return dailyAgendas[0];
        return dailyAgendas.find((a) => a.id === prev.id) || dailyAgendas[0];
      });
    } else {
      setSelectedAgenda(null);
    }
  }, [dailyAgendas]);

  // Agenda yang akan datang (dari hari yang sedang dilihat)
  const upcomingAgendasLive = currentTime
    ? dailyAgendas.filter(
        (a) => !a.isBreak && getAgendaStatus(a.time, currentTime) === 'upcoming' && a.id !== selectedAgenda?.id
      ).slice(0, 5)
    : [];

  const handlePrevDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  const isMonitor = activeMenu === 'dashboard';

  const handleToggleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  };

  const handleSaveAgenda = async (agendaData) => {
    try {
      const isEdit = Boolean(agendaData.id);
      const res = await fetch('/api/agendas', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendaData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', json.message || (isEdit ? 'Agenda berhasil diperbarui' : 'Agenda berhasil disimpan'));
        if (agendaData.date) {
          const parts = String(agendaData.date).split('-');
          if (parts.length === 3) {
            setSelectedDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
          }
        }
        await loadData();
        setEditingAgenda(null);
        return;
      }

      showToast('error', json.message || 'Gagal menyimpan agenda');
    } catch (err) {
      console.error('Gagal menyimpan agenda:', err);
      showToast('error', 'Gagal menyimpan: tidak dapat terhubung ke server API');
    }
  };

  return (
    <div className={`w-screen h-screen max-h-screen flex flex-col bg-[#f0f5fa] overflow-hidden ${isMonitor ? '!w-screen !h-screen !max-h-screen !bg-[#f0f5fa] !overflow-hidden' : ''}`}>
      {/* Navbar */}
      {!isMonitor && <Navbar />}

      {/* Layout */}
      <div className={`flex flex-1 w-full h-[calc(100vh-68px)] max-h-[calc(100vh-68px)] bg-[#f0f5fa] p-[1.2rem_1.4rem] gap-[1.4rem] overflow-hidden ${isMonitor ? '!w-full !h-screen !max-h-screen !p-[1.4rem_2rem] !gap-0 !overflow-hidden' : ''}`}>
        {/* Sidebar */}
        {!isMonitor && (
          <Sidebar activeMenu={activeMenu} onSelectMenu={setActiveMenu} />
        )}

        {/* Konten Utama */}
        <main className={`flex-1 bg-white rounded-2xl border border-[#e8ecf2] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-[1.8rem_2.2rem_1rem] min-w-0 flex flex-col h-full max-h-full overflow-hidden ${isMonitor ? '!w-full !max-w-full !h-full !max-h-full !p-[2rem_2.5rem_1rem] !rounded-[20px] !shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] !flex !flex-col !overflow-hidden' : ''}`}>
          <AgendaHeader 
            currentDate={formattedDate}
            liveClock={liveClockString}
            activeView={activeView}
            onViewChange={setActiveView}
            onOpenAdd={() => {
              setEditingAgenda(null);
              setIsModalOpen(true);
            }}
            showAddButton={!isMonitor}
            isMonitorMode={isMonitor}
            onExitMonitor={() => setActiveMenu('agenda-lembaga')}
            onToggleFullscreen={handleToggleFullscreen}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
          />

          {activeView === 'harian' && (
            <DailyTimeline 
              agendas={dailyAgendas}
              selectedAgendaId={isMonitor ? null : selectedAgenda?.id}
              onSelectAgenda={isMonitor ? undefined : setSelectedAgenda}
              currentTime={currentTime}
            />
          )}

          {activeView === 'bulanan' && (
            <MonthlyView 
              agendas={agendaList}
              selectedAgendaId={isMonitor ? null : selectedAgenda?.id}
              onSelectAgenda={setSelectedAgenda}
              onSwitchToDaily={(dayDate) => {
                if (dayDate) setSelectedDate(dayDate);
                setActiveView('harian');
              }}
              categories={categories}
            />
          )}
        </main>

        {/* Panel Kanan */}
        {!isMonitor && activeView !== 'bulanan' && (
          <aside className="w-[370px] shrink-0 flex flex-col h-full max-h-full overflow-y-auto overflow-x-hidden pr-1">
            <MiniCalendar
              agendas={agendaList}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            
            <AgendaDetail 
              agenda={selectedAgenda} 
              onEdit={(agenda) => {
                setEditingAgenda(agenda);
                setIsModalOpen(true);
              }}
            />
            
            <UpcomingAgenda 
              agendas={upcomingAgendasLive}
              onSelectAgenda={setSelectedAgenda}
            />
          </aside>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      <ModalTambahAgenda 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAgenda(null);
        }}
        onSave={handleSaveAgenda}
        initialCategories={categories}
        defaultDate={selectedDate}
        agendaToEdit={editingAgenda}
      />

      {/* Toast Notifikasi */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-5 right-5 z-[1100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-[0.84rem] font-semibold max-w-[380px] transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} className="shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-0.5 rounded hover:bg-black/5 text-current opacity-70 hover:opacity-100 cursor-pointer border-0 bg-transparent"
            aria-label="Tutup notifikasi"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
