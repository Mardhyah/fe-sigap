'use client';

import { useState, useEffect } from 'react';
import { calculateDuration, parseStartMinutes } from '../../lib/timeUtils';
import { X } from 'lucide-react';

const initialFormState = {
  title: '',
  idKatKegiatan: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  pic: '',
  participants: '',
  description: '',
};

// Format input jam
const formatTimeInput = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}.${digits.slice(2)}`;
};

// Normalisasi jam
const normalizeTimeOnBlur = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 1) {
    return `0${digits}.00`;
  } else if (digits.length === 2) {
    const h = Math.min(parseInt(digits, 10), 23);
    return `${String(h).padStart(2, '0')}.00`;
  } else if (digits.length === 3) {
    const h = Math.min(parseInt(digits.slice(0, 1), 10), 23);
    const m = Math.min(parseInt(digits.slice(1), 10), 59);
    return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  } else {
    const h = Math.min(parseInt(digits.slice(0, 2), 10), 23);
    const m = Math.min(parseInt(digits.slice(2, 4), 10), 59);
    return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  }
};

export default function ModalTambahAgenda({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCategories = [],
  agendaToEdit = null
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (isOpen) {
      if (agendaToEdit) {
        // Mode Edit
        const cleanVal = (val) => (!val || val === '-' ? '' : val);
        const [timeStart, timeEnd] = agendaToEdit.time ? agendaToEdit.time.split('-') : [];

        setFormData({
          title: agendaToEdit.title,
          idKatKegiatan: agendaToEdit.idKatKegiatan,
          date: agendaToEdit.dateKey || agendaToEdit.tanggalKegiatan,
          startTime: agendaToEdit.waktuMulai ? String(agendaToEdit.waktuMulai).replace(':', '.') : timeStart?.trim(),
          endTime: agendaToEdit.waktuSelesai ? String(agendaToEdit.waktuSelesai).replace(':', '.') : timeEnd?.trim(),
          location: cleanVal(agendaToEdit.location),
          pic: cleanVal(agendaToEdit.pic),
          participants: cleanVal(agendaToEdit.participants),
          description: cleanVal(agendaToEdit.description),
        });
      } else {
        // Mode Tambah
        setFormData({
          ...initialFormState,
          date: '',
          startTime: '',
          endTime: '',
          idKatKegiatan: categories[0]?.id_kat_kegiatan,
        });
      }
      setErrors({});

      // Ambil kategori
      fetch('/api/categories')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setCategories(json.data);
            if (!agendaToEdit) {
              setFormData((prev) => ({ 
                ...prev, 
                idKatKegiatan: prev.idKatKegiatan || json.data[0].id_kat_kegiatan 
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, agendaToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'startTime' || name === 'endTime') {
      const formatted = formatTimeInput(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name] || errors.endTime) {
      setErrors((prev) => ({ ...prev, [name]: '', endTime: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'startTime' || name === 'endTime') {
      const normalized = normalizeTimeOnBlur(value);
      setFormData((prev) => ({ ...prev, [name]: normalized }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const start = normalizeTimeOnBlur(formData.startTime);
    const end = normalizeTimeOnBlur(formData.endTime);

    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Judul agenda wajib diisi';
    }
    if (!formData.date) {
      newErrors.date = 'Tanggal kegiatan wajib diisi';
    }
    if (!start) {
      newErrors.startTime = 'Jam mulai wajib diisi';
    }
    if (!end) {
      newErrors.endTime = 'Jam selesai wajib diisi';
    } else if (parseStartMinutes(end) <= parseStartMinutes(start)) {
      newErrors.endTime = 'Jam selesai harus lebih akhir dari jam mulai';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const timeString = `${start} - ${end}`;
    const calculatedDuration = calculateDuration(start, end);

    const catObj = categories.find((c) => c.id_kat_kegiatan === Number(formData.idKatKegiatan));
    const categoryName = catObj?.jenis_kegiatan;
    const selectedKatId = Number(formData.idKatKegiatan);

    const agendaPayload = {
      ...(agendaToEdit?.id ? { id: agendaToEdit.id, id_history: agendaToEdit.id } : {}),
      title: formData.title.trim(),
      idKatKegiatan: selectedKatId,
      category: categoryName,
      categoryType: categoryName?.toLowerCase().trim(),
      startTime: start,
      endTime: end,
      time: timeString,
      duration: calculatedDuration,
      location: formData.location.trim(),
      pic: formData.pic.trim(),
      participants: formData.participants.trim(),
      description: formData.description.trim(),
      date: formData.date,
      tanggal_kegiatan: formData.date,
    };

    onSave(agendaPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[4px] z-[999] flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="w-full max-w-[540px] bg-white rounded-[14px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.08)] border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-[1.25rem_1.5rem_1rem] border-b border-slate-100">
          <div>
            <h2 className="text-[1.15rem] font-extrabold text-[#0a1d37] tracking-[-0.3px]">
              {agendaToEdit ? 'Edit Agenda' : 'Tambah Agenda Baru'}
            </h2>
            <p className="text-[0.8rem] text-slate-500 mt-0.5">
              {agendaToEdit ? 'Perbarui jadwal dan rincian agenda pimpinan' : 'Masukkan jadwal dan rincian agenda pimpinan BAZNAS (BAZIS) DKI Jakarta'}
            </p>
          </div>
          <button
            type="button"
            className="bg-transparent border-0 text-slate-400 cursor-pointer p-1 rounded-md flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-[1.25rem_1.5rem] flex flex-col gap-4">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[0.82rem] font-bold text-slate-700">
              Judul Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 ${errors.title ? '!border-red-500' : ''}`}
            />
            {errors.title && <span className="text-[0.74rem] text-red-500 mt-0.5">{errors.title}</span>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-[5px]">
              <label className="text-[0.82rem] font-bold text-slate-700">
                Tanggal Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 ${errors.date ? '!border-red-500' : ''}`}
              />
              {errors.date && <span className="text-[0.74rem] text-red-500 mt-0.5">{errors.date}</span>}
            </div>

            <div className="flex-1 flex flex-col gap-[5px]">
              <label className="text-[0.82rem] font-bold text-slate-700">Kategori Agenda</label>
              <select
                name="idKatKegiatan"
                value={formData.idKatKegiatan}
                onChange={handleChange}
                className="w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
              >
                {categories.length > 0 ? (
                  categories.map((opt) => (
                    <option key={opt.id_kat_kegiatan} value={opt.id_kat_kegiatan}>
                      {opt.jenis_kegiatan}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Memuat kategori...</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="text-[0.82rem] font-bold text-slate-700">
              Waktu (Mulai - Selesai) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={5}
                className={`flex-1 min-w-0 p-[8px_12px] text-[0.95rem] font-bold text-slate-900 text-center border border-slate-300 rounded-lg bg-white cursor-text transition-all tracking-[0.5px] tabular-nums focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none ${errors.startTime ? '!border-red-500' : ''}`}
                aria-label="Ketik jam mulai"
              />
              <span className="text-slate-500 font-bold text-base select-none">-</span>
              <input
                type="text"
                inputMode="numeric"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={5}
                className={`flex-1 min-w-0 p-[8px_12px] text-[0.95rem] font-bold text-slate-900 text-center border border-slate-300 rounded-lg bg-white cursor-text transition-all tracking-[0.5px] tabular-nums focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none ${errors.endTime ? '!border-red-500' : ''}`}
                aria-label="Ketik jam selesai"
              />
            </div>

            {errors.startTime && <span className="text-[0.74rem] text-red-500 mt-0.5">{errors.startTime}</span>}
            {errors.endTime && <span className="text-[0.74rem] text-red-500 mt-0.5">{errors.endTime}</span>}
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="text-[0.82rem] font-bold text-slate-700">Lokasi Kegiatan</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-[5px]">
              <label className="text-[0.82rem] font-bold text-slate-700">PIC / Penanggung Jawab</label>
              <input
                type="text"
                name="pic"
                value={formData.pic}
                onChange={handleChange}
                className="w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
              />
            </div>

            <div className="flex-1 flex flex-col gap-[5px]">
              <label className="text-[0.82rem] font-bold text-slate-700">Peserta</label>
              <input
                type="text"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                className="w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="text-[0.82rem] font-bold text-slate-700">Keterangan / Catatan</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-[8px_12px] text-[0.86rem] border border-slate-300 rounded-lg bg-white text-slate-900 outline-none transition-all focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 resize-y min-h-[70px]"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              className="p-[8px_16px] text-[0.84rem] font-semibold text-slate-500 bg-white border border-slate-300 rounded-lg cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-800"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="p-[8px_18px] text-[0.84rem] font-bold text-white bg-brand-green border-0 rounded-lg cursor-pointer shadow-[0_1px_3px_rgba(10,92,54,0.25)] transition-all hover:bg-brand-hover"
            >
              {agendaToEdit ? 'Simpan Perubahan' : 'Simpan Agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
