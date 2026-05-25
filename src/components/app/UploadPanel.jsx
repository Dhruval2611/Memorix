import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Type, CheckCircle2, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import GlowCard from '../ui/GlowCard';
import { autoParseContent, extractTextFromPDF } from '../../utils/contentParser';
import { addContentItem } from '../../utils/storage';
import { createLearningState, calculateStats } from '../../utils/adaptiveEngine';
import './UploadPanel.css';

export default function UploadPanel() {
  const [mode, setMode] = useState('text'); // 'text' | 'pdf'
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractedItems, setExtractedItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleTextParse = useCallback(() => {
    if (!textInput.trim()) {
      setError('Please enter some content to analyze.');
      return;
    }
    setProcessing(true);
    setError('');

    // Simulate slight delay for UX feel
    setTimeout(() => {
      const items = autoParseContent(textInput);
      if (items.length === 0) {
        setError('Could not extract learning items. Try formatting as "term - definition" or "term: definition".');
      }
      setExtractedItems(items);
      setProcessing(false);
    }, 800);
  }, [textInput]);

  const handlePDFUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setFileName(file.name);
    setProcessing(true);
    setError('');

    try {
      const text = await extractTextFromPDF(file);
      setTextInput(text);
      const items = autoParseContent(text);
      if (items.length === 0) {
        setError('Could not extract items from PDF. The content may need formatting adjustments.');
      }
      setExtractedItems(items);
    } catch (err) {
      setError('Failed to process PDF. Please try copying the text manually.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleRemoveItem = (id) => {
    setExtractedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (extractedItems.length === 0) return;

    const contentItem = addContentItem({
      title: title || `Content ${new Date().toLocaleDateString()}`,
      items: extractedItems,
      itemCount: extractedItems.length,
      source: mode === 'pdf' ? fileName : 'text-input',
      learningState: createLearningState(extractedItems),
    });

    setSaved(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="upload-page">

      <div className="container">
        <motion.div
          className="upload-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>
            Upload <span className="gradient-text">Content</span>
          </h1>
          <p>Paste text or upload a PDF. We'll extract key learning items automatically.</p>
        </motion.div>

        {/* Title Input */}
        <motion.div
          className="upload-title-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <input
            type="text"
            className="upload-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your content a name (e.g., Spanish Verbs)"
          />
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          className="upload-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <button
            className={`upload-tab ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          >
            <Type size={16} /> Text Input
          </button>
          <button
            className={`upload-tab ${mode === 'pdf' ? 'active' : ''}`}
            onClick={() => setMode('pdf')}
          >
            <FileText size={16} /> PDF Upload
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {mode === 'text' ? (
            <div className="upload-text-area">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Enter your learning content here...\n\nSupported formats:\n• term - definition\n• term: definition\n• term = definition\n• term (translation)\n• Q: question / A: answer\n• Tab-separated pairs`}
                rows={12}
                className="text-area"
              />
              <div className="text-area-footer">
                <span>{textInput.length} characters</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTextParse}
                  disabled={processing || !textInput.trim()}
                >
                  {processing ? 'Analyzing...' : 'Extract Items'}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="upload-drop-zone glass"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                hidden
              />
              <Upload size={40} className="drop-icon" />
              <h3>{fileName || 'Drop PDF here or click to upload'}</h3>
              <p>Supports .pdf files</p>
            </div>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="upload-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing */}
        {processing && (
          <div className="upload-processing">
            <div className="processing-spinner" />
            <span>Analyzing content...</span>
          </div>
        )}

        {/* Extracted Items */}
        <AnimatePresence>
          {extractedItems.length > 0 && !saved && (
            <motion.div
              className="extracted-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="extracted-header">
                <h3>Extracted Items ({extractedItems.length})</h3>
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={16} />}
                  onClick={handleSave}
                >
                  Save & Start Learning
                </Button>
              </div>

              <div className="extracted-grid">
                {extractedItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="extracted-item glass"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="extracted-item-top">
                      <span className="item-type-badge">{item.type}</span>
                      <button
                        className="item-remove"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="item-term">{item.term}</div>
                    <div className="item-definition">{item.definition}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {saved && (
            <motion.div
              className="upload-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 size={48} />
              <h3>Content Saved Successfully!</h3>
              <p>Redirecting to dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
