import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Smartphone, Calendar, FileText, Zap } from 'lucide-react';
import Button from '../../../../components/Button';
import noImage from '../../../../assets/img/no_image.png';

export default function AlatBaruDetailModal({ isOpen, onClose, data, onApprove }) {
  if (!isOpen || !data) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-text-dark">Detail Pengajuan Alat</h3>
          <button
            onClick={onClose}
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
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 relative group">
                <img
                  src={data.img_alat_baru_url || noImage}
                  alt={data.nama_alat?.nama_nama_alat}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = noImage;
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 space-y-3">
              <div>
                <h4 className="text-lg font-bold text-text-dark mb-1">
                  {data.nama_alat?.nama_nama_alat || '-'}
                </h4>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-primary/10 text-brand-primary">
                  {data.ruangan?.nama_ruangan || '-'}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <DetailItem
                  icon={<Smartphone size={16} />}
                  label="Merk / Model"
                  value={`${data.merk || '-'} / ${data.model || '-'}`}
                />
                <DetailItem
                  icon={<FileText size={16} />}
                  label="No. Seri"
                  value={data.seri || '-'}
                />
                <DetailItem
                  icon={<Zap size={16} />}
                  label="Daya"
                  value={data.daya ? `${data.daya} Watt` : '-'}
                />
                <DetailItem
                  icon={<Calendar size={16} />}
                  label="Tanggal Pengajuan"
                  value={
                    data.create_date
                      ? new Date(data.create_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                      : '-'
                  }
                />
              </div>
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

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0 text-gray-400">{icon}</div>
      <div>
        <p className="text-[10px] text-text-gray">{label}</p>
        <p className="text-xs font-medium text-text-dark">{value}</p>
      </div>
    </div>
  );
}
