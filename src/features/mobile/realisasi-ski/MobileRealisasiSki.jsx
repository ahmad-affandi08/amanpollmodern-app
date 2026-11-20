import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import RealisasiSkiList from '../../../components/RealisasiSkiList';
import AnalisisApi from '../../../api/AnalisisApi';
import { useAnalisisRealisasiSki } from '../../../hooks/queries/useAnalisisQueries';
import { OPSI_BULAN, opsiTahun, unduhBlob } from '../../../utils/realisasiSki';

/** Realisasi SKI milik teknisi yang login (server selalu memakai teknisi dari sesi). */
export default function MobileRealisasiSki() {
  usePageTitle('Realisasi SKI');
  const { showToast } = useToast();
  const sekarang = new Date();
  const [bulan, setBulan] = useState(sekarang.getMonth() + 1);
  const [tahun, setTahun] = useState(sekarang.getFullYear());
  const [mengunduh, setMengunduh] = useState(false);

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useAnalisisRealisasiSki({ bulan, tahun });

  const handleExport = async () => {
    setMengunduh(true);
    try {
      const { blob, filename } = await AnalisisApi.exportRealisasiSki({ bulan, tahun });
      unduhBlob(new Blob([blob], { type: 'application/vnd.ms-excel' }), filename || `Realisasi_SKI_${tahun}-${bulan}.xls`);
    } catch {
      showToast('Gagal mengunduh Excel', 'error');
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Realisasi SKI</h1>
        <p className="text-xs text-gray-500">Angka realisasi bulanan dari data AmanPoll untuk disalin ke IKI.</p>
      </div>

      {/* Menempel di bawah header tetap (72px) supaya bulan/tahun & unduhan selalu terjangkau saat menggulir daftar panjang. */}
      <div className="sticky top-[72px] z-30 -mx-4 mb-4 bg-brand-primary-soft/95 px-4 py-2 backdrop-blur">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Select size="sm" className="!bg-white" aria-label="Bulan" value={bulan} onChange={(e) => setBulan(Number(e.target.value))} options={OPSI_BULAN} />
          <Select size="sm" className="!bg-white" aria-label="Tahun" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} options={opsiTahun(sekarang)} />
          <Button variant="outline" size="sm" className="gap-1.5 !bg-white" onClick={handleExport} loading={mengunduh} aria-label="Unduh Excel">
            <Download size={14} />
            Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center">
          <p className="text-sm font-semibold text-gray-700">Gagal mengambil realisasi SKI.</p>
          <Button size="sm" className="mt-3" onClick={() => refetch()} loading={isFetching}>Coba Lagi</Button>
        </div>
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <RealisasiSkiList indikator={data.indikator} />
        </div>
      )}
    </div>
  );
}
