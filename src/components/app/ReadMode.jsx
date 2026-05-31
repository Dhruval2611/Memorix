import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Check, X, Plus, Trash2, Save, BookOpen, List, Grid, CreditCard, ChevronLeft, ChevronRight, ChevronUp, Type, FileText, Search, MoreHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import CustomSelect from '../ui/CustomSelect';
import { getContentLibrary, updateContentItem, softDeleteContentItem } from '../../utils/storage';
import { autoParseContent, extractTextFromPDF } from '../../utils/contentParser';
import './ReadMode.css';

export default function ReadMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialContentId = location.state?.contentId || '';

  // Helper: insert <wbr> (word break opportunity) at smart positions
  // so the browser wraps only when needed, keeping brackets with their word.
  // Break points: after '/' and before '('
  const smartWrap = (text) => {
    if (!text) return text;
    // Split into characters, insert <wbr> at break opportunities
    const result = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      // Insert break opportunity BEFORE '('
      if (ch === '(' && i > 0) {
        result.push(<wbr key={`b${i}`} />);
      }
      result.push(ch);
      // Insert break opportunity AFTER '/'
      if (ch === '/' && i < text.length - 1) {
        result.push(<wbr key={`a${i}`} />);
      }
    }
    return result;
  };

  const [library, setLibrary] = useState([]);
  const [contentId, setContentId] = useState(initialContentId);
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);
  
  // Study vs Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSetMenu, setShowSetMenu] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  
  // Temporary state for the item being edited
  const [editTerm, setEditTerm] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editType, setEditType] = useState('flashcard');

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState(false);

  // Scroll to Top
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowScrollTop(scrollPos > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger immediately in case already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Block navigation if dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditMode && isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handleClick = (e) => {
      if (isEditMode && isDirty) {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')) {
          if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isEditMode, isDirty]);

  // Bulk Import State
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkMode, setBulkMode] = useState('text'); // 'text' | 'pdf'
  const [bulkText, setBulkText] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const fileInputRef = useRef(null);

  // Layout State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid' | 'card'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const lib = getContentLibrary();
    setLibrary(lib);
    if (initialContentId) {
      const selected = lib.find(c => c.id === initialContentId);
      if (selected) {
        setContent(selected);
        setTitle(selected.title);
        setItems(selected.items || []);
      }
    }
  }, [initialContentId]);

  // Keyboard arrow navigation for card view
  useEffect(() => {
    if (viewMode !== 'card') return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentCardIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentCardIndex(prev => Math.min(filteredItems.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredItems.length]);

  const handleSelectContent = (id) => {
    setContentId(id);
    const selected = library.find(c => c.id === id);
    if (selected) {
      setContent(selected);
      setTitle(selected.title);
      setItems(selected.items || []);
    }
  };

  const handleSaveAll = () => {
    if (!content) return;
    
    const updated = updateContentItem(content.id, {
      title,
      items
    });
    
    if (updated) {
      setContent(updated);
      const updatedLib = library.map(c => c.id === updated.id ? updated : c);
      setLibrary(updatedLib);
    }
    setIsEditMode(false);
    setIsDirty(false);
  };

  const handleCancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) return;
    }
    setIsEditMode(false);
    setIsDirty(false);
    // Restore original content
    const selected = library.find(c => c.id === contentId);
    if (selected) {
      setTitle(selected.title);
      setItems(selected.items || []);
    }
  };

  const handleBack = () => {
    if (isEditMode && isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to go back?')) return;
    }
    setContent(null);
    setContentId('');
    setIsEditMode(false);
    setIsDirty(false);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditTerm(item.term);
    setEditDef(item.definition);
    setEditType(item.type || 'flashcard');
  };

  const saveEditItem = () => {
    if (!editTerm.trim() || !editDef.trim()) return;
    
    setItems(prev => prev.map(item => 
      item.id === editingItemId 
        ? { ...item, term: editTerm, definition: editDef, type: editType }
        : item
    ));
    setEditingItemId(null);
    setIsDirty(true);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      setIsDirty(true);
    }
  };

  const handleDeleteSet = () => {
    if (window.confirm('Move this set to the Recycle Bin?')) {
      softDeleteContentItem(contentId);
      navigate('/dashboard');
    }
  };

  const addNewItem = () => {
    setShowBulkImport(true);
    // Do not change view mode here to respect user's choice
    setTimeout(() => {
      const el = document.getElementById('add-new-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleBulkText = () => {
    if (!bulkText.trim()) {
      setBulkError('Please enter some content to analyze.');
      return;
    }
    setBulkProcessing(true);
    setBulkError('');

    setTimeout(() => {
      const parsed = autoParseContent(bulkText);
      if (parsed.length === 0) {
        setBulkError('Could not extract learning items. Try formatting as "term - definition".');
      } else {
        setItems(prev => [...prev, ...parsed]);
        setShowBulkImport(false);
        setBulkText('');
        setIsDirty(true);
      }
      setBulkProcessing(false);
    }, 800);
  };

  const handleBulkPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setBulkError('Please upload a PDF file.');
      return;
    }

    setBulkProcessing(true);
    setBulkError('');

    try {
      const text = await extractTextFromPDF(file);
      setBulkText(text);
      const parsed = autoParseContent(text);
      if (parsed.length === 0) {
        setBulkError('Could not extract items from PDF.');
      } else {
        setItems(prev => [...prev, ...parsed]);
        setShowBulkImport(false);
        setBulkText('');
        setIsDirty(true);
      }
    } catch (err) {
      setBulkError('Failed to process PDF.');
      console.error(err);
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="read-page">
      <div className="container">
        <div className="read-header-actions">
          {content && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>

              {!isEditMode && library.length > 1 && (
                <div className="hide-mobile" style={{ width: '200px' }}>
                  <CustomSelect 
                    value={contentId} 
                    onChange={(val) => handleSelectContent(val)}
                    size="sm"
                    options={library.map(c => ({
                      value: c.id,
                      label: c.title
                    }))}
                  />
                </div>
              )}
            </div>
          )}
          
          {content && (
            isEditMode ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button variant="primary" icon={<Check size={16} />} onClick={handleSaveAll}>
                  Save Edits
                </Button>
              </div>
            ) : (
              <Button variant="secondary" icon={<Edit2 size={16} />} onClick={() => setIsEditMode(true)}>
                Edit Set
              </Button>
            )
          )}
        </div>

        <AnimatePresence mode="wait">
          {!content ? (
            <motion.div
              key="setup"
              className="read-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1>
                <span className="gradient-text">Study</span> Guide
              </h1>
              <p>Read through your terms or edit your content set.</p>

              {library.length === 0 ? (
                <div className="no-content-msg glass">
                  <p>No content uploaded yet.</p>
                  <Button variant="primary" onClick={() => navigate('/upload')}>
                    Upload Content
                  </Button>
                </div>
              ) : (
                <div className="setup-field" style={{ maxWidth: '400px', margin: '40px auto' }}>
                  <label>Select Content to Read/Edit</label>
                  <CustomSelect
                    value={contentId}
                    onChange={(val) => handleSelectContent(val)}
                    options={library.map(c => ({
                      value: c.id,
                      label: `${c.title} (${c.itemCount} items)`
                    }))}
                    placeholder="Choose content..."
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reader"
              className="read-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="read-title-section glass">
                <BookOpen className="read-title-icon" size={32} />
                {isEditingTitle ? (
                  <div className="title-edit-wrap">
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => {
                        setTitle(e.target.value);
                        setIsDirty(true);
                      }} 
                      className="title-edit-input"
                      autoFocus
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                    />
                  </div>
                ) : (
                  <div className="title-display-wrap">
                    <h2>{title}</h2>
                    {isEditMode && (
                      <button className="edit-icon-btn" onClick={() => setIsEditingTitle(true)}>
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                )}
                <div className="read-meta">
                  <span>{items.length} items</span>
                  <span>•</span>
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <button
                    onClick={() => setShowSetMenu(!showSetMenu)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--w50)', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  <AnimatePresence>
                    {showSetMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', top: '100%', right: 0,
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: 'var(--r-md)', padding: '4px', zIndex: 10,
                          minWidth: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                      >
                        <button
                          onClick={handleDeleteSet}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '8px 12px', background: 'transparent',
                            border: 'none', color: 'var(--accent-red)', cursor: 'pointer',
                            fontFamily: 'var(--font-body)', fontSize: '0.8rem', textAlign: 'left',
                            borderRadius: 'var(--r-sm)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={14} /> Move to Trash
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="read-controls-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '24px 0' }}>
                <div className="search-bar-container" style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--w50)' }} />
                  <input 
                    type="text" 
                    placeholder="Search in this set..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentCardIndex(0);
                    }}
                    style={{ width: '100%', padding: '10px 14px 10px 40px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--w85)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="view-mode-toggle glass" style={{ margin: 0 }}>
                  <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View"><List size={18} /></button>
                  <button className={`toggle-btn hide-mobile ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View"><Grid size={18} /></button>
                  <button className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => { setViewMode('card'); setCurrentCardIndex(0); }} title="Card View"><CreditCard size={18} /></button>
                </div>
              </div>

              {isEditMode && (
                <div id="add-new-section" style={{ marginBottom: '40px' }}>
                  {!showBulkImport ? (
                    <button className="add-item-btn glass" onClick={addNewItem} style={{ marginTop: 0 }}>
                      <Plus size={20} />
                      <span>Add New Items</span>
                    </button>
                  ) : (
                    <motion.div 
                      className="bulk-import-inline glass"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: 0 }}
                    >
                      <div className="upload-tabs" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                        <button
                          className={`upload-tab ${bulkMode === 'text' ? 'active' : ''}`}
                          onClick={() => setBulkMode('text')}
                          style={{ flex: 1, padding: '10px', background: bulkMode === 'text' ? 'var(--accent-dim)' : 'transparent', border: bulkMode === 'text' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--w85)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <Type size={16} /> Text Input
                        </button>
                        <button
                          className={`upload-tab ${bulkMode === 'pdf' ? 'active' : ''}`}
                          onClick={() => setBulkMode('pdf')}
                          style={{ flex: 1, padding: '10px', background: bulkMode === 'pdf' ? 'var(--accent-dim)' : 'transparent', border: bulkMode === 'pdf' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--w85)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <FileText size={16} /> PDF Upload
                        </button>
                      </div>

                      <div className="upload-workspace" style={{ background: 'var(--bg-hover)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}>
                        {bulkMode === 'text' && (
                          <div className="text-input-area">
                            <textarea
                              className="content-textarea"
                              placeholder="Enter your learning content here...&#10;&#10;Supported formats:&#10;• term - definition&#10;• term: definition&#10;• Q: question / A: answer"
                              value={bulkText}
                              onChange={(e) => { setBulkText(e.target.value); setIsDirty(true); }}
                              style={{ width: '100%', minHeight: '160px', background: 'transparent', border: 'none', color: 'var(--w85)', fontSize: '0.95rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        )}
                        
                        {bulkMode === 'pdf' && (
                          <div className="pdf-upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleBulkPdf}
                              ref={fileInputRef}
                              style={{ display: 'none' }}
                            />
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={bulkProcessing}>
                              Choose PDF File
                            </Button>
                          </div>
                        )}
                      </div>

                      {bulkError && (
                        <div className="upload-error" style={{ color: 'var(--red)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <X size={16} /> {bulkError}
                        </div>
                      )}

                      <div className="bulk-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <Button variant="secondary" onClick={() => setShowBulkImport(false)}>
                          Cancel
                        </Button>
                        {bulkMode === 'text' && (
                          <Button 
                            variant="primary" 
                            onClick={handleBulkText} 
                            disabled={bulkProcessing || !bulkText.trim()}
                          >
                            {bulkProcessing ? 'Extracting...' : 'Extract & Append'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {viewMode === 'card' && filteredItems.length > 0 ? (
                <div className="card-view-container">
                  <div className="card-navigation">
                    <button 
                      onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                      disabled={currentCardIndex === 0}
                      className="nav-btn"
                    ><ChevronLeft size={24} /></button>
                    
                    <span className="card-counter">{currentCardIndex + 1} / {filteredItems.length}</span>
                    
                    <button 
                      onClick={() => setCurrentCardIndex(Math.min(filteredItems.length - 1, currentCardIndex + 1))}
                      disabled={currentCardIndex === filteredItems.length - 1}
                      className="nav-btn"
                    ><ChevronRight size={24} /></button>
                  </div>
                  
                  <motion.div 
                    className="flashcard glass"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      const swipeThreshold = 50;
                      if (offset.x < -swipeThreshold) {
                        setCurrentCardIndex(prev => Math.min(filteredItems.length - 1, prev + 1));
                      } else if (offset.x > swipeThreshold) {
                        setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      }
                    }}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div className="flashcard-inner-static" style={{ pointerEvents: 'none' }}>
                      <div className="card-type-badge">{filteredItems[currentCardIndex].type}</div>
                      <h3>{smartWrap(filteredItems[currentCardIndex].term)}</h3>
                      <div className="card-divider"></div>
                      <p>{smartWrap(filteredItems[currentCardIndex].definition)}</p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className={`read-items-list mode-${viewMode}`}>
                  {filteredItems.length === 0 ? (
                    <div className="no-results" style={{ textAlign: 'center', padding: '40px', color: 'var(--w50)' }}>
                      No items found matching your search.
                    </div>
                  ) : filteredItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className={`read-item-card glass ${editingItemId === item.id ? 'editing' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingItemId === item.id ? (
                      <div className="read-item-edit">
                        <div className="edit-fields">
                          <div className="edit-field">
                            <label>Term</label>
                            <input 
                              type="text" 
                              value={editTerm} 
                              onChange={e => { setEditTerm(e.target.value); setIsDirty(true); }} 
                              className="read-edit-input"
                            />
                          </div>
                          <div className="edit-field">
                            <label>Definition</label>
                            <textarea 
                              value={editDef} 
                              onChange={e => { setEditDef(e.target.value); setIsDirty(true); }} 
                              className="read-edit-textarea"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button className="edit-btn save" onClick={saveEditItem}><Check size={16} /> Save</button>
                          <button className="edit-btn cancel" onClick={cancelEditItem}><X size={16} /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="read-item-content">
                          <div className="read-item-type">{item.type}</div>
                          <div className="read-item-term">{item.term}</div>
                          <div className="read-item-def">{item.definition}</div>
                        </div>
                        {isEditMode && (
                          <div className="read-item-actions">
                            <button className="action-icon edit" onClick={() => startEditItem(item)} title="Edit Item">
                              <Edit2 size={16} />
                            </button>
                            <button className="action-icon delete" onClick={() => deleteItem(item.id)} title="Delete Item">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="scroll-to-top-btn"
              onClick={scrollToTop}
              title="Scroll to top"
              style={{ zIndex: 9999 }}
            >
              <ChevronUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
