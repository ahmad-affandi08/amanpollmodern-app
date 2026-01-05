import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalibrationBadge from './CalibrationBadge';
import ConditionBadge from './ConditionBadge';
import ImagePreviewModal from '../../../../components/ImagePreviewModal';

/**
 * InventarisCard Component
 * Displays individual inventaris item with image, details, and badges
 */
export default function InventarisCard({ item }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (item) => {
    return item.img_alat_url || '/assets/img/no_image.png';
  };

  const handleDetailClick = () => {
    navigate(`/mobile/inventaris/${item.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-[16px] p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex gap-3">
          {/* Image */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleImageClick}>
            <img
              src={getImageUrl(item)}
              alt={item.nama_alat?.nama_nama_alat || 'Alat'}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200 bg-gray-100"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-dark line-clamp-2 mb-1">
              {item.nama_alat?.nama_nama_alat || 'N/A'}
            </h3>
            <p className="text-xs text-gray-600 mb-0.5">{item.merk || '-'}</p>
            <p className="text-xs text-gray-500">{item.no_inventaris || '-'}</p>
          </div>

          {/* Badges & Action */}
          <div className="flex flex-col items-end gap-1.5 min-w-[110px]">
            <ConditionBadge condition={item.kondisi_alat} />
            <CalibrationBadge item={item} />
            <button
              onClick={handleDetailClick}
              className="w-full px-3 py-1.5 bg-gradient-to-br from-brand-primary to-brand-primary-light text-white text-xs font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Detail
            </button>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={getImageUrl(item)}
        altText={item.nama_alat?.nama_nama_alat || 'Alat'}
      />
    </>
  );
}
