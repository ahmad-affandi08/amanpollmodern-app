import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import Button from '../../../components/Button';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import PemeliharaanApi from '../../../api/PemeliharaanApi';

export default function DetailReportPemeliharaan() {
  usePageTitle('Laporan Detail Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await PemeliharaanApi.getById(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat detail pemeliharaan');
      showToast('Gagal memuat detail data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 font-medium">{error || 'Data tidak ditemukan'}</div>
        <Button onClick={() => navigate(-1)} variant="outline">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Detail Pemeliharaan</h1>
            <p className="text-gray-500 text-sm mt-1">
              ID: RM-{String(data.id_pemeliharaan).padStart(5, '0')} • {formatDate(data.jadwal_pemeliharaan)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-semibold ${data.status === 'Selesai'
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-yellow-50 border-yellow-100 text-yellow-700'
            }`}>
            {data.status === 'Selesai' ? <CheckCircle size={18} /> : <Clock size={18} />}
            {data.status}
          </div>
          <Button variant="outline" className="gap-2" onClick={() => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            window.open(`${apiUrl}/report/pemeliharaan/export/${id}`, '_blank');
          }}>
            <FileText size={18} />
            Export Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Informasi Alat & Jadwal */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-brand-primary" size={20} />
              Informasi Aset
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Alat</label>
                <div className="text-base font-semibold text-gray-800 mt-1">{data.nama_alat_nama}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Inventaris</label>
                  <div className="text-sm font-medium text-gray-700 mt-1 font-mono">{data.no_inventaris}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Merk</label>
                  <div className="text-sm font-medium text-gray-700 mt-1">{data.merk}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruangan</label>
                  <div className="text-sm font-medium text-gray-700 mt-1">{data.ruangan_nama}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Divisi</label>
                  <div className="text-sm font-medium text-gray-700 mt-1">{data.divisi_nama}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-brand-primary" size={20} />
              Jadwal & Pelaksanaan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jadwal Pemeliharaan</label>
                <div className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(data.jadwal_pemeliharaan)}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Pemeriksaan</label>
                <div className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {data.tanggal_pemeriksaan ? formatDate(data.tanggal_pemeriksaan) : 'Belum Dilakukan'}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teknisi Pelaksana</label>
                <div className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  {data.teknisi_nama}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Hasil & Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-brand-primary" size={20} />
              Hasil Pemeriksaan
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi Akhir Alat</label>
                <div className={`w-full px-4 py-3 border rounded-xl font-medium flex items-center gap-3 ${data.kondisi_alat === 'Baik' ? 'bg-green-50 border-green-100 text-green-700' :
                  data.kondisi_alat === 'Rusak Ringan' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                    data.kondisi_alat === 'Rusak Berat' ? 'bg-red-50 border-red-100 text-red-700' :
                      'bg-gray-50 border-gray-100 text-gray-600'
                  }`}>
                  {data.kondisi_alat === 'Baik' && <CheckCircle size={20} />}
                  {(data.kondisi_alat === 'Rusak Ringan' || data.kondisi_alat === 'Rusak Berat') && <AlertTriangle size={20} />}
                  {data.kondisi_alat === 'Dalam Perbaikan' && <Clock size={20} />}
                  {!data.kondisi_alat && <HelpCircle size={20} />}

                  {data.kondisi_alat || 'Belum Ditentukan'}
                </div>
              </div>

              {/* TODO: Add Checklist Result here if avail */}

              <div className="pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="h-24 flex items-end justify-center mb-2">
                      {data.ttd_teknisi ? (
                        <img src={data.ttd_teknisi} alt="TTD Teknisi" className="max-h-20 object-contain" />
                      ) : (
                        <div className="text-gray-300 italic text-sm">Belum ada TTD</div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-800 border-t pt-2 border-gray-200">
                      {data.teknisi_nama}
                    </div>
                    <div className="text-xs text-gray-500">Teknisi</div>
                  </div>
                  <div>
                    <div className="h-24 flex items-end justify-center mb-2">
                      {data.ttd_kepala_ruang ? (
                        <img src={data.ttd_kepala_ruang} alt="TTD KaRu" className="max-h-20 object-contain" />
                      ) : (
                        <div className="text-gray-300 italic text-sm">Belum ada TTD</div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-800 border-t pt-2 border-gray-200">
                      {data.nama_kepala_ruangan || 'Kepala Ruangan'}
                    </div>
                    <div className="text-xs text-gray-500">Mengetahui</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
