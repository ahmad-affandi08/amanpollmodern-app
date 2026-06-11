import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, FileText } from 'lucide-react';
import InventarisApi from '../../../api/InventarisApi';
import NamaAlatApi from '../../../api/NamaAlatApi';
import RuanganApi from '../../../api/RuanganApi';
import DivisiApi from '../../../api/DivisiApi';
import { usePageTitle, useToast } from '../../../hooks';
import useAuth from '../../../hooks/utils/useAuth';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';

export default function InventarisForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  usePageTitle(isEdit ? 'Edit Inventaris' : 'Tambah Inventaris');

  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);


  const [namaAlatOptions, setNamaAlatOptions] = useState([]);
  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);

  const [namaAlatData, setNamaAlatData] = useState([]);

  const [formData, setFormData] = useState({
    nama_alat_id: '',
    ruang_sekarang: '',
    kategori_alat_id: '',
    ruangan_id: '',
    divisi_id: '',
    merk: '',
    model: '',
    seri: '',
    daya: '',

    harga: '',
    tahun_pengadaan: '',
    gedung: '',
    kondisi_alat: '',
    kategori_alkes: '',
    alat_kesehatan: false,
    interval_maintenance: '',
    perlu_kalibrasi: false,
    awal_kalibrasi: '',
    kadaluwarsa: '',
    img_alat: null,
    file_sertifikat: null,
    file_sop: null
  });

  const [previews, setPreviews] = useState({
    img_alat: null
  });

  const [existingFiles, setExistingFiles] = useState({
    file_sertifikat: null,
    file_sop: null
  });


  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2001;
    const endYear = currentYear + 5;
    const years = [];

    for (let year = endYear; year >= startYear; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }

    return years;
  };


  useEffect(() => {
    if (!isEdit && !formData.tahun_pengadaan) {
      setFormData(prev => ({ ...prev, tahun_pengadaan: new Date().getFullYear().toString() }));
    }
  }, [isEdit]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [alatRes, roomRes, divRes] = await Promise.all([
          NamaAlatApi.getAll(),
          RuanganApi.getAll(),
          DivisiApi.getAllRaw()
        ]);

        const rawAlat = Array.isArray(alatRes) ? alatRes : [];
        setNamaAlatData(rawAlat);


        setNamaAlatOptions(rawAlat.map(item => ({ value: item.id, label: item.nama_nama_alat })));


        const ruanganOpts = Array.isArray(roomRes) ? roomRes.map(item => ({
          value: item.id_ruangan,
          label: item.nama_ruangan
        })) : [];
        setRuanganOptions(ruanganOpts);


        const divisiOpts = Array.isArray(divRes) ? divRes.map(item => ({
          value: item.id_divisi,
          label: item.nama_divisi
        })) : [];
        setDivisiOptions(divisiOpts);


        if (!isEdit && user && Number(user.kategori_user_id) === 4 && user.divisi_id) {
          setFormData(prev => ({ ...prev, divisi_id: user.divisi_id }));


          const filteredAlat = rawAlat.filter(item => String(item.divisi_id) === String(user.divisi_id));
          setNamaAlatOptions(filteredAlat.map(item => ({ value: item.id, label: item.nama_nama_alat })));
        }

      } catch (error) {
        console.error("Failed to load master data", error);
        showToast('Gagal memuat data master', 'error');
      } finally {
        if (!isEdit) setDataLoading(false);
      }
    };

    if (user) {
      fetchMasterData();
    }
  }, [user]);


  useEffect(() => {
    if (!isEdit && user) {

    }
  }, [isEdit, user]);

  useEffect(() => {
    if (isEdit) {
      const fetchInventaris = async () => {
        try {
          const data = await InventarisApi.getById(id);
          setFormData({
            nama_alat_id: data.nama_alat?.id || '',
            ruang_sekarang: data.ruangan_sekarang?.id_ruangan || data.ruangan?.id_ruangan || '',
            kategori_alat_id: data.nama_alat?.kategori_alat_id || '',
            ruangan_id: data.ruangan?.id_ruangan || '',
            divisi_id: data.divisi?.id_divisi || data.nama_alat?.divisi?.id_divisi || '',
            merk: data.merk || '',
            model: data.model || '',
            seri: data.seri || '',
            daya: data.daya || '',
            no_inventaris: data.no_inventaris || '',
            harga: data.harga || '',
            tahun_pengadaan: data.tahun_pengadaan || '',
            gedung: data.gedung || '',
            kondisi_alat: data.kondisi_alat || '',
            kategori_alkes: data.kategori_alkes || '',
            alat_kesehatan: !!data.alat_kesehatan,
            interval_maintenance: data.interval_maintenance || '',
            perlu_kalibrasi: !!(data.awal_kalibrasi || data.kadaluwarsa || data.file_sertifikat_url),
            awal_kalibrasi: data.awal_kalibrasi || '',
            kadaluwarsa: data.kadaluwarsa || '',
            img_alat: null,
            file_sertifikat: null,
            file_sop: null
          });


          if (data.img_alat_url) {
            setPreviews(prev => ({ ...prev, img_alat: data.img_alat_url }));
          }

          setExistingFiles({
            file_sertifikat: data.file_sertifikat_url,
            file_sop: data.file_sop_url
          });




        } catch (error) {
          console.error("Failed to fetch inventaris", error);
          showToast('Gagal memuat data inventaris', 'error');
        } finally {
          setDataLoading(false);
        }
      };
      fetchInventaris();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));

      if (name === 'img_alat' && file) {
        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [name]: objectUrl }));
      }
    } else if (type === 'checkbox') {

      if (name === 'perlu_kalibrasi' && !checked) {

        setFormData(prev => ({
          ...prev,
          [name]: checked,
          awal_kalibrasi: '',
          kadaluwarsa: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));


      if (name === 'divisi_id') {

        const filteredAlat = value
          ? namaAlatData.filter(item => String(item.divisi_id) === String(value))
          : namaAlatData;

        setNamaAlatOptions(filteredAlat.map(item => ({ value: item.id, label: item.nama_nama_alat })));


        setFormData(prev => ({ ...prev, [name]: value, nama_alat_id: '', kategori_alat_id: '' }));
      }

      else if (name === 'nama_alat_id') {
        const selectedAlat = namaAlatData.find(item => String(item.id) === String(value));
        if (selectedAlat && selectedAlat.kategori_alat_id) {
          setFormData(prev => ({ ...prev, kategori_alat_id: selectedAlat.kategori_alat_id, [name]: value }));
        }
      }
    }
  };

  const isSoftware = String(formData.kategori_alat_id) === '23';


  useEffect(() => {
    const previewNoInventaris = async () => {
      const hasRoom = formData.ruangan_id;

      if (formData.nama_alat_id && formData.tahun_pengadaan && !isEdit && (isSoftware || hasRoom)) {
        try {
          const payload = {
            nama_alat_id: formData.nama_alat_id,
            ruangan_id: formData.ruangan_id,
            tahun_pengadaan: formData.tahun_pengadaan
          };

          const response = await InventarisApi.previewNoInventaris(payload);

          if (response.status === 'success' && response.data.no_inventaris) {
            setFormData(prev => ({ ...prev, no_inventaris: response.data.no_inventaris }));
          }
        } catch (error) {
          console.error('Failed to preview no_inventaris:', error);
          console.error('Error response:', error.response?.data);
        }
      }
    };

    previewNoInventaris();
  }, [formData.nama_alat_id, formData.ruangan_id, formData.tahun_pengadaan, isEdit, isSoftware]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key];


        if (value === null || value === undefined) {
          return;
        }


        if ((key === 'awal_kalibrasi' || key === 'kadaluwarsa') && value === '') {
          payload.append(key, '');
          return;
        }


        if (value === '') {
          return;
        }


        if (typeof value === 'boolean') {
          payload.append(key, value ? '1' : '0');
        } else {
          payload.append(key, value);
        }
      });

      if (isEdit) {
        await InventarisApi.update(id, payload);
        showToast('Data berhasil diperbarui', 'success');
      } else {
        await InventarisApi.create(payload);
        showToast('Data berhasil ditambahkan', 'success');
      }

      setTimeout(() => navigate('/inventaris/data'), 1500);

    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      const msg = error.response?.data?.message || 'Gagal menyimpan data';
      const errors = error.response?.data?.errors;
      if (errors) {
        console.error('Validation errors:', errors);
        const errorMessages = Object.values(errors).flat().join(', ');
        showToast(`${msg}: ${errorMessages}`, 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] space-y-8">
          {/* Section 1 Skeleton */}
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 Skeleton */}
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 Skeleton */}
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/inventaris/data')} className="p-1.5">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-text-dark">
            {isEdit ? 'Edit Data Alat' : 'Tambah Alat Baru'}
          </h1>
          <p className="text-gray-500 text-xs">Lengkapi data inventaris alat di bawah ini</p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Informasi Utama */}
          <div>
            <h3 className="text-base font-bold text-text-dark mb-3 border-b pb-1.5">Informasi Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="Divisi"
                name="divisi_id"
                size="sm"
                options={divisiOptions}
                value={formData.divisi_id}
                onChange={handleChange}
                placeholder="Pilih Divisi"
                searchPlaceholder="Cari divisi..."
                required
                disabled={Number(user?.kategori_user_id) === 4}
              />
              <SearchableSelect
                label="Nama Alat (Master)"
                name="nama_alat_id"
                size="sm"
                options={namaAlatOptions}
                value={formData.nama_alat_id}
                onChange={handleChange}
                placeholder="Pilih Nama Alat"
                searchPlaceholder="Cari nama alat..."
                required
                disabled={isEdit || !formData.divisi_id}
              />

              {!isSoftware && (
                <>
                  <SearchableSelect
                    label="Ruangan"
                    name="ruangan_id"
                    size="sm"
                    options={ruanganOptions}
                    value={formData.ruangan_id}
                    onChange={handleChange}
                    placeholder="Pilih Ruangan"
                    searchPlaceholder="Cari ruangan..."
                    required
                  />
                  <SearchableSelect
                    label="Ruang Sekarang"
                    name="ruang_sekarang"
                    size="sm"
                    options={ruanganOptions}
                    value={formData.ruang_sekarang}
                    onChange={handleChange}
                    placeholder="Pilih Ruangan"
                    searchPlaceholder="Cari ruangan..."
                    required
                  />
                </>
              )}

              <Input
                label="No Inventaris"
                name="no_inventaris"
                size="sm"
                value={formData.no_inventaris}
                onChange={handleChange}
                placeholder="Auto-generated"
                readOnly
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Gedung"
                name="gedung"
                size="sm"
                value={formData.gedung}
                onChange={handleChange}
                placeholder="Contoh: Gedung A"
                required
              />
            </div>
          </div>

          {/* Section 2: Detail Spesifikasi */}
          <div>
            <h3 className="text-base font-bold text-text-dark mb-3 border-b pb-1.5">Spesifikasi Alat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Merk"
                name="merk"
                size="sm"
                value={formData.merk}
                onChange={handleChange}
                required
              />
              <Input
                label="Tipe / Model"
                name="model"
                size="sm"
                value={formData.model}
                onChange={handleChange}
                required
              />
              <Input
                label="Nomor Seri (SN)"
                name="seri"
                size="sm"
                value={formData.seri}
                onChange={handleChange}
                required
              />
              <Input
                label="Daya (Watt/Volt)"
                name="daya"
                size="sm"
                value={formData.daya}
                onChange={handleChange}
              />
              <SearchableSelect
                label="Tahun Pengadaan"
                name="tahun_pengadaan"
                size="sm"
                value={formData.tahun_pengadaan}
                onChange={handleChange}
                options={generateYearOptions()}
                placeholder="Pilih Tahun"
                searchPlaceholder="Cari tahun..."
                required
              />
              <Input
                label="Harga Perolehan (Rp)"
                name="harga"
                size="sm"
                currency
                value={formData.harga}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Section 3: Status & Kondisi */}
          <div>
            <h3 className="text-base font-bold text-text-dark mb-3 border-b pb-1.5">Status & Kondisi</h3>

            {/* Logic Toggle Alat Kesehatan */}
            <div className="mb-4 flex items-center gap-2 bg-purple-50 p-3 rounded-xl border border-purple-100">
              <input
                type="checkbox"
                id="alat_kesehatan"
                name="alat_kesehatan"
                checked={formData.alat_kesehatan}
                onChange={handleChange}
                className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
              />
              <label htmlFor="alat_kesehatan" className="font-bold text-sm text-text-dark cursor-pointer selection:bg-none">
                Apakah termasuk alat kesehatan?
              </label>
            </div>

            {/* Checkbox Perlu Kalibrasi */}
            <div className="mb-4 flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="perlu_kalibrasi"
                name="perlu_kalibrasi"
                checked={formData.perlu_kalibrasi}
                onChange={handleChange}
                className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
              />
              <label htmlFor="perlu_kalibrasi" className="font-bold text-sm text-text-dark cursor-pointer selection:bg-none">
                Apakah alat perlu di kalibrasi?
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conditional Rendering Kategori Alkes */}
              {formData.alat_kesehatan && (
                <div className="animate-fade-in-down">
                  <SearchableSelect
                    label="Kategori Alat Kesehatan"
                    name="kategori_alkes"
                    size="sm"
                    value={formData.kategori_alkes}
                    onChange={handleChange}
                    options={[
                      { value: 'Sederhana', label: 'Sederhana' },
                      { value: 'Menengah', label: 'Menengah' },
                      { value: 'Canggih', label: 'Canggih' },
                    ]}
                    placeholder="Pilih Kategori Alat Kesehatan"
                    searchPlaceholder="Cari kategori..."
                    required
                  />
                </div>
              )}

              <SearchableSelect
                label="Kondisi Alat"
                name="kondisi_alat"
                size="sm"
                value={formData.kondisi_alat}
                onChange={handleChange}
                options={[
                  { value: 'Baik', label: 'Baik' },
                  { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                  { value: 'Rusak Berat', label: 'Rusak Berat' },
                  { value: 'Dalam Perbaikan', label: 'Dalam Perbaikan' },
                ]}
                placeholder="Pilih Kondisi Alat"
                searchPlaceholder="Cari kondisi..."
              />

              <Input
                label="Interval Maintenance (Tahun)"
                name="interval_maintenance"
                type="number"
                size="sm"
                value={formData.interval_maintenance}
                onChange={handleChange}
                placeholder="Masukkan Interval Maintenance"
                required
              />


              {formData.perlu_kalibrasi && (
                <>
                  <div className="animate-fade-in-down">
                    <Input
                      label="Awal Kalibrasi"
                      name="awal_kalibrasi"
                      type="date"
                      size="sm"
                      value={formData.awal_kalibrasi}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="animate-fade-in-down">
                    <Input
                      label="Kadaluwarsa"
                      name="kadaluwarsa"
                      type="date"
                      size="sm"
                      value={formData.kadaluwarsa}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 4: File Uploads */}
          <div>
            <h3 className="text-base font-bold text-text-dark mb-3 border-b pb-1.5">Berkas & Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                {previews.img_alat ? (
                  <div className="relative group">
                    <img src={previews.img_alat} alt="Preview" className="h-24 mx-auto object-contain mb-2 rounded" />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviews(prev => ({...prev, img_alat: null}));
                        setFormData(prev => ({...prev, img_alat: null}));
                      }} 
                      className="absolute top-0 right-1/4 translate-x-4 -translate-y-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                    >
                      ×
                    </button>
                    {formData.img_alat && typeof formData.img_alat === 'object' && (
                      <p className="text-xs text-green-600 mt-2 font-medium">{formData.img_alat.name}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="relative hover:shadow-sm transition-shadow">
                        <input type="file" name="img_alat" id="img_alat" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleChange} accept="image/*" />
                        <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center justify-center h-full pointer-events-none">
                          <Upload className="h-6 w-6 text-brand-primary/60 mb-1" />
                          <span className="text-xs font-bold text-brand-primary">Dari Galeri</span>
                        </div>
                      </div>
                      <div className="relative hover:shadow-sm transition-shadow">
                        <input type="file" name="img_alat" id="img_alat_cam" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleChange} accept="image/*" capture="environment" />
                        <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center justify-center h-full pointer-events-none">
                          <svg className="h-6 w-6 text-brand-primary/60 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          <span className="text-xs font-bold text-brand-primary">Kamera</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-gray-600 block mb-1">Foto Alat</span>
                    <p className="text-[10px] text-gray-400">.jpg, .png (Max 2MB)</p>
                  </div>
                )}
              </div>

              {formData.perlu_kalibrasi && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors animate-fade-in-down">
                  <input type="file" name="file_sertifikat" id="file_sertifikat" className="hidden" onChange={handleChange} accept=".pdf" />
                  <label htmlFor="file_sertifikat" className="cursor-pointer block">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="font-bold text-sm text-brand-primary">Upload Sertifikat</span>
                    <p className="text-[10px] text-gray-400 mt-1">.pdf (Max 5MB)</p>

                    {/* Show new file name */}
                    {formData.file_sertifikat && (
                      <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 py-1 px-2 rounded-lg inline-block">
                        {formData.file_sertifikat.name}
                      </p>
                    )}

                    {/* Show existing file if no new file selected */}
                    {!formData.file_sertifikat && existingFiles.file_sertifikat && (
                      <div className="mt-2 text-sm">
                        <p className="text-blue-600 font-medium mb-1">File saat ini tersimpan</p>
                        <a
                          href={existingFiles.file_sertifikat}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-brand-primary underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Lihat Sertifikat
                        </a>
                      </div>
                    )}
                  </label>
                </div>
              )}

              <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <input type="file" name="file_sop" id="file_sop" className="hidden" onChange={handleChange} accept=".pdf" />
                <label htmlFor="file_sop" className="cursor-pointer block">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <span className="font-bold text-sm text-brand-primary">Upload Manual Book / SOP</span>
                  <p className="text-[10px] text-gray-400 mt-1">.pdf (Max 5MB)</p>

                  {/* Show new file name */}
                  {formData.file_sop && (
                    <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 py-1 px-2 rounded-lg inline-block">
                      {formData.file_sop.name}
                    </p>
                  )}

                  {/* Show existing file if no new file selected */}
                  {!formData.file_sop && existingFiles.file_sop && (
                    <div className="mt-2 text-sm">
                      <p className="text-blue-600 font-medium mb-1">File saat ini tersimpan</p>
                      <a
                        href={existingFiles.file_sop}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-brand-primary underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lihat SOP
                      </a>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventaris/data')} type="button">
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading} className="px-6 shadow-xl shadow-brand-primary/20">
              <Save size={16} className="mr-2" />
              {isEdit ? 'Simpan Perubahan' : 'Simpan Data'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
