import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, ArrowLeft, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { getRecycleBin, restoreContentItem, deleteContentItem } from '../../utils/storage';
import './Dashboard.css';

export default function RecycleBin() {
  const navigate = useNavigate();
  const [deletedItems, setDeletedItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    setDeletedItems(getRecycleBin());
  }, []);

  const toggleSelection = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === deletedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deletedItems.map(i => i.id)));
    }
  };

  const handleRestoreSelected = () => {
    selectedIds.forEach(id => restoreContentItem(id));
    setDeletedItems(getRecycleBin());
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} item(s)? This cannot be undone.`)) {
      selectedIds.forEach(id => deleteContentItem(id));
      setDeletedItems(getRecycleBin());
      setSelectedIds(new Set());
    }
  };

  const handleEmptyBin = () => {
    if (window.confirm('Permanently delete ALL items in the Recycle Bin? This cannot be undone.')) {
      deletedItems.forEach(item => deleteContentItem(item.id));
      setDeletedItems(getRecycleBin());
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '40px' }}
        >
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--w50)', cursor: 'pointer', marginBottom: '16px', fontFamily: 'var(--font-body)' }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trash2 size={28} style={{ color: 'var(--accent-red)' }} />
              Recycle Bin
            </h1>
            <p style={{ marginTop: '8px' }}>Items here can be restored or permanently deleted.</p>
          </div>

          {deletedItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleEmptyBin}
              style={{ borderColor: 'rgba(248, 113, 113, 0.3)', color: 'var(--accent-red)' }}
            >
              <AlertTriangle size={16} /> Empty Bin
            </Button>
          )}
        </motion.div>

        {deletedItems.length === 0 ? (
          <div className="no-content-msg glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Trash2 size={48} style={{ color: 'var(--w20)', margin: '0 auto 16px' }} />
            <p>Your Recycle Bin is empty.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass"
            style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}
          >
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={toggleAll}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: 'var(--w70)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                {selectedIds.size === deletedItems.length ? <CheckSquare size={18} className="gradient-text" /> : <Square size={18} />}
                <span>Select All ({selectedIds.size}/{deletedItems.length})</span>
              </button>

              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{ display: 'flex', gap: '12px' }}
                  >
                    <button
                      onClick={handleRestoreSelected}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '6px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(248, 113, 113, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '6px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={14} /> Delete Forever
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* List */}
            <div style={{ padding: '8px' }}>
              {deletedItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    background: selectedIds.has(item.id) ? 'var(--bg-hover)' : 'transparent',
                    transition: 'all var(--t-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedIds.has(item.id)) e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedIds.has(item.id)) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ color: selectedIds.has(item.id) ? 'var(--accent)' : 'var(--w40)' }}>
                    {selectedIds.has(item.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--w85)' }}>{item.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--w40)' }}>
                      {item.itemCount} items • Deleted on {new Date(item.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
