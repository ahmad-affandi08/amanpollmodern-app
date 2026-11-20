import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import Button from '../../../components/Button';
import FilterBar from '../../../components/FilterBar';
import EmptyState from '../../../components/EmptyState';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import LembarSkiTable from '../../../components/LembarSkiTable';
import AnalisisApi from '../../../api/AnalisisApi';
import { useAnalisisRealisasiSki } from '../../../hooks/queries/useAnalisisQueries';
import { OPSI_BULAN, opsiTahun, unduhBlob } from '../../../utils/realisasiSki';
import useTeknisiOptions from '../report/useTeknisiOptions';
import { AnalisisLoading, AnalisisError, AnalisisHeader } from './AnalisisCommon';

/**
 * Realisasi SKI teknisi per bulan untuk pemantau (Super Admin, Admin Divisi, Pimpinan).
 * Hanya kolom Realisasi: target, bobot, capaian, dan nilai dihitung di aplikasi IKI RS.
 */
export default function RealisasiSkiPage() {
  usePageTitle('Realisasi SKI Teknisi');
  const { showToast } = useToast();
  const teknisiOptions = useTeknisiOptions();
  const sekarang = new Date();
  // ?teknisi=ID: tautan dari halaman Kinerja Teknisi langsung membuka teknisi itu.
  const [searchParams] = useSearchParams();
  const [teknisiId, setTeknisiId] = useState(searchParams.get('teknisi') || '');
  const [bulan, setBulan] = useState(sekarang.getMonth() + 1);
  const [tahun, setTahun] = useState(sekarang.getFullYear());
  const [mengunduh, setMengunduh] = useState(false);

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useAnalisisRealisasiSki(
    { teknisiId, bulan, tahun },
    { enabled: !!teknisiId }
  );

  const handleExport = async () => {
    setMengunduh(true);
    try {
      const { blob, filename } = await AnalisisApi.exportRealisasiSki({ teknisi_id: teknisiId, bulan, tahun });
      unduhBlob(new Blob([blob], { type: 'application/vnd.ms-excel' }), filename || `Realisasi_SKI_${tahun}-${bulan}.xls`);
    } catch {
      showToast('Gagal mengunduh Excel', 'error');
    } finally {
      setMengunduh(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AnalisisHeader
        title="Realisasi SKI Teknisi"
        description="Angka realisasi per bulan dari data AmanPoll untuk disalin ke IKI. Target, bobot, capaian, dan nilai dihitung di IKI."
      />

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          className="mb-0"
          gridClassName="grid-cols-1 md:grid-cols-3"
          actions={
            <Button variant="outline" size="sm" onClick={handleExport} loading={mengunduh} disabled={!teknisiId} className="gap-2">
              <Download size={14} />
              Export Excel
            </Button>
          }
        >
          <SearchableSelect
            name="teknisi_id"
            size="sm"
            value={teknisiId}
            onChange={(e) => setTeknisiId(e.target.value)}
            options={[{ label: 'Pilih Teknisi', value: '' }, ...teknisiOptions]}
            placeholder="Pilih Teknisi"
            searchPlaceholder="Cari teknisi..."
          />
          <Select size="sm" aria-label="Bulan" value={bulan} onChange={(e) => setBulan(Number(e.target.value))} options={OPSI_BULAN} />
          <Select size="sm" aria-label="Tahun" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} options={opsiTahun(sekarang)} />
        </FilterBar>
      </div>

      {!teknisiId ? (
        <div className="bg-white rounded-xl shadow-sm">
          <EmptyState
            variant="pilih"
            title="Pilih teknisi untuk melihat realisasi"
            description="Angka dihitung per bulan dari aduan, pemeliharaan, dan laporan servis."
          />
        </div>
      ) : isLoading ? (
        <AnalisisLoading text="Menghitung realisasi, mohon tunggu..." />
      ) : isError || !data ? (
        <AnalisisError message="Gagal mengambil realisasi SKI." onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <LembarSkiTable kop={data.kop} pegawai={data.pegawai} indikator={data.indikator} />
          </div>
        </div>
      )}
    </div>
  );
}
