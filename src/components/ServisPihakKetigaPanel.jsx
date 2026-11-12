import React, { useMemo, useState } from 'react';
import { Building2, Calendar, FileText, Image as ImageIcon, Plus, Trash2, User, Wrench } from 'lucide-react';
import Button from './Button';
import KondisiBadge from './KondisiBadge';
import ServisPihakKetigaModal from './ServisPihakKetigaModal';
import ConfirmDialog from './Alert/Alert';
import { useToast } from './Alert/useToast';
import { useAuth } from '../hooks';
import {
  useServisPihakKetiga,
  useHapusServisPihakKetiga,
} from '../hooks/queries/useServisPihakKetigaQueries';
import { formatDate } from '../utils/format';
import {
  aturanTambahServis,
  bolehHapusServis,
  bukaLaporan,
  pesanGalat,
} from '../utils/servisPihakKetiga';

/**
 * Daftar laporan servis pihak ketiga (vendor).
 *
 * @param {'aduan'|'pemeliharaan'|'inventaris'} jenis  'inventaris' = riwayat gabungan satu alat (hanya baca).
 * @param {number|string} indukId  id aduan / pemeliharaan / inventaris.
 * @param {string} [status]  status aduan/pemeliharaan; menentukan apakah laporan baru boleh ditambahkan.
 * @param {boolean} [tanpaJudul]  sembunyikan judul bagian (bila induk sudah punya judul sendiri).
 */
export default function ServisPihakKetigaPanel({ jenis, indukId, status, tanpaJudul = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: laporan = [], isLoading, isError } = useServisPihakKetiga(jenis, indukId);
  const hapus = useHapusServisPihakKetiga();
  const [modalOpen, setModalOpen] = useState(false);
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [membuka, setMembuka] = useState(null);

  const bacaSaja = jenis === 'inventaris';
  const aturan = bacaSaja ? { boleh: false, alasan: '' } : aturanTambahServis(user, jenis, status);
  const bolehHapus = !bacaSaja && bolehHapusServis(user);

  const namaVendorSaran = useMemo(() => [...new Set(laporan.map((l) => l.nama_vendor))], [laporan]);

  const handleBuka = async (item) => {
    setMembuka(item.id);
    try {
      await bukaLaporan(item);
    } catch (error) {
      showToast(pesanGalat(error, 'Gagal membuka file laporan'), 'error');
    } finally {
      setMembuka(null);
    }
  };

  const handleHapus = async () => {
    if (!akanDihapus) return;

    try {
      await hapus.mutateAsync(akanDihapus.id);
      showToast('Laporan pihak ketiga berhasil dihapus', 'success');
    } catch (error) {
      showToast(pesanGalat(error, 'Gagal menghapus laporan pihak ketiga'), 'error');
    } finally {
      setAkanDihapus(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-3" data-testid="servis-pihak-ketiga">
      <div className="flex items-center justify-between gap-3">
        <div>
          {!tanpaJudul && (
            <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
              <Wrench size={16} className="text-brand-primary" />
              Servis Pihak Ketiga
            </h3>
          )}
          <p className="text-xs text-gray-500">
            {isLoading ? 'Memuat...' : laporan.length > 0 ? `${laporan.length} laporan vendor` : 'Belum ada laporan vendor'}
          </p>
        </div>
        {aturan.boleh && (
          <Button type="button" size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 shrink-0">
            <Plus size={14} />
            Tambah Laporan
          </Button>
        )}
      </div>

      {!aturan.boleh && aturan.alasan && <p className="text-[11px] text-gray-400">{aturan.alasan}</p>}

      {isError && <p className="text-xs text-red-500">Gagal memuat laporan pihak ketiga.</p>}

      {!isLoading && !isError && laporan.length === 0 && (
        <div className="bg-white rounded-[20px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium text-xs">
            {bacaSaja ? 'Alat ini belum memiliki laporan servis pihak ketiga' : 'Belum ada laporan servis dari pihak ketiga'}
          </p>
        </div>
      )}

      {laporan.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {laporan.map((item) => {
            const gambar = item.jenis_file === 'jpg' || item.jenis_file === 'jpeg' || item.jenis_file === 'png';
            const IkonBerkas = gambar ? ImageIcon : FileText;

            return (
              <div key={item.id} className="bg-white rounded-[20px] p-4 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
                <div className="flex justify-between items-start gap-2 mb-3 pb-3 border-b">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                      <Building2 size={11} /> Vendor
                    </p>
                    <p className="text-sm font-bold text-brand-primary break-words">{item.nama_vendor}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] font-semibold text-text-dark flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(item.tanggal_servis)}
                    </span>
                    {item.susulan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                        Ditambahkan setelah selesai
                      </span>
                    )}
                  </div>
                </div>

                {(item.nomor_laporan || bacaSaja) && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">No. Laporan</p>
                      <p className="text-xs font-semibold text-text-dark break-words">{item.nomor_laporan || '-'}</p>
                    </div>
                    {bacaSaja && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium mb-0.5">Sumber</p>
                        <p className="text-xs font-semibold text-text-dark break-words">
                          {item.induk_tipe === 'aduan' ? 'Aduan' : 'Pemeliharaan'} {item.no_induk || ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {item.tindakan_vendor && (
                  <p className="text-xs text-text-dark leading-relaxed bg-gray-50 p-2.5 rounded-lg mb-3 whitespace-pre-line break-words">
                    {item.tindakan_vendor}
                  </p>
                )}

                {item.kondisi_setelah && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-gray-400 font-medium">Kondisi setelah servis</span>
                    <KondisiBadge kondisi={item.kondisi_setelah} size="sm" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleBuka(item)}
                  disabled={membuka === item.id}
                  className="w-full flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors mb-3 text-left disabled:opacity-60"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <IkonBerkas size={18} className="text-blue-600" />
                  </div>
                  <p className="flex-1 min-w-0 font-medium text-text-dark text-sm truncate">
                    {membuka === item.id ? 'Membuka...' : item.nama_file || 'Lihat Laporan'}
                  </p>
                </button>

                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 min-w-0">
                    <User size={11} className="shrink-0" />
                    <span className="truncate">
                      {item.dibuat_oleh ? `Diunggah ${item.dibuat_oleh}` : 'Diunggah sistem'}
                      {item.created_at && ` · ${formatDate(item.created_at)}`}
                    </span>
                  </p>
                  {bolehHapus && (
                    <button
                      type="button"
                      onClick={() => setAkanDihapus(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Hapus laporan pihak ketiga"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!bacaSaja && (
        <ServisPihakKetigaModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          jenis={jenis}
          indukId={indukId}
          namaVendorSaran={namaVendorSaran}
        />
      )}

      <ConfirmDialog
        isOpen={!!akanDihapus}
        type="danger"
        title="Hapus Laporan Pihak Ketiga"
        message="Laporan dan file dari vendor ini akan dihapus permanen. Lanjutkan?"
        confirmText="Ya, Hapus"
        onConfirm={handleHapus}
        onCancel={() => setAkanDihapus(null)}
      />
    </div>
  );
}
