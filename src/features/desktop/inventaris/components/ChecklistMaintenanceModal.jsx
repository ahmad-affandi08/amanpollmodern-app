import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import KategoriChecklistApi from '../../../../api/KategoriChecklistApi';
import ChecklistMaintenanceApi from '../../../../api/ChecklistMaintenanceApi';
import { Toast } from '../../../../components/Alert/Alert';

export default function ChecklistMaintenanceModal({ isOpen, onClose, toolData }) {
  const [activeTab, setActiveTab] = useState(null); // Will be set to first category id
  const [categories, setCategories] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && toolData) {
      fetchInitialData();
    } else {
      // Reset state on close
      setCategories([]);
      setChecklists([]);
      setNewItemText('');
      setToast(null);
    }
  }, [isOpen, toolData]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const cats = await KategoriChecklistApi.getAll();
      setCategories(cats);
      if (cats.length > 0) {
        setActiveTab(cats[0].id_kategori_checklist_maintenance);
      }

      // Fetch Checklists for this tool
      const items = await ChecklistMaintenanceApi.getByNamaAlat(toolData.id);
      setChecklists(items);
    } catch (error) {
      console.error('Failed to load checklist data', error);
      setToast({ type: 'error', message: 'Gagal memuat data checklist' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !activeTab) return;

    setSubmitting(true);
    try {
      const newItem = await ChecklistMaintenanceApi.create({
        nama_alat_id: toolData.id,
        kategori_checklist_maintenance_id: activeTab,
        keterangan: newItemText
      });

      // Update local state
      setChecklists([...checklists, newItem.data]);
      setNewItemText('');
      setToast({ type: 'success', message: 'Item berhasil ditambahkan' });

      // Clear toast after 2s
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Gagal menambahkan item' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await ChecklistMaintenanceApi.delete(id);
      setChecklists(checklists.filter(item => item.id !== id));
      setToast({ type: 'success', message: 'Item berhasil dihapus' });
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      setToast({ type: 'error', message: 'Gagal menghapus item' });
    }
  };

  const filteredItems = checklists.filter(item => item.kategori_checklist_id === activeTab);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]">

        {/* Toast Notification inside Modal */}
        {toast && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-max">
            <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-text-dark text-left">Checklist Maintenance</h2>
            <p className="text-sm text-gray-500 mt-1">Atur poin pengecekan untuk <span className="font-semibold text-brand-primary">{toolData?.nama_nama_alat}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isActive = activeTab === cat.id_kategori_checklist_maintenance;
            return (
              <button
                key={cat.id_kategori_checklist_maintenance}
                onClick={() => setActiveTab(cat.id_kategori_checklist_maintenance)}
                className={`
                   px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
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
        <div className="p-6 flex-1 overflow-y-auto">
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
                  <div key={item.id} className="group flex items-center justify-between p-4 bg-[#F0F9FA] rounded-xl border border-transparent hover:border-brand-primary/20 transition-all">
                    <span className="font-medium text-text-dark text-left">{item.keterangan}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 shadow-sm"
                      title="Hapus item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer / Add New */}
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-bg-light rounded-xl border-none focus:ring-2 focus:ring-brand-primary/20 outline-none text-text-dark font-medium placeholder:text-gray-400"
              placeholder={`Tambah checklist untuk ${categories.find(c => c.id_kategori_checklist_maintenance === activeTab)?.display_kategori || 'kategori ini'}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting || !newItemText.trim()}
              className="bg-brand-primary hover:bg-brand-primary-light text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-brand-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center min-w-[50px]"
            >
              {submitting ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" /> : <Plus size={24} />}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
