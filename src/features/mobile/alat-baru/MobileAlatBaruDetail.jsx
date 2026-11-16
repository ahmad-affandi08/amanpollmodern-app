import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import { useAlatBaruDetail, useDeleteAlatBaru, useToast, usePageTitle } from '../../../hooks';
import { formatDate } from '../../../utils/format';
import ConfirmDialog from '../../../components/Alert/Alert';
import DetailSection from '../../../components/detail/DetailSection';
import { DetailRow } from '../../../components/detail/DetailField';

export default function MobileAlatBaruDetail() {
  usePageTitle('Detail Alat Baru');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data, isLoading, isError } = useAlatBaruDetail(id);
  const deleteMutation = useDeleteAlatBaru();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const alatBaru = data?.data?.data;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Alat baru berhasil dihapus', 'success');
      navigate('/mobile/alat-baru');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus alat baru', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-3">
        <div className="bg-white rounded-[20px] p-4 border border-gray-100 animate-pulse space-y-4">
          <div className="w-full h-64 bg-gray-200 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !alatBaru) {
    return (
      <div className="max-w-md mx-auto px-4 pt-3">
        <div className="bg-white rounded-[20px] p-6 text-center border border-gray-100">
          <Package className="mx-auto text-danger-500 mb-3" size={48} />
          <h3 className="text-lg font-bold text-text-dark mb-2">Data Tidak Ditemukan</h3>
          <p className="text-sm text-text-gray">Alat baru tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-24 space-y-4">
      <div className="flex items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/mobile/alat-baru')}
            aria-label="Kembali"
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-dark"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-extrabold text-text-dark">Detail Alat Baru</h1>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          aria-label="Hapus alat baru"
          className="w-10 h-10 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center hover:bg-danger-100 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <DetailSection>
        <div className="w-full h-56 mb-4 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative flex items-center justify-center text-[#B0B3C7]">
          <ImageIcon size={32} />
          {alatBaru.img_alat_baru_url && (
            <img
              src={alatBaru.img_alat_baru_url}
              alt={alatBaru.nama_alat?.nama_nama_alat}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>

        <dl>
          <DetailRow label="Nama alat" value={alatBaru.nama_alat?.nama_nama_alat} />
          <DetailRow label="Ruangan" value={alatBaru.ruangan?.nama_ruangan} />
          <DetailRow label="Merk" value={alatBaru.merk} />
          <DetailRow label="Model/Tipe" value={alatBaru.model} />
          <DetailRow label="No. seri" value={alatBaru.seri} />
          <DetailRow label="Daya" value={alatBaru.daya ? `${alatBaru.daya} Watt` : null} />
          <DetailRow label="Tanggal pengajuan" value={formatDate(alatBaru.create_date)} />
        </dl>
      </DetailSection>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Alat Baru"
        message="Apakah Anda yakin ingin menghapus alat baru ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
