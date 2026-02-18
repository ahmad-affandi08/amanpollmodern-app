import React, { useState } from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export default function ExportAduanModal({ isOpen, onClose }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Pilih tanggal mulai dan tanggal akhir');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    setLoading(true);


    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });


    window.open(`/api/report/aduan/export-excel-teknisi?${params.toString()}`, '_blank');


    setTimeout(() => {
      setLoading(false);
      setStartDate('');
      setEndDate('');
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Laporan Aduan">
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Export akan menampilkan semua aduan yang Anda tangani dalam rentang tanggal yang dipilih.
          </p>
        </div>

        <Input
          type="date"
          label="Dari Tanggal"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <Input
          type="date"
          label="Sampai Tanggal"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          required
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            loading={loading}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
