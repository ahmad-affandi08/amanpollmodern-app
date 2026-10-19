import React, { useState, useEffect, useMemo } from 'react';
import { refreshAllData } from '../../../lib/queryClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, FileText } from 'lucide-react';
import InventarisApi from '../../../api/InventarisApi';
import NamaAlatApi from '../../../api/NamaAlatApi';
import RuanganApi from '../../../api/RuanganApi';
import DivisiApi from '../../../api/DivisiApi';
import { usePageTitle, useToast, useAuth } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';

// Kategori alat "Software" (id 23): tidak punya ruangan fisik, sama dengan aturan di backend.
const KATEGORI_SOFTWARE_ID = '23';

// Kolom opsional yang boleh dikosongkan. Saat mengubah data, nilai kosong harus tetap
// dikirim sebagai string kosong supaya server mengosongkannya (Laravel: '' -> null).
// Kolom wajib (ruangan_id, nama_alat_id, dst.) dan berkas tidak boleh dikirim kosong.
const CLEARABLE_FIELDS = [
  'daya',
  'kategori_alkes',
  'kondisi_alat',
  'interval_maintenance',
  'awal_kalibrasi',
  'kadaluwarsa',
];

// Field yang hanya dipakai di antarmuka (bukan kolom di backend).
// `kategori_alat_id` tetap dikirim karena aturan `required_unless:kategori_alat_id,23` di backend membacanya.
const UI_ONLY_FIELDS = ['perlu_kalibrasi'];

const LIST_PATH = '/inventaris/data';

const toNamaAlatOption = (item) => ({ value: item.id, label: item.nama_nama_alat });

export default function InventarisForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  usePageTitle(isEdit ? 'Edit Inventaris' : 'Tambah Inventaris');

  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  const userDivisiId = user?.divisi_id;

  // `loading` tetap true setelah sukses sampai halaman berpindah, supaya tombol Simpan
  // tidak bisa ditekan dua kali (data ganda).
  const [loading, setLoading] = useState(false);
  const [masterLoaded, setMasterLoaded] = useState(false);
  const [detailLoaded, setDetailLoaded] = useState(!isEdit);
  const dataLoading = !masterLoaded || !detailLoaded;

  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [namaAlatData, setNamaAlatData] = useState([]);

  const [formData, setFormData] = useState({
    nama_alat_id: '',
    ruang_sekarang: '',
    kategori_alat_id: '',
    ruangan_id: '',
    divisi_id: '',
    no_inventaris: '',
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

  // Ruang sekarang saat data dimuat: lokasi saat ini diubah lewat endpoint tersendiri.
  const [initialRuangSekarang, setInitialRuangSekarang] = useState('');

  const yearOptions = useMemo(() => {
    const endYear = new Date().getFullYear() + 5;
    const startYear = 2001;
    const years = [];

    for (let year = endYear; year >= startYear; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }

    return years;
  }, []);

  // Tahun pengadaan awal = tahun berjalan (hanya saat tambah data).
  useEffect(() => {
    if (!isEdit) {
      setFormData(prev => (
        prev.tahun_pengadaan ? prev : { ...prev, tahun_pengadaan: new Date().getFullYear().toString() }
      ));
    }
  }, [isEdit]);

  // Data master (nama alat, ruangan, divisi).
  useEffect(() => {
    let cancelled = false;

    const fetchMasterData = async () => {
      try {
        const [alatRes, roomRes, divRes] = await Promise.all([
          NamaAlatApi.getAll({ all: 1 }),
          RuanganApi.getAll(),
          DivisiApi.getAll()
        ]);
        if (cancelled) return;

        setNamaAlatData(Array.isArray(alatRes) ? alatRes : []);

        setRuanganOptions(Array.isArray(roomRes) ? roomRes.map(item => ({
          value: item.id_ruangan,
          label: item.nama_ruangan
        })) : []);

        setDivisiOptions(Array.isArray(divRes) ? divRes.map(item => ({
          value: item.id_divisi,
          label: item.nama_divisi
        })) : []);

        // Admin Divisi hanya boleh menambah inventaris untuk divisinya sendiri.
        if (!isEdit && isAdminDivisi && userDivisiId) {
          setFormData(prev => ({ ...prev, divisi_id: userDivisiId }));
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Gagal memuat data master', error);
        showToast('Gagal memuat data master', 'error');
      } finally {
        if (!cancelled) setMasterLoaded(true);
      }
    };

    fetchMasterData();

    return () => {
      cancelled = true;
    };
  }, [isEdit, isAdminDivisi, userDivisiId, showToast]);

  // Data inventaris yang diedit.
  useEffect(() => {
    if (!isEdit) return undefined;

    let cancelled = false;

    const fetchInventaris = async () => {
      try {
        const data = await InventarisApi.getById(id);
        if (cancelled) return;

        const ruangSekarang = data.ruangan_sekarang?.id_ruangan || data.ruangan?.id_ruangan || '';
        setInitialRuangSekarang(ruangSekarang);
        setFormData({
          nama_alat_id: data.nama_alat?.id || '',
          ruang_sekarang: ruangSekarang,
          kategori_alat_id: data.nama_alat?.kategori_alat_id || '',
          ruangan_id: data.ruangan?.id_ruangan || '',
          divisi_id: data.divisi?.id_divisi || data.nama_alat?.divisi?.id_divisi || '',
          merk: data.merk || '',
          model: data.model || '',
          seri: data.seri || '',
          daya: data.daya || '',
          no_inventaris: data.no_inventaris || '',
          harga: data.harga ?? '',
          tahun_pengadaan: data.tahun_pengadaan || '',
          gedung: data.gedung || '',
          kondisi_alat: data.kondisi_alat || '',
          kategori_alkes: data.kategori_alkes || '',
          alat_kesehatan: !!data.alat_kesehatan,
          interval_maintenance: data.interval_maintenance ?? '',
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

        setDetailLoaded(true);
      } catch (error) {
        if (cancelled) return;
        console.error('Gagal memuat data inventaris', error);
        showToast('Gagal memuat data inventaris', 'error');
        // Form kosong pada mode edit berbahaya (bisa menimpa data), jadi kembali ke daftar.
        navigate(LIST_PATH, { replace: true });
      }
    };

    fetchInventaris();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate, showToast]);

  // Opsi nama alat mengikuti divisi terpilih. Nama alat yang sedang terpilih selalu ikut
  // ditampilkan supaya label tidak hilang pada data lama yang divisinya tidak cocok.
  const namaAlatOptions = useMemo(() => {
    const selectedId = String(formData.nama_alat_id);
    return namaAlatData
      .filter(item => (
        !formData.divisi_id
        || String(item.divisi_id) === String(formData.divisi_id)
        || String(item.id) === selectedId
      ))
      .map(toNamaAlatOption);
  }, [namaAlatData, formData.divisi_id, formData.nama_alat_id]);

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
    } else if (name === 'divisi_id') {
      // Mengganti divisi mengosongkan nama alat; select nama alat terbuka lagi untuk dipilih ulang.
      setFormData(prev => ({ ...prev, divisi_id: value, nama_alat_id: '', kategori_alat_id: '' }));
    } else if (name === 'nama_alat_id') {
      const selectedAlat = namaAlatData.find(item => String(item.id) === String(value));
      setFormData(prev => ({
        ...prev,
        nama_alat_id: value,
        kategori_alat_id: selectedAlat?.kategori_alat_id ?? ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isSoftware = String(formData.kategori_alat_id) === KATEGORI_SOFTWARE_ID;

  // Pratinjau nomor inventaris (hanya saat tambah data).
  useEffect(() => {
    const hasRoom = formData.ruangan_id;
    if (isEdit || !formData.nama_alat_id || !formData.tahun_pengadaan || !(isSoftware || hasRoom)) {
      return undefined;
    }

    let cancelled = false;

    const previewNoInventaris = async () => {
      try {
        const response = await InventarisApi.previewNoInventaris({
          nama_alat_id: formData.nama_alat_id,
          ruangan_id: isSoftware ? '' : formData.ruangan_id,
          tahun_pengadaan: formData.tahun_pengadaan
        });

        if (!cancelled && response.status === 'success' && response.data.no_inventaris) {
          setFormData(prev => ({ ...prev, no_inventaris: response.data.no_inventaris }));
        }
      } catch (error) {
        console.error('Gagal membuat pratinjau nomor inventaris', error);
      }
    };

    previewNoInventaris();

    return () => {
      cancelled = true;
    };
  }, [formData.nama_alat_id, formData.ruangan_id, formData.tahun_pengadaan, isEdit, isSoftware]);

  const buildPayload = () => {
    const payload = new FormData();

    Object.keys(formData).forEach(key => {
      if (UI_ONLY_FIELDS.includes(key)) return;
      // Software tidak punya ruangan fisik.
      if (isSoftware && (key === 'ruangan_id' || key === 'ruang_sekarang')) return;

      let value = formData[key];

      if (value === null || value === undefined) return;

      // Kategori alkes hanya berlaku bila alat termasuk alat kesehatan.
      if (key === 'kategori_alkes' && !formData.alat_kesehatan) {
        value = '';
      }

      if (value === '') {
        // Mode edit: kirim string kosong agar kolom opsional benar-benar dikosongkan.
        if (isEdit && CLEARABLE_FIELDS.includes(key)) {
          payload.append(key, '');
        }
        return;
      }

      if (typeof value === 'boolean') {
        payload.append(key, value ? '1' : '0');
      } else {
        payload.append(key, value);
      }
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const payload = buildPayload();

      if (isEdit) {
        await InventarisApi.update(id, payload);

        // Letak saat ini tidak ikut disimpan oleh endpoint ubah data, jadi dikirim terpisah.
        const locationChanged = !isSoftware
          && formData.ruang_sekarang
          && String(formData.ruang_sekarang) !== String(initialRuangSekarang);
        if (locationChanged) {
          try {
            await InventarisApi.updateLocation(id, formData.ruang_sekarang);
          } catch (locationError) {
            console.error('Gagal memperbarui letak saat ini', locationError);
            showToast('Data diperbarui, tetapi letak saat ini gagal diperbarui', 'warning');
            await refreshAllData();
            navigate(LIST_PATH);
            return;
          }
        }

        await refreshAllData();
        showToast('Data berhasil diperbarui', 'success');
      } else {
        await InventarisApi.create(payload);
        await refreshAllData();
        showToast('Data berhasil ditambahkan', 'success');
      }

      // Tombol Simpan sengaja tetap nonaktif; halaman langsung berpindah.
      navigate(LIST_PATH);
    } catch (error) {
      console.error('Gagal menyimpan inventaris', error);
      const msg = error.response?.data?.message || 'Gagal menyimpan data';
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        showToast(`${msg}: ${errorMessages}`, 'error');
      } else {
        showToast(msg, 'error');
      }
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
        <Button variant="ghost" size="sm" onClick={() => navigate(LIST_PATH)} className="p-1.5">
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
                disabled={isAdminDivisi}
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
                disabled={!formData.divisi_id || (isEdit && !!formData.nama_alat_id)}
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
                placeholder="Dibuat otomatis"
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
                options={yearOptions}
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
                label="Interval Maintenance (kali/tahun)"
                name="interval_maintenance"
                type="number"
                min="0"
                step="1"
                size="sm"
                value={formData.interval_maintenance}
                onChange={handleChange}
                placeholder="Jumlah pemeliharaan per tahun (0 = tanpa jadwal)"
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
                    <img src={previews.img_alat} alt="Pratinjau foto alat" className="h-24 mx-auto object-contain mb-2 rounded" />
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
                        <input type="file" name="img_alat" id="img_alat" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleChange} accept=".jpg,.jpeg,.png" />
                        <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center justify-center h-full pointer-events-none">
                          <Upload className="h-6 w-6 text-brand-primary/60 mb-1" />
                          <span className="text-xs font-bold text-brand-primary">Dari Galeri</span>
                        </div>
                      </div>
                      <div className="relative hover:shadow-sm transition-shadow">
                        <input type="file" name="img_alat" id="img_alat_cam" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleChange} accept=".jpg,.jpeg,.png" capture="environment" />
                        <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center justify-center h-full pointer-events-none">
                          <svg className="h-6 w-6 text-brand-primary/60 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          <span className="text-xs font-bold text-brand-primary">Kamera</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-gray-600 block mb-1">Foto Alat</span>
                    <p className="text-[10px] text-gray-400">.jpg, .png (Maks 10MB)</p>
                  </div>
                )}
              </div>

              {formData.perlu_kalibrasi && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors animate-fade-in-down">
                  <input type="file" name="file_sertifikat" id="file_sertifikat" className="hidden" onChange={handleChange} accept=".pdf" />
                  <label htmlFor="file_sertifikat" className="cursor-pointer block">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="font-bold text-sm text-brand-primary">Upload Sertifikat</span>
                    <p className="text-[10px] text-gray-400 mt-1">.pdf (Maks 5MB)</p>

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
                  <p className="text-[10px] text-gray-400 mt-1">.pdf (Maks 5MB)</p>

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
            <Button variant="ghost" size="sm" onClick={() => navigate(LIST_PATH)} type="button">
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
