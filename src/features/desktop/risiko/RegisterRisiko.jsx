import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, ClipboardCheck, Wrench } from 'lucide-react';
import {
  useRisikoRegister,
  useRisikoRingkasan,
  useNilaiMassalRisiko,
  useTerapkanIntervalRisiko,
  useMasterNamaAlat,
  useMasterDivisi,
  useMasterRuangan,
  useAuth,
  useDebounce,
  useModal,
  usePagination,
  usePageTitle,
  useToast,
} from '../../../hooks';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import Modal from '../../../components/Modal';
import Pagination from '../../../components/Pagination';
import ConfirmDialog from '../../../components/Alert/Alert';
import TableSkeleton from '../../../components/TableSkeleton';
import RisikoBadge from '../../../components/RisikoBadge';
import { ACCESS, ROLES, hasRole, isRole } from '../../auth/constants';
import { formatDateShort } from '../../../utils/format';
import {
  SKOR_FUNGSI, SKOR_RISIKO_KLINIS, SKOR_PEMELIHARAAN, KELAS_AMDD, hitungRisiko,
} from '../../../utils/risiko';

const TH = 'py-2 px-3 text-xs font-bold text-[#808191] uppercase';
const SKOR_KOSONG = { skor_fungsi: '', skor_risiko_klinis: '', skor_pemeliharaan: '', kelas_amdd: '' };

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

function SummaryCard({ label, value, color, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 bg-white transition-all hover:shadow-md ${active ? 'ring-2 ring-brand-primary border-brand-primary' : 'border-gray-100'}`}
    >
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value ?? '-'}</p>
    </button>
  );
}

export default function RegisterRisiko() {
  usePageTitle('Register Risiko Alat');
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = hasRole(user, ACCESS.risikoKelola);
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);

  const [tab, setTab] = useState('register');
  const [filters, setFilters] = useState({ search: '', tingkat: '', interval: '', divisi_id: '', ruangan_id: '' });
  const debouncedSearch = useDebounce(filters.search, 400);
  const pagination = usePagination(15);
  const { setMetadata, reset: resetPage } = pagination;

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [confirm, setConfirm] = useState(null); // { semua: bool }
  const [selectedJenis, setSelectedJenis] = useState([]);
  const [skor, setSkor] = useState(SKOR_KOSONG);
  const nilaiModal = useModal();

  const { data: ringkasan } = useRisikoRingkasan();
  const { data: registerData, isLoading } = useRisikoRegister({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });
  const { data: namaAlatData } = useMasterNamaAlat({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const nilaiMutation = useNilaiMassalRisiko();
  const terapkanMutation = useTerapkanIntervalRisiko();

  const rows = registerData?.data || [];
  const meta = registerData?.meta;
  useEffect(() => { if (meta) setMetadata(meta); }, [meta, setMetadata]);

  const divisions = divisiData?.data || [];
  const rooms = ruanganData?.data || [];

  // Antrean: jenis alat yang belum dinilai (Admin Divisi hanya divisinya, sama dengan aturan server).
  const belumDinilai = (namaAlatData?.data || namaAlatData || [])
    .filter((n) => !n.tingkat_risiko)
    .filter((n) => !isAdminDivisi || n.divisi_id === user?.divisi_id);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSelectedUnits([]);
    resetPage();
  };
  const pickSummary = (patch) => {
    setTab('register');
    setFilters((prev) => ({ ...prev, tingkat: '', interval: '', ...patch }));
    setSelectedUnits([]);
    resetPage();
  };

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

  const risiko = hitungRisiko(skor.skor_fungsi, skor.skor_risiko_klinis, skor.skor_pemeliharaan);
  const setSkorField = (name) => (e) => setSkor((prev) => ({ ...prev, [name]: e.target.value }));

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

      <div>
        <h1 className="text-xl font-bold text-text-dark flex items-center gap-2">
          <ShieldAlert size={22} className="text-brand-primary" />
          Register Risiko Alat
        </h1>
        <p className="text-text-gray text-xs mt-1">
          Tingkat risiko peralatan medis metode Fennig-Koh (MFK 7) dan kesesuaian interval pemeliharaan.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Risiko Tinggi" value={ringkasan?.tinggi} color="text-red-600" active={tab === 'register' && filters.tingkat === 'Tinggi'} onClick={() => pickSummary({ tingkat: 'Tinggi' })} />
        <SummaryCard label="Risiko Sedang" value={ringkasan?.sedang} color="text-amber-600" active={tab === 'register' && filters.tingkat === 'Sedang'} onClick={() => pickSummary({ tingkat: 'Sedang' })} />
        <SummaryCard label="Risiko Rendah" value={ringkasan?.rendah} color="text-emerald-600" active={tab === 'register' && filters.tingkat === 'Rendah'} onClick={() => pickSummary({ tingkat: 'Rendah' })} />
        <SummaryCard label="Belum Dinilai" value={ringkasan?.belum_dinilai} color="text-gray-600" active={tab === 'register' && filters.tingkat === 'Belum'} onClick={() => pickSummary({ tingkat: 'Belum' })} />
        <SummaryCard label="Interval Tidak Sesuai" value={ringkasan?.interval_kurang} color="text-orange-600" active={tab === 'register' && filters.interval === 'kurang'} onClick={() => pickSummary({ interval: 'kurang' })} />
      </div>

      <div className="bg-white rounded-[20px] p-4 md:p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari no. inventaris / nama alat..."
                  className="w-full pl-9 pr-3 h-[36px] rounded-lg bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none text-xs"
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                />
              </div>
              <Select size="sm" value={filters.tingkat} onChange={(e) => setFilter('tingkat', e.target.value)} placeholder="Semua Tingkat" placeholderDisabled={false}
                options={[{ value: 'Tinggi', label: 'Tinggi' }, { value: 'Sedang', label: 'Sedang' }, { value: 'Rendah', label: 'Rendah' }, { value: 'Belum', label: 'Belum dinilai' }]} />
              {!isAdminDivisi && (
                <Select size="sm" value={filters.divisi_id} onChange={(e) => setFilter('divisi_id', e.target.value)} placeholder="Semua Divisi" placeholderDisabled={false}
                  options={divisions.map((d) => ({ value: d.id_divisi, label: d.nama_divisi }))} />
              )}
              <Select size="sm" value={filters.ruangan_id} onChange={(e) => setFilter('ruangan_id', e.target.value)} placeholder="Semua Ruangan" placeholderDisabled={false}
                options={rooms.map((r) => ({ value: r.id_ruangan || r.id, label: r.nama_ruangan }))} />
            </div>

            {canManage && (selectedUnits.length > 0 || (ringkasan?.interval_kurang ?? 0) > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-xs text-orange-800 font-medium mr-auto">
                  {ringkasan?.interval_kurang ?? 0} alat memiliki interval di bawah pedoman (Tinggi minimal 2x/tahun, Sedang/Rendah 1x/tahun).
                </span>
                {selectedUnits.length > 0 && (
                  <Button className="py-1.5 px-3 text-xs" onClick={() => setConfirm({ semua: false })} disabled={terapkanMutation.isPending}>
                    Terapkan ke {selectedUnits.length} terpilih
                  </Button>
                )}
                <Button variant="ghost" className="py-1.5 px-3 text-xs" onClick={() => setConfirm({ semua: true })} disabled={terapkanMutation.isPending}>
                  Terapkan ke semua yang tidak sesuai
                </Button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-light border-b border-gray-100">
                    {canManage && (
                      <th className={`${TH} w-8`}>
                        <input type="checkbox" aria-label="Pilih semua yang tidak sesuai" checked={allSelected} disabled={selectableIds.length === 0}
                          onChange={() => setSelectedUnits(allSelected ? [] : selectableIds)} />
                      </th>
                    )}
                    <th className={TH}>No. Inventaris</th>
                    <th className={TH}>Nama Alat</th>
                    <th className={TH}>Ruangan</th>
                    <th className={TH}>Divisi</th>
                    <th className={TH}>Risiko</th>
                    <th className={TH}>Interval PM</th>
                    <th className={TH}>Berlaku Hingga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <TableSkeleton rows={8} columns={canManage ? 8 : 7} />
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={canManage ? 8 : 7} className="py-12 text-center text-sm text-gray-400">Tidak ada alat yang cocok dengan filter.</td></tr>
                  ) : rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      {canManage && (
                        <td className="py-1.5 px-3">
                          {r.interval_kurang && (
                            <input type="checkbox" aria-label={`Pilih ${r.no_inventaris}`} checked={selectedUnits.includes(r.id)} onChange={() => toggleUnit(r.id)} />
                          )}
                        </td>
                      )}
                      <td className="py-1.5 px-3 text-xs font-semibold">{r.no_inventaris || '-'}</td>
                      <td className="py-1.5 px-3 text-xs">{r.nama_alat || '-'}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{r.ruangan || '-'}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{r.divisi || '-'}</td>
                      <td className="py-1.5 px-3"><RisikoBadge tingkat={r.tingkat_risiko} skor={r.skor_risiko} size="sm" /></td>
                      <td className="py-1.5 px-3 text-xs">
                        {r.interval_kurang ? (
                          <span className="inline-flex items-center gap-1 text-orange-700 font-semibold" title="Di bawah minimum pedoman">
                            <AlertTriangle size={12} />
                            {r.interval_maintenance > 0 ? `${r.interval_maintenance}x` : 'Belum diatur'} (min {r.interval_rekomendasi}x)
                          </span>
                        ) : (
                          <span className="text-gray-600">{r.interval_maintenance > 0 ? `${r.interval_maintenance}x / tahun` : '-'}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{r.kadaluwarsa ? formatDateShort(r.kadaluwarsa) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={pagination.goToPage} totalData={pagination.totalItems} size="sm" />
            </div>
          </>
        )}

        {tab === 'belum' && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-xs text-gray-500 mr-auto">
                Jenis alat yang belum punya skor risiko. Pilih beberapa jenis yang tingkat risikonya sama, lalu beri skor sekaligus.
              </p>
              {canManage && (
                <Button className="py-1.5 px-3 text-xs flex items-center gap-1.5" disabled={selectedJenis.length === 0} onClick={nilaiModal.open}>
                  <ClipboardCheck size={14} />
                  Nilai {selectedJenis.length || ''} terpilih
                </Button>
              )}
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-light border-b border-gray-100">
                    {canManage && (
                      <th className={`${TH} w-8`}>
                        <input type="checkbox" aria-label="Pilih semua" checked={allJenisSelected} disabled={belumDinilai.length === 0}
                          onChange={() => setSelectedJenis(allJenisSelected ? [] : belumDinilai.map((n) => n.id))} />
                      </th>
                    )}
                    <th className={TH}>Nama Alat</th>
                    <th className={TH}>Kategori</th>
                    <th className={TH}>Divisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {belumDinilai.length === 0 ? (
                    <tr><td colSpan="4" className="py-12 text-center text-sm text-gray-400">Semua jenis alat sudah dinilai.</td></tr>
                  ) : belumDinilai.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50/50">
                      {canManage && (
                        <td className="py-1.5 px-3"><input type="checkbox" aria-label={`Pilih ${n.nama_nama_alat}`} checked={selectedJenis.includes(n.id)} onChange={() => toggleJenis(n.id)} /></td>
                      )}
                      <td className="py-1.5 px-3 text-xs font-semibold">{n.nama_nama_alat}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{n.kategori_alat?.nama_kategori || '-'}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{n.divisi?.nama_divisi || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <span className="text-sm font-bold text-text-dark flex items-center gap-2"><Wrench size={14} /> Skor Fennig-Koh</span>
            <RisikoBadge tingkat={risiko?.tingkat} skor={risiko?.total} />
          </div>
          <Select label="Fungsi Alat" value={skor.skor_fungsi} onChange={setSkorField('skor_fungsi')} options={SKOR_FUNGSI} placeholder="Pilih skor" required />
          <Select label="Risiko Klinis (bila alat gagal)" value={skor.skor_risiko_klinis} onChange={setSkorField('skor_risiko_klinis')} options={SKOR_RISIKO_KLINIS} placeholder="Pilih skor" required />
          <Select label="Persyaratan Pemeliharaan" value={skor.skor_pemeliharaan} onChange={setSkorField('skor_pemeliharaan')} options={SKOR_PEMELIHARAAN} placeholder="Pilih skor" required />
          <Select label="Kelas Risiko Kemenkes (opsional)" value={skor.kelas_amdd} onChange={setSkorField('kelas_amdd')} options={KELAS_AMDD} placeholder="Tidak diisi" placeholderDisabled={false} />
        </form>
      </Modal>
    </div>
  );
}
