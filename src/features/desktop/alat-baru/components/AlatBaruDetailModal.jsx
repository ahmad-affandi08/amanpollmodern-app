import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Button from '../../../../components/Button';
import DetailField from '../../../../components/detail/DetailField';
import { formatDate } from '../../../../utils/format';

export default function AlatBaruDetailModal({ isOpen, onClose, data, onApprove }) {
  if (!isOpen || !data) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-text-dark">Detail Pengajuan Alat</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image */}
            <div className="w-full md:w-1/2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative flex items-center justify-center text-[#B0B3C7]">
                <ImageIcon size={32} />
                {data.img_alat_baru_url && (
                  <img
                    src={data.img_alat_baru_url}
                    alt={data.nama_alat?.nama_nama_alat || 'Foto alat'}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 space-y-3">
              <div>
                <h4 className="text-lg font-extrabold text-text-dark mb-1.5">
                  {data.nama_alat?.nama_nama_alat || '-'}
                </h4>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                  {data.ruangan?.nama_ruangan || '-'}
                </div>
              </div>

              <dl className="space-y-3 pt-2">
                <DetailField label="Merk / model" value={`${data.merk || '-'} / ${data.model || '-'}`} />
                <DetailField label="No. seri" value={data.seri} />
                <DetailField label="Daya" value={data.daya ? `${data.daya} Watt` : null} />
                <DetailField label="Tanggal pengajuan" value={formatDate(data.create_date)} />
              </dl>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          <Button
            size="sm"
            className="bg-brand-primary text-white hover:bg-brand-primary-dark"
            onClick={() => onApprove(data)}
          >
            <CheckCircle size={16} className="mr-2" />
            Setujui & Masukkan Inventaris
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
