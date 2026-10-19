import React, { useState } from 'react';
import { Award, Calendar, Building2, Download, Plus, Trash2, User } from 'lucide-react';
import Button from './Button';
import KalibrasiModal from './KalibrasiModal';
import ConfirmDialog from './Alert/Alert';
import { useToast } from './Alert/useToast';
import { useDeleteKalibrasi } from '../hooks/queries/useInventarisQueries';
import { formatDate } from '../utils/format';
import { getKalibrasiStatus } from '../utils/kalibrasi';

/**
 * Daftar riwayat kalibrasi sebuah alat (terbaru di atas) beserta aksi
 * tambah / hapus bagi pengguna yang berhak.
 */
export default function KalibrasiHistoryList({ inventarisId, items = [], canManage = false, onChanged }) {
  const { showToast } = useToast();
  const deleteKalibrasi = useDeleteKalibrasi();
  const [isModalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteKalibrasi.mutateAsync({ id: inventarisId, historyId: toDelete.id });
      showToast('Riwayat kalibrasi berhasil dihapus', 'success');
      onChanged?.();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus riwayat kalibrasi', 'error');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          {items.length > 0 ? `${items.length} riwayat kalibrasi` : 'Belum ada kalibrasi tercatat'}
        </p>
        {canManage && (
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus size={14} />
            Tambah Kalibrasi
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[20px] p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">Belum ada riwayat kalibrasi untuk alat ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item, index) => {
            const isLatest = index === 0;
            const status = getKalibrasiStatus(item.kadaluwarsa);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] ${isLatest ? 'ring-1 ring-brand-primary/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-3 pb-3 border-b gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tanggal Kalibrasi</p>
                    <p className="text-base font-bold text-brand-primary">{formatDate(item.tanggal_kalibrasi)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isLatest && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase bg-brand-primary/10 text-brand-primary">
                        Terbaru
                      </span>
                    )}
                    {isLatest && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${status.className}`}>
                        {status.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                      <Calendar size={11} /> Berlaku Hingga
                    </p>
                    <p className="text-xs font-semibold text-text-dark">{formatDate(item.kadaluwarsa)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                      <Building2 size={11} /> Lembaga / Vendor
                    </p>
                    <p className="text-xs font-semibold text-text-dark">{item.lembaga_kalibrasi || '-'}</p>
                  </div>
                </div>

                {item.keterangan && (
                  <p className="text-xs text-text-dark leading-relaxed bg-gray-50 p-2.5 rounded-lg mb-3">
                    {item.keterangan}
                  </p>
                )}

                {item.file_sertifikat_url && (
                  <a
                    href={item.file_sertifikat_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors mb-3"
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award size={18} className="text-blue-600" />
                    </div>
                    <p className="flex-1 font-medium text-text-dark text-sm">Lihat Sertifikat</p>
                    <Download size={16} className="text-gray-400" />
                  </a>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <User size={11} />
                    {item.dibuat_oleh ? `Dicatat oleh ${item.dibuat_oleh}` : 'Dicatat sistem'}
                    {item.created_at && ` · ${formatDate(item.created_at)}`}
                  </p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Hapus riwayat kalibrasi"
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

      <KalibrasiModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        inventarisId={inventarisId}
        onSuccess={onChanged}
      />

      <ConfirmDialog
        isOpen={!!toDelete}
        type="danger"
        title="Hapus Riwayat Kalibrasi"
        message={
          toDelete?.id === items[0]?.id
            ? 'Ini adalah kalibrasi terbaru. Jika dihapus, kalibrasi aktif alat akan kembali ke riwayat sebelumnya. Lanjutkan?'
            : 'Riwayat kalibrasi ini akan dihapus permanen. Lanjutkan?'
        }
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
