import React, { useState, useEffect } from 'react';
import { X, Calendar, User, CheckSquare } from 'lucide-react';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import RuanganApi from '../../../api/RuanganApi';
import InventarisApi from '../../../api/InventarisApi';
import MasterApi from '../../../api/MasterApi';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import { useToast } from '../../../components/Alert/useToast';

export default function AddPemeliharaanModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Master Data
  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [inventarisOptions, setInventarisOptions] = useState([]);
  const [teknisiOptions, setTeknisiOptions] = useState([]);

  // Selection
  const [selectedRuangan, setSelectedRuangan] = useState('');
  const [selectedInventaris, setSelectedInventaris] = useState(null);
  const [selectedInventarisId, setSelectedInventarisId] = useState('');

  // State
  const [hasActiveSchedule, setHasActiveSchedule] = useState(false);
  const [activeScheduleMessage, setActiveScheduleMessage] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [bulkTeknisi, setBulkTeknisi] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedRuangan('');
    setSelectedInventaris(null);
    setSelectedInventarisId('');
    setSchedules([]);
    setBulkTeknisi('');
    setInventarisOptions([]);
    setHasActiveSchedule(false);
    setActiveScheduleMessage('');
  };

  const loadInitialData = async () => {
    try {
      const [ruanganRes, teknisiRes] = await Promise.all([
        RuanganApi.getAll(),
        MasterApi.getTeknisi()
      ]);
      setRuanganOptions(ruanganRes.data || ruanganRes);
      // Ensure teknisiRes is array
      const teknisiData = Array.isArray(teknisiRes) ? teknisiRes : (teknisiRes.data || []);
      setTeknisiOptions(teknisiData);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data master', 'error');
    }
  };

  const handleRuanganChange = async (e) => {
    const ruanganId = e.target.value;
    setSelectedRuangan(ruanganId);
    setSelectedInventaris(null);
    setSelectedInventarisId('');
    setSchedules([]);
    setHasActiveSchedule(false);

    if (ruanganId) {
      try {
        setLoading(true);
        const res = await InventarisApi.getAll({ ruangan_id: ruanganId, per_page: 999 });
        setInventarisOptions(res.data || []);
      } catch (error) {
        showToast('Gagal memuat inventaris', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      setInventarisOptions([]);
    }
  };

  const handleInventarisChange = async (e) => {
    const invId = e.target.value;
    setSelectedInventarisId(invId);

    if (!invId) {
      setSelectedInventaris(null);
      setSchedules([]);
      setHasActiveSchedule(false);
      return;
    }

    const inv = inventarisOptions.find(i => String(i.id_inventaris || i.id) === String(invId));
    setSelectedInventaris(inv);

    // Check Active Schedule
    setChecking(true);
    try {
      const check = await PemeliharaanApi.checkActiveSchedule(invId);
      if (check.active) {
        setHasActiveSchedule(true);
        setActiveScheduleMessage(check.message);
        setSchedules([]); // Clear schedules if blocked
      } else {
        setHasActiveSchedule(false);
        setActiveScheduleMessage('');
        generateSchedules(inv);
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal mengecek jadwal aktif', 'error');
    } finally {
      setChecking(false);
    }
  };

  const generateSchedules = (inv) => {
    const interval = inv?.interval_maintenance || 0;
    const count = interval > 0 ? interval : 1;

    const newSchedules = Array.from({ length: count }, () => ({
      jadwal_pemeliharaan: '',
      teknisi_id: ''
    }));
    setSchedules(newSchedules);
  };

  const handleDateChange = (index, value) => {
    const newSchedules = [...schedules];
    newSchedules[index].jadwal_pemeliharaan = value;

    // Auto-calculate subsequent dates
    if (index === 0 && value && schedules.length > 1) {
      const baseDate = new Date(value);
      const interval = schedules.length;
      const monthStep = 12 / interval;

      for (let i = 1; i < schedules.length; i++) {
        const nextDate = new Date(baseDate);
        // Calculate offset in months: i * (12/N)
        // e.g., N=4 -> step=3. i=1->3mo, i=2->6mo...
        const offsetMonths = Math.floor(i * monthStep);
        nextDate.setMonth(nextDate.getMonth() + offsetMonths);

        const y = nextDate.getFullYear();
        const m = String(nextDate.getMonth() + 1).padStart(2, '0');
        const d = String(nextDate.getDate()).padStart(2, '0');
        newSchedules[i].jadwal_pemeliharaan = `${y}-${m}-${d}`;
      }
    }
    setSchedules(newSchedules);
  };

  const handleTeknisiChange = (index, value) => {
    const newSchedules = [...schedules];
    newSchedules[index].teknisi_id = value;
    setSchedules(newSchedules);
  };

  const handleBulkTeknisi = (value) => {
    setBulkTeknisi(value);
    const newSchedules = schedules.map(s => ({ ...s, teknisi_id: value }));
    setSchedules(newSchedules);
  };

  const handleSubmit = async () => {
    const invalid = schedules.some(s => !s.jadwal_pemeliharaan);
    if (invalid) {
      showToast('Semua tanggal jadwal harus diisi', 'error');
      return;
    }

    setLoading(true);
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
      showToast(`${schedules.length} jadwal berhasil dibuat`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Gagal membuat jadwal', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-text-dark">Tambah Jadwal Pemeliharaan</h3>
            <p className="text-gray-500 text-sm">Masukan jadwal maintenance alat berdasarkan interval</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 custom-scrollbar" style={{ overflow: 'visible' }}>
          {/* Section 1: Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 border rounded-xl border-gray-100 bg-white shadow-sm" style={{ overflow: 'visible' }}>
            <SearchableSelect
              label="Ruangan"
              name="ruangan_id"
              value={selectedRuangan}
              onChange={handleRuanganChange}
              options={ruanganOptions.map(r => ({ value: r.id_ruangan || r.id, label: r.nama_ruangan }))}
              placeholder="-- Pilih Ruangan --"
              searchPlaceholder="Cari ruangan..."
            />
            <SearchableSelect
              label="Inventaris"
              name="inventaris_id"
              value={selectedInventarisId}
              onChange={handleInventarisChange}
              options={inventarisOptions.map(item => ({
                value: item.id_inventaris || item.id,
                label: `${item.namaAlat?.nama_nama_alat || item.nama_alat?.nama_nama_alat || 'Unknown'} - ${item.no_inventaris}`
              }))}
              placeholder={loading ? 'Memuat...' : '-- Pilih Inventaris --'}
              searchPlaceholder="Cari inventaris..."
              disabled={!selectedRuangan || loading}
            />
          </div>

          {/* Warning Block */}
          {hasActiveSchedule && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <strong className="text-yellow-800 block text-lg mb-1">Penambahan Jadwal Gagal!</strong>
              <p className="text-yellow-700 text-sm">{activeScheduleMessage}</p>
            </div>
          )}

          {/* Info Block (Only show if Selected and NOT blocked) */}
          {selectedInventaris && !hasActiveSchedule && !checking && (
            <div className="bg-[#F8F9FA] p-5 rounded-xl border border-gray-200 mb-6">
              <h6 className="font-bold text-text-dark border-b border-gray-200 pb-2 mb-4">Informasi Alat</h6>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="block text-xs text-gray-500 mb-1">Nama Alat</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-3 py-1.5"
                    value={selectedInventaris.namaAlat?.nama_nama_alat || selectedInventaris.nama_alat?.nama_nama_alat || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="block text-xs text-gray-500 mb-1">Merk</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-3 py-1.5"
                    value={selectedInventaris.merk || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="block text-xs text-gray-500 mb-1">Kategori Alat</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-3 py-1.5"
                    value={selectedInventaris.namaAlat?.kategoriAlat?.nama_kategori || '-'} readOnly />
                </div>
                <div className="form-group">
                  <label className="block text-xs text-gray-500 mb-1">Interval Maintenance</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-700 bg-[#E9ECEF] border border-gray-300 rounded px-3 py-1.5"
                    value={`${selectedInventaris.interval_maintenance || 0} Kali / Tahun`} readOnly />
                </div>
              </div>
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
                    options={teknisiOptions.map(t => ({ value: t.id_user, label: t.nama_lengkap }))}
                    placeholder="Pilih Teknisi untuk semua..."
                    searchPlaceholder="Cari teknisi..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                {schedules.map((sch, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        label={`Jadwal Pemeliharaan ${idx + 1}`}
                        value={sch.jadwal_pemeliharaan}
                        onChange={(e) => handleDateChange(idx, e.target.value)}
                        required
                      />
                      <SearchableSelect
                        label="Teknisi"
                        name={`teknisi_${idx}`}
                        value={sch.teknisi_id}
                        onChange={(e) => handleTeknisiChange(idx, e.target.value)}
                        options={teknisiOptions.map(t => ({ value: t.id_user, label: t.nama_lengkap }))}
                        placeholder="-- Pilih Teknisi --"
                        searchPlaceholder="Cari teknisi..."
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
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          {!hasActiveSchedule && schedules.length > 0 && (
            <Button onClick={handleSubmit} loading={loading}>
              Simpan Semua Jadwal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
