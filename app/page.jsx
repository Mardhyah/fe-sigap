'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
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
  // State
  const [activeView, setActiveView] = useState('harian');
  const [agendaList, setAgendaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [agendaToDelete, setAgendaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notifikasi
  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  // Ambil data dari API
  const loadData = async () => {
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

      if (jsonAgendas.success && Array.isArray(jsonAgendas.data) && jsonAgendas.data.length > 0) {
        setAgendaList(sortAgendasByTime(jsonAgendas.data));
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

  // Jam real-time
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = formatIndonesianDate(selectedDate);
  const liveClockString = currentTime ? formatDigitalClock(currentTime) : '';

  // Filter agenda & search
  const dailyAgendas = useMemo(() => {
    const targetKey = getDateKey(selectedDate);
    const dayList = agendaList.filter((a) => a.dateKey === targetKey);
    if (!searchQuery.trim()) return dayList;
    const q = searchQuery.toLowerCase().trim();
    return dayList.filter((a) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.pic && a.pic.toLowerCase().includes(q)) ||
      (a.participants && a.participants.toLowerCase().includes(q))
    );
  }, [agendaList, selectedDate, searchQuery]);

  // Tampilkan agenda jam saat ini atau yang dipilih manual
  useEffect(() => {
    if (!currentTime || dailyAgendas.length === 0) {
      setSelectedAgenda(null);
      return;
    }

    const isToday = getDateKey(selectedDate) === getDateKey(currentTime);

    setSelectedAgenda((prev) => {
      // buka agenda yang sedang diklik 
      if (prev && dailyAgendas.some((a) => a.id === prev.id)) {
        return prev;
      }
      // agenda yang lagi jalan sekarang
      if (isToday) {
        return dailyAgendas.find((a) => getAgendaStatus(a.time, currentTime, a.dateKey) === 'ongoing') || null;
      }
      return null;
    });
  }, [dailyAgendas, selectedDate, currentTime]);

  // Agenda berikutnya
  const upcomingAgendasLive = currentTime
    ? dailyAgendas.filter((a) => getAgendaStatus(a.time, currentTime, a.dateKey) === 'upcoming' && a.id !== selectedAgenda?.id).slice(0, 5)
    : [];

  // Navigasi tanggal
  const handlePrevDay = () => setSelectedDate((prev) => new Date(prev.getTime() - 86400000));
  const handleNextDay = () => setSelectedDate((prev) => new Date(prev.getTime() + 86400000));
  const handleToday = () => setSelectedDate(new Date());

  // Simpan / edit agenda
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
          const [y, m, d] = String(agendaData.date).split('-').map(Number);
          if (y && m && d) setSelectedDate(new Date(y, m - 1, d));
        }
        await loadData();
        setEditingAgenda(null);
        return;
      }
      showToast('error', json.message || 'Gagal menyimpan agenda');
    } catch {
      showToast('error', 'Gagal menyimpan: periksa koneksi server');
    }
  };

  // Hapus agenda
  const handleDeleteAgenda = (agenda) => {
    setAgendaToDelete(agenda);
  };

  const confirmDelete = async () => {
    if (!agendaToDelete?.id) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/agendas?id=${agendaToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showToast('success', json.message || 'Agenda berhasil dihapus');
        if (selectedAgenda?.id === agendaToDelete.id) setSelectedAgenda(null);
        await loadData();
        setAgendaToDelete(null);
        return;
      }
      showToast('error', json.message || 'Gagal menghapus agenda');
    } catch {
      showToast('error', 'Gagal menghapus: periksa koneksi server');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col bg-[#f0f5fa] overflow-x-hidden lg:overflow-hidden">
      <Navbar
        agendas={agendaList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onSelectAgenda={(agenda) => {
          if (agenda.dateKey) {
            const [y, m, d] = agenda.dateKey.split('-').map(Number);
            if (y && m && d) setSelectedDate(new Date(y, m - 1, d));
          }
          setSelectedAgenda(agenda);
          setActiveView('harian');
        }}
      />

      <div className="flex flex-col lg:flex-row flex-1 w-full lg:h-[calc(100vh-68px)] lg:max-h-[calc(100vh-68px)] bg-[#f0f5fa] p-3 sm:p-4 lg:p-[1.2rem_1.4rem] gap-3 sm:gap-4 lg:gap-[1.4rem] overflow-y-auto lg:overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Konten utama */}
        <main className="flex-1 bg-white rounded-xl sm:rounded-2xl border border-[#e8ecf2] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-4 sm:p-6 lg:p-[1.8rem_2.2rem_1rem] min-w-0 flex flex-col min-h-[480px] lg:h-full lg:max-h-full overflow-hidden">
          <AgendaHeader
            currentDate={formattedDate}
            liveClock={liveClockString}
            activeView={activeView}
            onViewChange={setActiveView}
            onOpenAdd={() => {
              setEditingAgenda(null);
              setIsModalOpen(true);
            }}
            showAddButton={true}
            isMonitorMode={false}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
          />

          {/* Tampilan harian */}
          {activeView === 'harian' && (
            <DailyTimeline
              agendas={dailyAgendas}
              selectedAgendaId={selectedAgenda?.id}
              onSelectAgenda={setSelectedAgenda}
              onEditAgenda={(agenda) => {
                setEditingAgenda(agenda);
                setIsModalOpen(true);
              }}
              onDeleteAgenda={handleDeleteAgenda}
              currentTime={currentTime}
            />
          )}

          {/* Tampilan bulanan */}
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

        {/* Panel kanan */}
        {activeView !== 'bulanan' && (
          <aside className="w-full lg:w-[350px] xl:w-[370px] shrink-0 flex flex-col gap-4 h-auto lg:h-full lg:max-h-full overflow-y-visible lg:overflow-y-auto overflow-x-hidden lg:pr-1">
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

      {/* Modal form */}
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

      {/* Modal Konfirmasi Hapus */}
      {agendaToDelete && (
        <div
          className="fixed inset-0 z-[1300] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeleting && setAgendaToDelete(null)}
        >
          <div
            className="w-full max-w-[350px] bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-3.5 shadow-sm">
              <Trash2 size={26} strokeWidth={2.2} />
            </div>

            <h3 className="text-[1.12rem] font-bold text-slate-800 mb-1.5">
              Hapus Agenda?
            </h3>

            <p className="text-[0.86rem] text-slate-500 font-medium leading-relaxed mb-6">
              Yakin ingin menghapus agenda <span className="font-bold text-slate-700">"{agendaToDelete.title}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAgendaToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-[0.86rem] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border-0 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-[0.86rem] bg-red-600 hover:bg-red-700 text-white transition-colors border-0 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses / Gagal */}
      {toast && (
        <div
          className="fixed inset-0 z-[1300] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setToast(null)}
        >
          <div
            className="w-full max-w-[350px] bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-4 shadow-sm ${toast.type === 'error'
              ? 'bg-red-50 border border-red-100'
              : 'bg-emerald-50/80 border border-emerald-100 p-2'
              }`}>
              {toast.type === 'error' ? (
                <AlertCircle size={44} strokeWidth={2.3} className="text-red-600" />
              ) : (
                <img
                  src="/assets/logo-baznasdki.png"
                  alt="Logo BAZNAS (BAZIS) DKI Jakarta"
                  className="w-16 h-16 object-contain"
                />
              )}
            </div>

            <h3 className="text-[1.05rem] font-semibold text-slate-800 mb-5 leading-snug">
              {toast.message || (toast.type === 'error' ? 'Gagal Menyimpan' : 'Data Berhasil Disimpan!')}
            </h3>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full ${toast.type === 'error' ? 'bg-red-500' : 'bg-brand-green'
                  } animate-flow-progress`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
