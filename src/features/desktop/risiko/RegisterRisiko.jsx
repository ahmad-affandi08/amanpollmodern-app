import React, { useState } from 'react';
import { ShieldAlert, Shield, ShieldCheck, HelpCircle, Wrench, Search, AlertTriangle, ClipboardCheck, Download, Clock } from 'lucide-react';
import {
  useRisikoRegister,
  useRisikoRingkasan,
  useNilaiMassalRisiko,
  useTerapkanIntervalRisiko,
  useMasterNamaAlat,
  useMasterDivisi,
  useMasterRuangan,
  useAuth,
  useModal,
  usePageTitle,
  useToast,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import ConfirmDialog from '../../../components/Alert/Alert';
import RisikoBadge from '../../../components/RisikoBadge';
import { ACCESS, ROLES, hasRole, isRole } from '../../auth/constants';
import { formatDateShort } from '../../../utils/format';
import RisikoApi from '../../../api/RisikoApi';
import {
  SKOR_FUNGSI, SKOR_RISIKO_KLINIS, SKOR_PEMELIHARAAN, KELAS_AMDD, hitungRisiko,
} from '../../../utils/risiko';

// Filter diatur lewat state TanStack (columnFilters); id filter = parameter query server.
// `interval` tidak punya kontrol sendiri: diisi dari kartu ringkasan "Interval Tidak Sesuai".
const FILTER_MAP = { tingkat: 'tingkat', interval: 'interval', divisi_id: 'divisi_id', ruangan_id: 'ruangan_id' };
const SKOR_KOSONG = { skor_fungsi: '', skor_risiko_klinis: '', skor_pemeliharaan: '', kelas_amdd: '' };

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

export default function RegisterRisiko() {
  usePageTitle('Register Risiko Alat');
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = hasRole(user, ACCESS.risikoKelola);
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);

  const [tab, setTab] = useState('register');
  const tableState = useTableState({ pageSize: 15, filterMap: FILTER_MAP, searchDelay: 400 });
  const { filters, params } = tableState;

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [confirm, setConfirm] = useState(null); // { semua: bool }
  const [selectedJenis, setSelectedJenis] = useState([]);
  const [skor, setSkor] = useState(SKOR_KOSONG);
  const nilaiModal = useModal();

  const { data: ringkasan } = useRisikoRingkasan();
  const { data: registerData, isLoading } = useRisikoRegister(params);
  const { data: namaAlatData } = useMasterNamaAlat({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const nilaiMutation = useNilaiMassalRisiko();
  const terapkanMutation = useTerapkanIntervalRisiko();

  const rows = registerData?.data || [];
  const meta = registerData?.meta;

  const divisions = divisiData?.data || [];
  const rooms = ruanganData?.data || [];

  // Antrean: jenis alat yang belum dinilai (Admin Divisi hanya divisinya, sama dengan aturan server).
  const belumDinilai = (namaAlatData?.data || namaAlatData || [])
    .filter((n) => !n.tingkat_risiko)
    .filter((n) => !isAdminDivisi || n.divisi_id === user?.divisi_id);

  const selectableIds = rows.filter((r) => r.interval_kurang).map((r) => r.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedUnits.includes(id));
  const toggleUnit = (id) => setSelectedUnits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleTerapkan = async () => {
    try {
      const res = await terapkanMutation.mutateAsync(confirm.semua ? null : selectedUnits);
      showToast(res.message || 'Interval disesuaikan', 'success');
      setSelectedUnits([]);
    } catch (error) {
      showToast(errorMessage(error, 'Gagal menyesuaikan interval'), 'error');
    } finally {
      setConfirm(null);
    }
  };

  const toggleJenis = (id) => setSelectedJenis((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const allJenisSelected = belumDinilai.length > 0 && belumDinilai.every((n) => selectedJenis.includes(n.id));

  const handleNilai = async (e) => {
    e.preventDefault();
    try {
      const res = await nilaiMutation.mutateAsync({
        nama_alat_ids: selectedJenis,
        skor_fungsi: parseInt(skor.skor_fungsi),
        skor_risiko_klinis: parseInt(skor.skor_risiko_klinis),
        skor_pemeliharaan: parseInt(skor.skor_pemeliharaan),
        kelas_amdd: skor.kelas_amdd || null,
      });
      showToast(res.message || 'Penilaian disimpan', 'success');
      setSelectedJenis([]);
      setSkor(SKOR_KOSONG);
      nilaiModal.close();
    } catch (error) {
      showToast(errorMessage(error, 'Gagal menyimpan penilaian'), 'error');
    }
  };

  const [exporting, setExporting] = useState(false);
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const blob = await RisikoApi.exportRegister(filters, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `register_risiko_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Gagal mengekspor register risiko', 'error');
    } finally {
      setExporting(false);
    }
  };

  const risiko = hitungRisiko(skor.skor_fungsi, skor.skor_risiko_klinis, skor.skor_pemeliharaan);
  const setSkorField = (name) => (e) => setSkor((prev) => ({ ...prev, [name]: e.target.value }));

  // Kolom checkbox hanya untuk pengelola; dibangun kondisional.
  const registerColumns = [
    ...(canManage ? [{
      id: 'select',
      header: () => (
        <input type="checkbox" aria-label="Pilih semua yang tidak sesuai" checked={allSelected} disabled={selectableIds.length === 0}
          onChange={() => setSelectedUnits(allSelected ? [] : selectableIds)} />
      ),
      cell: ({ row: { original: r } }) => (
        r.interval_kurang && (
          <input type="checkbox" aria-label={`Pilih ${r.no_inventaris}`} checked={selectedUnits.includes(r.id)} onChange={() => toggleUnit(r.id)} />
        )
      ),
      meta: { headerClassName: 'w-8' },
    }] : []),
    { id: 'no_inventaris', header: 'No. Inventaris', cell: ({ row }) => row.original.no_inventaris || '-', meta: { cellClassName: 'font-semibold' } },
    { id: 'nama_alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_alat || '-' },
    { id: 'ruangan', header: 'Ruangan', cell: ({ row }) => row.original.ruangan || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'divisi', header: 'Divisi', cell: ({ row }) => row.original.divisi || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'risiko', header: 'Risiko', cell: ({ row: { original: r } }) => <RisikoBadge tingkat={r.tingkat_risiko} skor={r.skor_risiko} size="sm" /> },
    { id: 'interval', header: 'Interval PM', cell: ({ row: { original: r } }) => (
      r.interval_kurang ? (
        <span className="inline-flex items-center gap-1 text-orange-700 font-semibold" title="Di bawah minimum pedoman">
          <AlertTriangle size={12} />
          {r.interval_maintenance > 0 ? `${r.interval_maintenance}x` : 'Belum diatur'} (min {r.interval_rekomendasi}x)
        </span>
      ) : (
        <span className="text-gray-600">{r.interval_maintenance > 0 ? `${r.interval_maintenance}x / tahun` : '-'}</span>
      )
    ) },
    { id: 'kadaluwarsa', header: 'Berlaku Hingga', cell: ({ row: { original: r } }) => (r.kadaluwarsa ? formatDateShort(r.kadaluwarsa) : '-'), meta: { cellClassName: 'text-gray-600' } },
  ];

  const belumColumns = [
    ...(canManage ? [{
      id: 'select',
      header: () => (
        <input type="checkbox" aria-label="Pilih semua" checked={allJenisSelected} disabled={belumDinilai.length === 0}
          onChange={() => setSelectedJenis(allJenisSelected ? [] : belumDinilai.map((n) => n.id))} />
      ),
      cell: ({ row: { original: n } }) => (
        <input type="checkbox" aria-label={`Pilih ${n.nama_nama_alat}`} checked={selectedJenis.includes(n.id)} onChange={() => toggleJenis(n.id)} />
      ),
      meta: { headerClassName: 'w-8' },
    }] : []),
    { id: 'nama_alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_nama_alat, meta: { cellClassName: 'font-semibold' } },
    { id: 'kategori', header: 'Kategori', cell: ({ row }) => row.original.kategori_alat?.nama_kategori || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'divisi', header: 'Divisi', cell: ({ row }) => row.original.divisi?.nama_divisi || '-', meta: { cellClassName: 'text-gray-600' } },
  ];

  const table = useDataTable({
    columns: registerColumns,
    data: rows,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    getRowId: (r) => r.id,
  });
  const f = getTableFilters(table);

  // Mengubah filter/pencarian mengosongkan pilihan baris (halaman kembali ke 1 otomatis oleh hook).
  const setFilter = (id, value) => { f.set(id, value); setSelectedUnits([]); };
  const handleResetFilters = () => { f.reset(); setSelectedUnits([]); };
  // Kartu ringkasan: ganti tingkat & interval sekaligus (filter lain dipertahankan).
  const pickSummary = (patch) => {
    setTab('register');
    table.setColumnFilters((old) => [
      ...old.filter((x) => x.id !== 'tingkat' && x.id !== 'interval'),
      ...Object.entries(patch).map(([id, value]) => ({ id, value })),
    ]);
    setSelectedUnits([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ConfirmDialog
        isOpen={!!confirm}
        title="Sesuaikan Interval Pemeliharaan"
        message={confirm?.semua
          ? `Naikkan interval ${ringkasan?.interval_kurang ?? ''} alat ke minimum pedoman (Tinggi 2x, Sedang/Rendah 1x per tahun)?`
          : `Naikkan interval ${selectedUnits.length} alat terpilih ke minimum pedoman?`}
        confirmText="Ya, Sesuaikan"
        onConfirm={handleTerapkan}
        onCancel={() => setConfirm(null)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Register Risiko Alat</h1>
          <p className="text-text-gray text-xs mt-1">Tingkat risiko alat metode Fennig-Koh (MFK 7) dan kesesuaian interval pemeliharaan</p>
        </div>
        <div className="grid grid-cols-1 md:flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={() => handleExport('xls')} disabled={exporting} className="gap-2 w-full md:w-auto">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={exporting} className="gap-2 w-full md:w-auto">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<ShieldAlert size={20} />} title="Risiko Tinggi" value={ringkasan?.tinggi ?? '-'}
          bgColor="bg-gradient-to-br from-[#FFF1F2] via-[#FFE0E3] to-[#FCA5A5]" iconColor="text-[#DC2626]"
          cardBgColor="bg-gradient-to-br from-red-50/50 via-white to-red-50/30"
          active={tab === 'register' && f.get('tingkat') === 'Tinggi'} onClick={() => pickSummary({ tingkat: 'Tinggi' })}
        />
        <StatCard
          icon={<Shield size={20} />} title="Risiko Sedang" value={ringkasan?.sedang ?? '-'}
          bgColor="bg-gradient-to-br from-[#FFF7ED] via-[#FFE5D3] to-[#FDBA74]" iconColor="text-[#EA580C]"
          cardBgColor="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30"
          active={tab === 'register' && f.get('tingkat') === 'Sedang'} onClick={() => pickSummary({ tingkat: 'Sedang' })}
        />
        <StatCard
          icon={<ShieldCheck size={20} />} title="Risiko Rendah" value={ringkasan?.rendah ?? '-'}
          bgColor="bg-gradient-to-br from-[#F0FDF9] via-[#D1FBEA] to-[#6EE7B7]" iconColor="text-[#059669]"
          cardBgColor="bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30"
          active={tab === 'register' && f.get('tingkat') === 'Rendah'} onClick={() => pickSummary({ tingkat: 'Rendah' })}
        />
        <StatCard
          icon={<HelpCircle size={20} />} title="Belum Dinilai" value={ringkasan?.belum_dinilai ?? '-'}
          bgColor="bg-gradient-to-br from-[#F2F0FF] via-[#E2DBFF] to-[#C4B5FD]" iconColor="text-brand-primary"
          cardBgColor="bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30"
          active={tab === 'register' && f.get('tingkat') === 'Belum'} onClick={() => pickSummary({ tingkat: 'Belum' })}
        />
        <StatCard
          icon={<Clock size={20} />} title="Interval Tidak Sesuai" value={ringkasan?.interval_kurang ?? '-'}
          bgColor="bg-gradient-to-br from-[#F0F9FF] via-[#E3F2FF] to-[#93C5FD]" iconColor="text-[#2563EB]"
          cardBgColor="bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30"
          active={tab === 'register' && f.get('interval') === 'kurang'} onClick={() => pickSummary({ interval: 'kurang' })}
        />
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {[
            ['register', 'Register Alat'],
            ['belum', `Belum Dinilai (${belumDinilai.length} jenis)`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'register' && (
          <>
            <FilterBar
              search={
                <Input
                  name="search"
                  size="sm"
                  placeholder="Cari No. Inventaris / Nama Alat..."
                  value={f.search}
                  onChange={(e) => { f.setSearch(e.target.value); setSelectedUnits([]); }}
                  icon={<Search className="w-3.5 h-3.5" />}
                  className="!bg-white"
                />
              }
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="!rounded-lg whitespace-nowrap border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                >
                  Reset Filter
                </Button>
              }
              gridClassName={isAdminDivisi ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}
            >
              <SearchableSelect
                name="tingkat"
                size="sm"
                value={f.get('tingkat')}
                onChange={(e) => setFilter('tingkat', e.target.value)}
                options={[
                  { label: 'Semua Tingkat', value: '' },
                  { label: 'Tinggi', value: 'Tinggi' },
                  { label: 'Sedang', value: 'Sedang' },
                  { label: 'Rendah', value: 'Rendah' },
                  { label: 'Belum dinilai', value: 'Belum' },
                ]}
                placeholder="Semua Tingkat"
                searchPlaceholder="Cari tingkat..."
              />
              {!isAdminDivisi && (
                <SearchableSelect
                  name="divisi_id"
                  size="sm"
                  value={f.get('divisi_id')}
                  onChange={(e) => setFilter('divisi_id', e.target.value)}
                  options={[{ label: 'Semua Divisi', value: '' }, ...divisions.map((d) => ({ label: d.nama_divisi, value: d.id_divisi }))]}
                  placeholder="Semua Divisi"
                  searchPlaceholder="Cari divisi..."
                />
              )}
              <SearchableSelect
                name="ruangan_id"
                size="sm"
                value={f.get('ruangan_id')}
                onChange={(e) => setFilter('ruangan_id', e.target.value)}
                options={[{ label: 'Semua Ruangan', value: '' }, ...rooms.map((r) => ({ label: r.nama_ruangan, value: r.id_ruangan || r.id }))]}
                placeholder="Semua Ruangan"
                searchPlaceholder="Cari ruangan..."
              />
            </FilterBar>

            {canManage && (selectedUnits.length > 0 || (ringkasan?.interval_kurang ?? 0) > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-xs text-orange-800 font-medium mr-auto">
                  {ringkasan?.interval_kurang ?? 0} alat memiliki interval di bawah pedoman (Tinggi minimal 2x/tahun, Sedang/Rendah 1x/tahun).
                </span>
                {selectedUnits.length > 0 && (
                  <Button size="sm" onClick={() => setConfirm({ semua: false })} disabled={terapkanMutation.isPending}>
                    Terapkan ke {selectedUnits.length} terpilih
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setConfirm({ semua: true })} disabled={terapkanMutation.isPending}>
                  Terapkan ke semua yang tidak sesuai
                </Button>
              </div>
            )}

            <DataTable
              table={table}
              isLoading={isLoading}
              skeletonRows={8}
              empty={{ title: 'Tidak ada alat yang cocok dengan filter.' }}
            />
          </>
        )}

        {tab === 'belum' && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-xs text-gray-500 mr-auto">
                Jenis alat yang belum punya skor risiko. Pilih beberapa jenis yang tingkat risikonya sama, lalu beri skor sekaligus.
              </p>
              {canManage && (
                <Button size="sm" className="gap-1.5" disabled={selectedJenis.length === 0} onClick={nilaiModal.open}>
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Nilai {selectedJenis.length || ''} terpilih
                </Button>
              )}
            </div>
            <DataTable
              columns={belumColumns}
              data={belumDinilai}
              getRowId={(n) => n.id}
              empty={{ title: 'Semua jenis alat sudah dinilai.' }}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={nilaiModal.isOpen}
        onClose={nilaiModal.close}
        title={`Nilai ${selectedJenis.length} Jenis Alat`}
        footer={
          <>
            <Button variant="ghost" onClick={nilaiModal.close} disabled={nilaiMutation.isPending}>Batal</Button>
            <Button type="submit" form="form-nilai-massal" loading={nilaiMutation.isPending} disabled={!risiko}>Simpan Penilaian</Button>
          </>
        }
      >
        <form id="form-nilai-massal" onSubmit={handleNilai} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-dark flex items-center gap-2"><Wrench className="w-3.5 h-3.5" /> Skor Fennig-Koh</span>
            <RisikoBadge tingkat={risiko?.tingkat} skor={risiko?.total} />
          </div>
          <SearchableSelect
            label="Fungsi Alat"
            name="skor_fungsi"
            options={SKOR_FUNGSI}
            value={skor.skor_fungsi}
            onChange={setSkorField('skor_fungsi')}
            placeholder="Pilih skor"
            searchPlaceholder="Cari skor..."
            required
          />
          <SearchableSelect
            label="Risiko Klinis (bila alat gagal)"
            name="skor_risiko_klinis"
            options={SKOR_RISIKO_KLINIS}
            value={skor.skor_risiko_klinis}
            onChange={setSkorField('skor_risiko_klinis')}
            placeholder="Pilih skor"
            searchPlaceholder="Cari skor..."
            required
          />
          <SearchableSelect
            label="Persyaratan Pemeliharaan"
            name="skor_pemeliharaan"
            options={SKOR_PEMELIHARAAN}
            value={skor.skor_pemeliharaan}
            onChange={setSkorField('skor_pemeliharaan')}
            placeholder="Pilih skor"
            searchPlaceholder="Cari skor..."
            required
          />
          <SearchableSelect
            label="Kelas Risiko Kemenkes (opsional)"
            name="kelas_amdd"
            options={[{ label: 'Tidak diisi', value: '' }, ...KELAS_AMDD]}
            value={skor.kelas_amdd}
            onChange={setSkorField('kelas_amdd')}
            placeholder="Tidak diisi"
            searchPlaceholder="Cari skor..."
          />
        </form>
      </Modal>
    </div>
  );
}
