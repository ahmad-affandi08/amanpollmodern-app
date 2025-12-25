import React from 'react';
import { ChevronRight } from 'lucide-react';
import noImage from '../../../../assets/img/no_image.png';

export default function AlatBaruCard({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-100">
          <img
            src={data.img_alat_baru_url || noImage}
            alt={data.nama_alat?.nama_nama_alat || 'Alat'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = noImage;
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-dark text-sm truncate">
            {data.nama_alat?.nama_nama_alat || '-'}
          </h3>
          <p className="text-xs text-text-gray mt-0.5">{data.merk || '-'}</p>
          <p className="text-xs text-text-gray">Model: {data.model || '-'}</p>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="text-gray-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all flex-shrink-0"
          size={20}
        />
      </div>
    </div>
  );
}
