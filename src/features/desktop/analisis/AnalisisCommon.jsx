import React, { useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import StatCard from '../../../components/StatCard';
import EmptyState from '../../../components/EmptyState';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import { useToast } from '../../../components/Alert/useToast';
import { useAuth } from '../../../hooks';
import { useMasterDivisi, useMasterKategori } from '../../../hooks/queries/useMasterDataQueries';
import { unduhExcel } from '../../../utils/ekspor';
import { toInputDate } from '../../../utils/format';
import { ROLES, hasRole } from '../../auth/constants';
import { OPSI_PERIODE, warnaKe } from './analisisUtil';

/** Warna kartu angka: sama dengan kartu di Dashboard. */
const TONE = {
  purple: {
    bgColor: 'bg-gradient-to-br from-[#F2F0FF] via-[#E2DBFF] to-[#C4B5FD]',
    iconColor: 'text-brand-primary',
    cardBgColor: 'bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30',
  },
  green: {
    bgColor: 'bg-gradient-to-br from-[#F0FDF9] via-[#D1FBEA] to-[#6EE7B7]',
    iconColor: 'text-[#059669]',
    cardBgColor: 'bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30',
  },
  orange: {
    bgColor: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFE5D3] to-[#FDBA74]',
    iconColor: 'text-[#EA580C]',
    cardBgColor: 'bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30',
  },
  blue: {
    bgColor: 'bg-gradient-to-br from-[#F0F9FF] via-[#E3F2FF] to-[#93C5FD]',
    iconColor: 'text-[#2563EB]',
    cardBgColor: 'bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30',
  },
  red: {
    bgColor: 'bg-gradient-to-br from-[#FFF1F2] via-[#FFE0E3] to-[#FCA5A5]',
    iconColor: 'text-[#DC2626]',
    cardBgColor: 'bg-gradient-to-br from-red-50/50 via-white to-red-50/30',
  },
};

/** Judul halaman: sama dengan halaman lain (judul di luar kartu, deskripsi kecil, aksi di kanan). */
export function AnalisisHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-text-dark">{title}</h1>
        {description && <p className="text-[#808191] text-xs mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Kartu angka ringkas: StatCard yang dipakai Dashboard, dengan pilihan warna lewat `tone`. */
export function AnalisisStat({ tone = 'purple', icon, ...props }) {
  return <StatCard icon={React.createElement(icon, { size: 20 })} {...TONE[tone]} {...props} />;
}

/** Kartu putih untuk grafik/tabel: judul `font-bold text-lg` dan deskripsi kecil seperti di Dashboard. */
export function AnalisisPanel({ title, description, className = '', children }) {
  return (
    <div className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="mb-6">
        <h3 className="font-bold text-lg text-text-dark">{title}</h3>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Tampilan saat data analisis dimuat pertama kali. */
export function AnalisisLoading({ text = 'Menganalisis data, mohon tunggu...' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[60vh]">
      <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
      <p className="text-gray-500 text-sm font-medium">{text}</p>
    </div>
  );
}

/** Tampilan saat data analisis gagal dimuat (atau kosong), dengan tombol coba lagi. */
export function AnalisisError({ message = 'Gagal memuat data analisis.', onRetry, retrying = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm min-h-[40vh] flex items-center justify-center">
      <EmptyState
        variant="galat"
        title={message}
        description="Periksa koneksi Anda, lalu coba lagi."
        action={
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center gap-2 h-[36px] px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-xs font-semibold disabled:opacity-60"
          >
            <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
            Coba Lagi
          </button>
        }
      />
    </div>
  );
}

// ------------------------------------------------------------------ filter, halaman, grafik

/**
 * Kerangka semua halaman analisis ringkasan: judul, filter, tombol export Excel,
 * status memuat/galat, dan isi halaman. Data lama tampil redup saat filter berganti.
 *
 * @param {object}   filter      hasil useAnalisisFilter()
 * @param {object}   query       hasil hook useAnalisis*(filter)
 * @param {boolean}  denganPeriode  false untuk halaman yang hanya menampilkan keadaan terkini
 * @param {boolean}  denganKategori true bila halaman bisa disaring menurut kategori alat
 * @param {{nama: string, bagian: (data) => Array}} ekspor  isi file Excel (lihat utils/ekspor.js)
 * @param {(data: object) => React.ReactNode} children
 */
export function AnalisisPage({ title, description, filter, query, denganPeriode = true, denganKategori = false, loadingText, errorText, ekspor, children }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = query;
  const { data: kategoriData } = useMasterKategori({ all: 1 });
  const pemantau = hasRole(user, [ROLES.SUPER_ADMIN, ROLES.PIMPINAN]);
  const divisi = (divisiData?.data || []).map((d) => ({ label: d.nama_divisi, value: d.id_divisi }));

  const kategori = (kategoriData?.data || []).map((k) => ({ label: k.nama_kategori, value: k.id }));

  useEffect(() => {
    if (isError) showToast(errorText, 'error');
  }, [isError, showToast, errorText]);

  const handleExport = () => {
    const namaDivisi = divisi.find((d) => String(d.value) === String(filter.divisiId))?.label;
    // Halaman tanpa periode (kalibrasi, risiko) tidak selalu membawa meta: pakai tanggal hari ini.
    const meta = data.meta ?? {};
    const sampai = meta.sampai || toInputDate();
    const namaKategori = denganKategori && kategori.find((k) => String(k.value) === String(filter.kategoriId))?.label;
    const keterangan = [
      denganPeriode ? `Periode: ${meta.label}${meta.dari ? ` (${meta.dari} s/d ${sampai})` : ''}` : `Per tanggal ${sampai}`,
      namaDivisi ? `Divisi: ${namaDivisi}` : 'Semua divisi',
      namaKategori && `Kategori: ${namaKategori}`,
    ].filter(Boolean).join(' | ');
    unduhExcel(`${ekspor.nama}_${sampai}`, title, keterangan, ekspor.bagian(data));
  };

  const tampilFilter = denganPeriode || denganKategori || (pemantau && divisi.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <AnalisisHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data} className="gap-2">
            <Download size={14} />
            Export Excel
          </Button>
        }
      />

      {tampilFilter && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 [&_select]:!bg-white">
          {denganPeriode && (
            <Select size="sm" aria-label="Periode" value={filter.periode} onChange={(e) => filter.setPeriode(e.target.value)} options={OPSI_PERIODE} />
          )}
          {pemantau && divisi.length > 0 && (
            <Select
              size="sm"
              aria-label="Divisi"
              value={filter.divisiId}
              onChange={(e) => filter.setDivisiId(e.target.value)}
              options={[{ label: 'Semua Divisi', value: '' }, ...divisi]}
            />
          )}
          {denganKategori && kategori.length > 0 && (
            <Select
              size="sm"
              aria-label="Kategori alat"
              value={filter.kategoriId}
              onChange={(e) => filter.setKategoriId(e.target.value)}
              options={[{ label: 'Semua Kategori Alat', value: '' }, ...kategori]}
            />
          )}
        </div>
      )}

      {isLoading ? (
        <AnalisisLoading text={loadingText} />
      ) : !data ? (
        <AnalisisError message={errorText} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <div className={`space-y-6 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>{children(data)}</div>
      )}
    </div>
  );
}

/** Tinggi tetap + pesan "belum ada data" bila `kosong`, supaya grafik tanpa data tidak jadi sumbu kosong. */
export function AnalisisChart({ kosong, tinggi = 300, teks = 'Belum ada data pada periode ini.', children }) {
  return (
    <div className="w-full" style={{ height: tinggi }}>
      {kosong ? (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">{teks}</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      )}
    </div>
  );
}

/** Daftar proporsi sederhana: nama, nilai, dan batang sepanjang nilai terbesar. */
export function DaftarProporsi({ items, format = (n) => n, warna, kosong = 'Belum ada data.' }) {
  if (!items.length) return <p className="text-xs text-gray-400 py-6 text-center">{kosong}</p>;
  const maks = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-semibold text-text-dark truncate">{item.name}</span>
            <span className="shrink-0 text-gray-600">{format(item.value)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(item.value / maks) * 100}%`, backgroundColor: warna ?? warnaKe(i) }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
