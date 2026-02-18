import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Package } from 'lucide-react';
import { useAlatBaruDetail, useDeleteAlatBaru } from '../../../hooks/queries/useAlatBaruQueries';
import { useToast } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import ConfirmDialog from '../../../components/Alert/Alert';
import noImage from '../../../assets/img/no_image.png';

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
    <div className="max-w-md mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mobile/alat-baru')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-text-dark" />
          </button>
          <h1 className="text-xl font-bold text-text-dark">Detail Alat Baru</h1>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 bg-danger-50 text-danger-500 rounded-full hover:bg-danger-100 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[20px] p-4 border border-gray-100 space-y-4 mt-4">
        {/* Image */}
        <div className="w-full h-64 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
          <img
            src={alatBaru.img_alat_baru_url || noImage}
            alt={alatBaru.nama_alat?.nama_nama_alat}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = noImage;
            }}
          />
        </div>

        {/* Details */}
        <div className="space-y-3">
          <DetailRow label="Nama Alat" value={alatBaru.nama_alat?.nama_nama_alat || '-'} />
          <DetailRow label="Ruangan" value={alatBaru.ruangan?.nama_ruangan || '-'} />
          <DetailRow label="Merk" value={alatBaru.merk || '-'} />
          <DetailRow label="Model/Tipe" value={alatBaru.model || '-'} />
          <DetailRow label="No. Seri" value={alatBaru.seri || '-'} />
          <DetailRow label="Daya" value={alatBaru.daya ? `${alatBaru.daya} Watt` : '-'} />
          <DetailRow
            label="Tanggal Pengajuan"
            value={
              alatBaru.create_date
                ? new Date(alatBaru.create_date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
                : '-'
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Alat Baru"
        message="Apakah Anda yakin ingin menghapus alat baru ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="error"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-text-gray font-medium">{label}</span>
      <span className="text-sm text-text-dark font-semibold text-right">{value}</span>
    </div>
  );
}
