import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Wrench, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisKinerja } from '../../../hooks/queries/useAnalisisQueries';
import { formatNumber } from '../../../utils/format';
import { AnalisisPage, AnalisisStat, AnalisisPanel, AnalisisChart } from './AnalisisCommon';
import { useAnalisisFilter, selisih, gabung, TOOLTIP_STYLE, AXIS_TICK } from './analisisUtil';

/** Teknisi dengan tugas aktif melebihi ini ditandai merah. */
const BEBAN_TINGGI = 5;
const WARNA_AGING = ['#22c55e', '#f59e0b', '#ef4444'];
// Pemeliharaan aktif: belum jatuh tempo, terlambat sampai 7 hari, terlambat lebih dari 7 hari.
const WARNA_PM = ['#3F8CFF', '#FFAF4E', '#ef4444'];

const kinerjaColumns = [
  { id: 'nama_teknisi', header: 'Nama Teknisi', meta: { cellClassName: 'font-semibold' }, cell: ({ row: { original: t } }) => (
    <Link to={`/analisis/realisasi-ski?teknisi=${t.id_user}`} title="Lihat Realisasi SKI" className="text-brand-primary hover:underline">{t.nama_teknisi}</Link>
  ) },
  { id: 'aktif', header: 'Tugas Aktif', meta: { align: 'center' }, cell: ({ row: { original: teknisi } }) => {
    const totalAktif = Number(teknisi.aduan_aktif || 0) + Number(teknisi.pemeliharaan_aktif || 0);
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${totalAktif > BEBAN_TINGGI ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`}>
        {totalAktif}
      </span>
    );
  } },
  { id: 'selesai', header: 'Tugas Selesai', meta: { align: 'center' }, cell: ({ row }) => (
    <span className="text-gray-700 font-semibold">{row.original.total_tugas_selesai}</span>
  ) },
  { id: 'sla', header: 'SLA (rata-rata / median)', meta: { align: 'right' }, cell: ({ row: { original: t } }) => (
    <span className="text-gray-600">{t.avg_resolution_days} / {t.median_resolution_days} hari</span>
  ) },
];

export default function KinerjaTeknisiPage() {
  usePageTitle('Analisis Kinerja Teknisi');
  const filter = useAnalisisFilter();
  const query = useAnalisisKinerja(filter);

  return (
    <AnalisisPage
      title="Analisis Kinerja Teknisi"
      description="Kecepatan penyelesaian, beban kerja, aduan yang menggantung, dan ketepatan jadwal pemeliharaan."
      filter={filter}
      query={query}
      loadingText="Menganalisis kinerja teknisi, mohon tunggu..."
      errorText="Gagal mengambil data kinerja."
      ekspor={{
        nama: 'Analisis_Kinerja_Teknisi',
        bagian: (d) => [
          { judul: 'Kinerja teknisi', kolom: ['Teknisi', 'Aduan aktif', 'Pemeliharaan aktif', 'Aduan selesai', 'Pemeliharaan selesai', 'SLA rata-rata (hari)', 'SLA median (hari)'],
            baris: d.leaderboard.map((t) => [t.nama_teknisi, t.aduan_aktif, t.pemeliharaan_aktif, t.aduan_selesai, t.pemeliharaan_selesai, t.avg_resolution_days, t.median_resolution_days]) },
          { judul: 'Aduan yang masih aktif menurut lama', kolom: ['Lama', 'Jumlah'], baris: d.aging_aduan.map((a) => [a.label, a.total]) },
          { judul: 'Pemeliharaan yang masih aktif menurut jadwal', kolom: ['Jadwal', 'Jumlah'], baris: d.aging_pemeliharaan.map((a) => [a.label, a.total]) },
          { judul: 'Jadwal pemeliharaan', kolom: ['Indikator', 'Nilai'], baris: [
            ['Selesai tepat waktu', d.jadwal_pm.tepat_waktu], ['Selesai terlambat', d.jadwal_pm.terlambat],
            ['Tepat waktu (%)', d.jadwal_pm.persen_tepat], ['Belum dikerjakan dan lewat jadwal', d.jadwal_pm.belum_dikerjakan_lewat_jadwal],
          ] },
        ],
      }}
    >
      {(data) => {
        const { leaderboard, jadwal_pm: pm } = data;
        const totalSelesai = data.total_aduan_selesai + data.total_pemeliharaan_selesai;

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnalisisStat tone="purple" icon={CheckCircle} title="Rata-rata SLA" value={`${data.avg_resolution_all_days} Hari`} subValue="Aduan masuk sampai selesai diperiksa" />
              <AnalisisStat
                tone="green" icon={Wrench} title="Tugas Selesai" value={`${formatNumber(totalSelesai)} Tugas`}
                subValue={gabung(selisih(totalSelesai, data.total_selesai_sebelumnya), `${formatNumber(data.total_aduan_selesai)} aduan`, `${formatNumber(data.total_pemeliharaan_selesai)} pemeliharaan`)}
              />
              <AnalisisStat
                tone={pm.persen_tepat !== null && pm.persen_tepat < 80 ? 'orange' : 'blue'} icon={CalendarCheck} title="Pemeliharaan Tepat Waktu"
                value={pm.persen_tepat === null ? '-' : `${pm.persen_tepat}%`}
                subValue={gabung(`${pm.tepat_waktu} tepat`, `${pm.terlambat} terlambat`, pm.belum_dikerjakan_lewat_jadwal ? `${pm.belum_dikerjakan_lewat_jadwal} lewat jadwal` : null)}
              />
            </div>

            <AnalisisPanel title="Top Performer (Tugas Selesai Terbanyak)">
              <AnalisisChart tinggi={300} kosong={!leaderboard.some((t) => t.total_tugas_selesai > 0)}>
                <BarChart data={leaderboard.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                  <YAxis dataKey="nama_teknisi" type="category" width={120} tick={{ fontSize: 12, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="aduan_selesai" stackId="tugas" fill="#6C5DD3" name="Aduan" barSize={20} />
                  <Bar dataKey="pemeliharaan_selesai" stackId="tugas" fill="#10B981" name="Pemeliharaan" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnalisisPanel
                title="Aduan yang Masih Aktif"
                description={`${formatNumber(data.aduan_aktif)} aduan belum selesai${data.aduan_belum_ditugaskan ? `, ${data.aduan_belum_ditugaskan} belum ditugaskan` : ''}. Keadaan saat ini.`}
              >
                <AnalisisChart tinggi={260} kosong={!data.aduan_aktif} teks="Tidak ada aduan yang menggantung.">
                  <BarChart data={data.aging_aduan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Aduan" barSize={32}>
                      {data.aging_aduan.map((a, i) => <Cell key={a.label} fill={WARNA_AGING[i]} />)}
                    </Bar>
                  </BarChart>
                </AnalisisChart>
              </AnalisisPanel>

              <AnalisisPanel
                title="Pemeliharaan yang Masih Aktif"
                description={`${formatNumber(data.pemeliharaan_aktif)} pemeliharaan belum selesai${data.pemeliharaan_belum_ditugaskan ? `, ${data.pemeliharaan_belum_ditugaskan} belum ditugaskan` : ''}. Menurut jadwal, keadaan saat ini.`}
              >
                <AnalisisChart tinggi={260} kosong={!data.pemeliharaan_aktif} teks="Tidak ada pemeliharaan yang menunggu.">
                  <BarChart data={data.aging_pemeliharaan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Pemeliharaan" barSize={32}>
                      {data.aging_pemeliharaan.map((a, i) => <Cell key={a.label} fill={WARNA_PM[i]} />)}
                    </Bar>
                  </BarChart>
                </AnalisisChart>
              </AnalisisPanel>
            </div>

            <AnalisisPanel title="Detail Beban Kerja & SLA Teknisi" description="Klik nama teknisi untuk melihat Realisasi SKI-nya. Tugas aktif berwarna merah bila lebih dari 5.">
              <DataTable columns={kinerjaColumns} data={leaderboard} getRowId={(teknisi) => teknisi.id_user} />
            </AnalisisPanel>
          </>
        );
      }}
    </AnalisisPage>
  );
}
