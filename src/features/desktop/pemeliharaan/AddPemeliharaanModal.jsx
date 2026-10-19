import React, { useState, useEffect, useRef } from 'react';
import { refreshAllData } from '../../../lib/queryClient';
import { Calendar, AlertTriangle } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import RuanganApi from '../../../api/RuanganApi';
import InventarisApi from '../../../api/InventarisApi';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import { useToast } from '../../../components/Alert/useToast';
import { addMonths, parseDate, toInputDate } from '../../../utils/format';
import useTeknisiList from './useTeknisiList';

const MONTHS_PER_YEAR = 12;

/** Interval maintenance = jumlah pemeliharaan per tahun (0/kosong = belum diatur). */
const getInterval = (inventaris) => {
  const interval = parseInt(inventaris?.interval_maintenance, 10);
  return Number.isNaN(interval) || interval < 0 ? 0 : interval;
};

const getNamaAlat = (item) => item?.nama_alat?.nama_nama_alat || '';

const getKategoriLabel = (item) => {
  const baseKategori = item?.nama_alat?.kategori_alat?.nama_kategori || '-';
  const isAlkes = item?.alat_kesehatan;
  const kategoriAlkes = item?.kategori_alkes;

  if ((isAlkes || baseKategori.toLowerCase().includes('kesehatan')) && kategoriAlkes) {
    return `${baseKategori} - ${kategoriAlkes}`;
  }
  return baseKategori;
};

/**
 * Isi form dipisahkan supaya seluruh state ikut dibuang saat modal ditutup
 * (membuka modal lagi selalu mulai dari form kosong).
 */
function AddPemeliharaanForm({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const teknisiOptions = useTeknisiList();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [inventarisOptions, setInventarisOptions] = useState([]);

  const [selectedRuangan, setSelectedRuangan] = useState('');
  const [selectedInventaris, setSelectedInventaris] = useState(null);
  const [selectedInventarisId, setSelectedInventarisId] = useState('');

  const [hasActiveSchedule, setHasActiveSchedule] = useState(false);
  const [activeScheduleMessage, setActiveScheduleMessage] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [bulkTeknisi, setBulkTeknisi] = useState('');

  // Nomor permintaan terakhir: hasil permintaan lama diabaikan bila pilihan sudah berganti.
  const requestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const loadRuangan = async () => {
      try {
        const ruanganRes = await RuanganApi.getAll();
        if (cancelled) return;
        setRuanganOptions(Array.isArray(ruanganRes) ? ruanganRes : (ruanganRes?.data || []));
      } catch (error) {
        if (cancelled) return;
        console.error('Gagal memuat data ruangan', error);
        showToast('Gagal memuat data master', 'error');
      }
    };

    loadRuangan();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const clearSchedules = () => {
    setSchedules([]);
    setBulkTeknisi('');
    setHasActiveSchedule(false);
    setActiveScheduleMessage('');
  };

  const handleRuanganChange = async (e) => {
    const ruanganId = e.target.value;
    const requestId = ++requestRef.current;

    setSelectedRuangan(ruanganId);
    setSelectedInventaris(null);
    setSelectedInventarisId('');
    setInventarisOptions([]);
    clearSchedules();

    if (!ruanganId) return;

    try {
      setLoading(true);
      // Bentuk respons `view: 'simple'`: id, no_inventaris, merk, nama_alat{...}, interval_maintenance, dst.
      const res = await InventarisApi.getAll({ ruangan_id: ruanganId, per_page: 2000, view: 'simple' });
      if (requestId !== requestRef.current) return;
      setInventarisOptions(res.data || []);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      console.error('Gagal memuat inventaris', error);
      showToast('Gagal memuat inventaris', 'error');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const generateSchedules = (inv) => {
    // Interval 0/kosong: hanya satu jadwal manual (pemberitahuan ditampilkan di form).
    const count = Math.max(1, getInterval(inv));

    setSchedules(Array.from({ length: count }, () => ({
      jadwal_pemeliharaan: '',
      teknisi_id: ''
    })));
  };

  const handleInventarisChange = async (e) => {
    const invId = e.target.value;
    const requestId = ++requestRef.current;

    setSelectedInventarisId(invId);
    // Bersihkan dulu sebelum menunggu pengecekan jadwal aktif, supaya sisa jadwal
    // inventaris sebelumnya tidak terlihat atau tersimpan.
    clearSchedules();

    if (!invId) {
      setSelectedInventaris(null);
      return;
    }

    const inv = inventarisOptions.find(i => String(i.id) === String(invId));
    setSelectedInventaris(inv || null);

    setChecking(true);
    try {
      const check = await PemeliharaanApi.checkActiveSchedule(invId);
      if (requestId !== requestRef.current) return;

      if (check.active) {
        setHasActiveSchedule(true);
        setActiveScheduleMessage(check.message);
      } else {
        generateSchedules(inv);
      }
    } catch (error) {
      if (requestId !== requestRef.current) return;
      console.error('Gagal mengecek jadwal aktif', error);
      clearSchedules();
      showToast('Gagal mengecek jadwal aktif', 'error');
    } finally {
      if (requestId === requestRef.current) setChecking(false);
    }
  };

  const handleDateChange = (index, value) => {
    const newSchedules = schedules.map(s => ({ ...s }));
    newSchedules[index].jadwal_pemeliharaan = value;

    // Tanggal pertama mengisi otomatis jadwal berikutnya, tersebar merata dalam setahun.
    const baseDate = parseDate(value);
    if (index === 0 && baseDate && newSchedules.length > 1) {
      const monthStep = MONTHS_PER_YEAR / newSchedules.length;

      for (let i = 1; i < newSchedules.length; i++) {
        const nextDate = addMonths(baseDate, Math.floor(i * monthStep));
        newSchedules[i].jadwal_pemeliharaan = toInputDate(nextDate);
      }
    }
    setSchedules(newSchedules);
  };

  const handleTeknisiChange = (index, value) => {
    setSchedules(prev => prev.map((s, i) => (i === index ? { ...s, teknisi_id: value } : s)));
  };

  const handleBulkTeknisi = (value) => {
    setBulkTeknisi(value);
    setSchedules(prev => prev.map(s => ({ ...s, teknisi_id: value })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || checking) return;

    if (schedules.some(s => !s.jadwal_pemeliharaan)) {
      showToast('Semua tanggal jadwal harus diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        schedules: schedules.map(s => ({
          ruangan_id: selectedRuangan,
          inventaris_id: selectedInventarisId,
          jadwal_pemeliharaan: s.jadwal_pemeliharaan,
          teknisi_id: s.teknisi_id || null
        }))
      };

      await PemeliharaanApi.create(payload);
      await refreshAllData();
      showToast(`${schedules.length} jadwal berhasil dibuat`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Gagal membuat jadwal pemeliharaan', error);
      const errors = error.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join(', ') : '';
      showToast(detail || error.response?.data?.message || 'Gagal membuat jadwal', 'error');
      setSubmitting(false);
    }
  };

  const interval = getInterval(selectedInventaris);
  const teknisiSelectOptions = teknisiOptions.map(t => ({ value: t.id_user, label: t.nama_lengkap }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-gray-500 text-sm mb-4">Masukkan jadwal pemeliharaan alat berdasarkan interval maintenance (kali per tahun)</p>

        {/* Section 1: Selection */}
        <div className="grid grid-cols-2 gap-3 p-3 border rounded-xl border-gray-100 bg-white shadow-sm" style={{ overflow: 'visible' }}>
          <SearchableSelect
            label="Ruangan"
            name="ruangan_id"
            value={selectedRuangan}
            onChange={handleRuanganChange}
            options={ruanganOptions.map(r => ({ value: r.id_ruangan || r.id, label: r.nama_ruangan }))}
            placeholder="-- Pilih Ruangan --"
            searchPlaceholder="Cari ruangan..."
            required
            size="sm"
          />
          <SearchableSelect
            label="Inventaris"
            name="inventaris_id"
            value={selectedInventarisId}
            onChange={handleInventarisChange}
            options={inventarisOptions.map(item => ({
              value: item.id,
              label: `${getNamaAlat(item) || 'Tanpa nama'} - ${item.no_inventaris}`
            }))}
            placeholder={loading ? 'Memuat...' : '-- Pilih Inventaris --'}
            searchPlaceholder="Cari inventaris..."
            disabled={!selectedRuangan || loading}
            required
            size="sm"
          />
        </div>
      </div>

      {/* Warning Block */}
      {hasActiveSchedule && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <strong className="text-yellow-800 block text-lg mb-1">Penambahan Jadwal Gagal!</strong>
          <p className="text-yellow-700 text-sm">{activeScheduleMessage}</p>
        </div>
      )}

      {/* Info Block (Only show if Selected and NOT blocked) */}
      {selectedInventaris && !hasActiveSchedule && !checking && (
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-gray-200">
          <h6 className="font-bold text-text-dark border-b border-gray-200 pb-2 mb-3 text-sm">Informasi Alat</h6>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="block text-[10px] text-gray-500 mb-1">Nama Alat</label>
              <input type="text" className="w-full text-xs font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-2 py-1"
                value={getNamaAlat(selectedInventaris)} readOnly />
            </div>
            <div className="form-group">
              <label className="block text-[10px] text-gray-500 mb-1">Merk</label>
              <input type="text" className="w-full text-xs font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-2 py-1"
                value={selectedInventaris.merk || ''} readOnly />
            </div>
            <div className="form-group">
              <label className="block text-[10px] text-gray-500 mb-1">Kategori Alat</label>
              <input type="text" className="w-full text-xs font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-2 py-1"
                value={getKategoriLabel(selectedInventaris)} readOnly />
            </div>
            <div className="form-group">
              <label className="block text-[10px] text-gray-500 mb-1">Interval Maintenance</label>
              <input type="text" className="w-full text-xs font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-2 py-1"
                value={interval > 0 ? `${interval} kali / tahun` : 'Belum diatur'} readOnly />
            </div>
          </div>

          {interval === 0 && (
            <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs text-yellow-800">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <p>
                Interval maintenance alat ini belum diatur (0 kali / tahun), sehingga hanya satu jadwal manual yang dibuat.
                Atur interval pada menu Edit Inventaris untuk jadwal berkala.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Schedule Block */}
      {schedules.length > 0 && !hasActiveSchedule && !checking && (
        <div className="animate-fade-in">
          <div className="flex items-end justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="w-1/2">
              <SearchableSelect
                label="Terapkan Teknisi ke Semua"
                name="bulk_teknisi"
                value={bulkTeknisi}
                onChange={(e) => handleBulkTeknisi(e.target.value)}
                options={teknisiSelectOptions}
                placeholder="Pilih Teknisi untuk semua..."
                searchPlaceholder="Cari teknisi..."
              />
            </div>
          </div>

          <div className="space-y-2">
            {schedules.map((sch, idx) => (
              <div key={`jadwal-${idx}`} className="flex gap-3 items-center bg-white border border-gray-100 p-2 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    label={`Jadwal Pemeliharaan ${idx + 1}`}
                    value={sch.jadwal_pemeliharaan}
                    onChange={(e) => handleDateChange(idx, e.target.value)}
                    required
                    size="sm"
                  />
                  <SearchableSelect
                    label="Teknisi"
                    name={`teknisi_${idx}`}
                    value={sch.teknisi_id}
                    onChange={(e) => handleTeknisiChange(idx, e.target.value)}
                    options={teknisiSelectOptions}
                    placeholder="-- Pilih Teknisi --"
                    searchPlaceholder="Cari teknisi..."
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedInventarisId && (
        <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
          <Calendar size={48} className="mx-auto mb-2 opacity-20" />
          <p>Jadwal akan muncul di sini setelah inventaris dipilih.</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>Batal</Button>
        {!hasActiveSchedule && schedules.length > 0 && (
          <Button type="submit" loading={submitting} disabled={checking} size="sm">
            Simpan Semua Jadwal
          </Button>
        )}
      </div>
    </form>
  );
}

export default function AddPemeliharaanModal({ isOpen, onClose, onSuccess }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Jadwal Pemeliharaan" size="4xl">
      <AddPemeliharaanForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}
