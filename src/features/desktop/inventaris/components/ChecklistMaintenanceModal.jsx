import React, { useState, useEffect } from 'react';
import { refreshAllData } from '../../../../lib/queryClient';
import ReactDOM from 'react-dom';
import { X, Plus, CheckCircle } from 'lucide-react';
import KategoriChecklistApi from '../../../../api/KategoriChecklistApi';
import ChecklistMaintenanceApi from '../../../../api/ChecklistMaintenanceApi';
import ConfirmDialog from '../../../../components/Alert/Alert';
import { useToast } from '../../../../hooks';

// Respons daftar dan respons tambah sama-sama berasal dari ChecklistMaintenanceResource
// (`kategori_checklist_id`). Nama kolom database ikut dibaca sebagai cadangan.
const getItemCategoryId = (item) =>
  Number(item.kategori_checklist_id ?? item.kategori_checklist_maintenance_id);

export default function ChecklistMaintenanceModal({ isOpen, onClose, toolData }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toolId = toolData?.id;

  useEffect(() => {
    if (!isOpen || !toolId) {
      setCategories([]);
      setChecklists([]);
      setNewItemText('');
      setActiveTab(null);
      setDeleteTarget(null);
      return undefined;
    }

    let cancelled = false;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [cats, items] = await Promise.all([
          KategoriChecklistApi.getAll(),
          ChecklistMaintenanceApi.getByNamaAlat(toolId),
        ]);
        if (cancelled) return;

        const categoryList = Array.isArray(cats) ? cats : [];
        setCategories(categoryList);
        setActiveTab(categoryList.length > 0 ? categoryList[0].id_kategori_checklist_maintenance : null);
        setChecklists(Array.isArray(items) ? items : []);
      } catch (error) {
        if (cancelled) return;
        console.error('Gagal memuat data checklist', error);
        showToast('Gagal memuat data checklist', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, toolId, showToast]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const keterangan = newItemText.trim();
    if (!keterangan || !activeTab || submitting) return;

    setSubmitting(true);
    try {
      const response = await ChecklistMaintenanceApi.create({
        nama_alat_id: toolId,
        kategori_checklist_maintenance_id: activeTab,
        keterangan,
      });
      await refreshAllData();

      // Pastikan item baru selalu muncul di tab tempat ia ditambahkan.
      const created = {
        ...response.data,
        kategori_checklist_id: response.data?.kategori_checklist_id ?? activeTab,
      };
      setChecklists((prev) => [...prev, created]);
      setNewItemText('');
      showToast('Item berhasil ditambahkan', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Gagal menambahkan item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await ChecklistMaintenanceApi.delete(deleteTarget.id);
      await refreshAllData();
      setChecklists((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast('Item berhasil dihapus', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Gagal menghapus item', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredItems = checklists.filter((item) => getItemCategoryId(item) === Number(activeTab));
  const activeCategory = categories.find((c) => c.id_kategori_checklist_maintenance === activeTab);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-text-dark text-left">Checklist Maintenance</h2>
            <p className="text-xs text-gray-500 mt-1">Atur poin pengecekan untuk <span className="font-semibold text-brand-primary">{toolData?.nama_nama_alat}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isActive = activeTab === cat.id_kategori_checklist_maintenance;
            return (
              <button
                key={cat.id_kategori_checklist_maintenance}
                type="button"
                onClick={() => setActiveTab(cat.id_kategori_checklist_maintenance)}
                className={`
                   px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                   ${isActive
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-105'
                    : 'bg-[#F4F5F9] text-gray-500 hover:bg-gray-200'
                  }
                 `}
              >
                {cat.display_kategori || cat.nama_kategori}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3] mb-4"></div>
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                  <CheckCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada item checklist</p>
                  <p className="text-xs text-gray-400">Tambahkan pertanyaan baru di bawah</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="group flex items-center justify-between p-3 bg-[#F0F9FA] rounded-xl border border-transparent hover:border-brand-primary/20 transition-all">
                    <span className="font-medium text-text-dark text-left text-sm">{item.keterangan}</span>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 shadow-sm"
                      title="Hapus item"
                      aria-label="Hapus item"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer / Add New */}
        <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              maxLength={500}
              className="flex-1 px-3 py-2 bg-bg-light rounded-xl border-none focus:ring-2 focus:ring-brand-primary/20 outline-none text-text-dark font-medium placeholder:text-gray-400 text-sm"
              placeholder={`Tambah checklist untuk ${activeCategory?.display_kategori || activeCategory?.nama_kategori || 'kategori ini'}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Tambah item"
              disabled={submitting || loading || !newItemText.trim()}
              className="bg-brand-primary hover:bg-brand-primary-light text-white px-3 py-2 rounded-xl font-bold shadow-lg shadow-brand-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center min-w-[40px]"
            >
              {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <Plus size={20} />}
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Item Checklist"
        message={`Apakah Anda yakin ingin menghapus item "${deleteTarget?.keterangan ?? ''}"?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>,
    document.body
  );
}
