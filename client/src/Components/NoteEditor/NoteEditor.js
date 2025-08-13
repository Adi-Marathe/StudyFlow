import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Type, Highlighter, Save, ArrowLeft, Plus } from 'lucide-react';
import './NoteEditor.css';

const NoteEditor = ({ onClose, onSave }) => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [activeFormats, setActiveFormats] = useState(new Set());
  const [pages, setPages] = useState([{ id: 1, title: '', content: '' }]);
  const [fontSize, setFontSize] = useState(16);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#ffff00');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const contentRefs = useRef({});

  // Add this new function to completely reset formatting
  const resetFormatting = useCallback(() => {
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        // Get current position
        const range = selection.getRangeAt(0);
        
        // Create a temporary text node to break formatting
        const textNode = document.createTextNode('\u200B'); // Zero-width space
        range.insertNode(textNode);
        
        // Position cursor after the text node
        range.setStartAfter(textNode);
        range.collapse(true);
        
        // Remove the temporary text node
        textNode.remove();
        
        // Clear all formatting states
        document.execCommand('removeFormat', false, null);
        document.execCommand('hiliteColor', false, 'transparent');
        document.execCommand('backColor', false, 'transparent');
        document.execCommand('foreColor', false, currentTextColor);
        
        // Update selection
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.error('Error resetting formatting:', error);
    }
  }, [currentTextColor]);

  // Memoized execCommand function with error handling
  const execCommand = useCallback((command, value = null) => {
    try {
      if (document.queryCommandSupported && !document.queryCommandSupported(command)) {
        console.warn(`Command ${command} not supported`);
        return false;
      }
      const result = document.execCommand(command, false, value);
      updateActiveFormats();
      return result;
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      return false;
    }
  }, []);

  // Save functionality
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const documentData = {
        fileName: fileName || 'Untitled',
        pages,
        lastModified: new Date().toISOString(),
        fontSize,
        currentTextColor,
        currentHighlightColor
      };
      localStorage.setItem('noteEditor_document', JSON.stringify(documentData));
      localStorage.setItem('noteEditor_lastSaved', new Date().toISOString());
      setLastSaved(new Date());

      // send data to parent if given
      if (typeof onSave === 'function') {
        onSave(documentData);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  }, [fileName, pages, fontSize, currentTextColor, currentHighlightColor, onSave]);

  // Load document on component mount
  useEffect(() => {
    try {
      const savedDocument = localStorage.getItem('noteEditor_document');
      const savedTime = localStorage.getItem('noteEditor_lastSaved');
      
      if (savedDocument) {
        const data = JSON.parse(savedDocument);
        setFileName(data.fileName || '');
        setPages(data.pages || [{ id: 1, title: '', content: '' }]);
        setFontSize(data.fontSize || 16);
        setCurrentTextColor(data.currentTextColor || '#000000');
        setCurrentHighlightColor(data.currentHighlightColor || '#ffff00');
      }
      
      if (savedTime) {
        setLastSaved(new Date(savedTime));
      }
    } catch (error) {
      console.error('Error loading saved document:', error);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (pages.some(page => page.content.trim() || page.title.trim()) || fileName.trim()) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [pages, fileName, handleSave]);

  // Enhanced font handling function
  const handleFontChange = useCallback((fontFamily) => {
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      // Apply to selected text
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontFamily = fontFamily;
      
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        
        // Restore selection
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // Fallback
        execCommand('fontName', fontFamily);
      }
    } else {
      // Set for future typing
      execCommand('fontName', fontFamily);
    }
  }, [execCommand]);

  // Optimized font size handling
  const handleFontSizeChange = useCallback((delta) => {
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      // Text is selected - apply to selection
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText.trim()) {
        // Get current font size of selected text or use default
        let currentSize = fontSize;
        const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentNode 
          : range.commonAncestorContainer;
        
        if (parentElement?.style?.fontSize) {
          currentSize = parseInt(parentElement.style.fontSize) || fontSize;
        }
        
        const newSize = Math.max(8, Math.min(72, currentSize + delta));
        
        try {
          // Create a span with the new font size
          const span = document.createElement('span');
          span.style.fontSize = `${newSize}px`;
          span.style.fontFamily = 'inherit';
          
          // Extract contents and wrap in span
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          
          // Restore selection
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
          
        } catch (e) {
          // Fallback method
          execCommand('fontSize', '7');
          requestAnimationFrame(() => {
            const fontElements = document.querySelectorAll('font[size="7"]');
            fontElements.forEach(el => {
              el.style.fontSize = `${newSize}px`;
              el.removeAttribute('size');
            });
          });
        }
      }
    } else {
      // No selection - update base font size
      const newSize = Math.max(8, Math.min(72, fontSize + delta));
      setFontSize(newSize);
      
      const activeContentDiv = document.activeElement;
      if (activeContentDiv?.classList.contains('content-editor')) {
        activeContentDiv.style.fontSize = `${newSize}px`;
      }
    }
  }, [fontSize, execCommand]);

  // Optimized color handling
  const handleTextColor = useCallback((color) => {
    setCurrentTextColor(color);
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      // Apply to selected text only
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.color = color;
      
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        
        // Move cursor to end of span to prevent continued formatting
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // Fallback
        execCommand('foreColor', color);
        // Clear formatting after applying
        setTimeout(() => {
          execCommand('foreColor', '#000000');
        }, 50);
      }
    }
  }, [execCommand]);

  // Updated highlight handling function
  const handleHighlightColor = useCallback((color) => {
    setCurrentHighlightColor(color);
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      // Apply to selected text ONLY
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      
      // Create wrapper span with highlight
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.appendChild(selectedContent);
      
      // Insert the highlighted span
      range.insertNode(span);
      
      // Create a new text node after the span to break formatting
      const breakNode = document.createTextNode('');
      range.setStartAfter(span);
      range.insertNode(breakNode);
      
      // Position cursor after the break node
      range.setStartAfter(breakNode);
      range.collapse(true);
      
      // Clear selection and reselect at new position
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Force clear any residual formatting
      setTimeout(() => {
        resetFormatting();
      }, 0);
    }
  }, [resetFormatting]);

  // Optimized update active formats
  const updateActiveFormats = useCallback(() => {
    try {
      const formats = new Set();
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('italic')) formats.add('italic');
      if (document.queryCommandState('underline')) formats.add('underline');
      if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
      setActiveFormats(formats);
    } catch (error) {
      console.error('Error updating active formats:', error);
    }
  }, []);

  // Handle heading formatting
  const applyHeading = useCallback((tag) => {
    execCommand('formatBlock', tag);
  }, [execCommand]);

  // Enhanced onKeyDown handler with keyboard shortcuts
  const handleKeyDown = useCallback((e, pageId) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch(e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          return;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          return;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          return;
        case 's':
          e.preventDefault();
          handleSave();
          return;
        case '=':
        case '+':
          e.preventDefault();
          handleFontSizeChange(2);
          return;
        case '-':
          e.preventDefault();
          handleFontSizeChange(-2);
          return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Insert line breaks and reset formatting
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Insert break elements
        const br1 = document.createElement('br');
        const br2 = document.createElement('br');
        
        range.insertNode(br2);
        range.insertNode(br1);
        
        // Position cursor after the breaks
        range.setStartAfter(br2);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Reset all formatting
      setTimeout(() => resetFormatting(), 0);
      
    } else if (e.key === ' ' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
      // For space and regular characters, reset formatting after the keystroke
      setTimeout(() => resetFormatting(), 0);
    }
  }, [resetFormatting, execCommand, handleSave, handleFontSizeChange]);

  // Optimized add new page
  const addNewPage = useCallback(() => {
    setPages(prevPages => {
      const newPageId = prevPages.length + 1;
      const newPage = { id: newPageId, title: '', content: '' };
      
      // Use setTimeout for smooth scrolling
      setTimeout(() => {
        const newPageElement = document.getElementById(`page-${newPageId}`);
        if (newPageElement) {
          newPageElement.scrollIntoView({ behavior: 'smooth' });
          const contentEditor = newPageElement.querySelector('.content-editor');
          contentEditor?.focus();
        }
      }, 100);
      
      return [...prevPages, newPage];
    });
  }, []);

  // Optimized update page content
  const updatePageContent = useCallback((pageId, field, value) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId ? { ...page, [field]: value } : page
      )
    );
  }, []);

  // Memoized display filename
  const displayFileName = useMemo(() => {
    return fileName.trim() || 'Untitled';
  }, [fileName]);

  // Format last saved time
  const formatLastSaved = useMemo(() => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now - lastSaved;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Saved just now';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    if (minutes < 1440) return `Saved ${Math.floor(minutes / 60)}h ago`;
    return `Saved ${lastSaved.toLocaleDateString()}`;
  }, [lastSaved]);

  // Enhanced selection change handler
  useEffect(() => {
    let timeoutId;
    
    const handleSelectionChange = () => {
      // Debounce the update to prevent excessive calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateActiveFormats, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      clearTimeout(timeoutId);
      contentRefs.current = {};
    };
  }, [updateActiveFormats]);

  // Optimized content setting effect
  useEffect(() => {
    requestAnimationFrame(() => {
      Object.keys(contentRefs.current).forEach(pageId => {
        const ref = contentRefs.current[pageId];
        const page = pages.find(p => p.id === parseInt(pageId));
        if (ref && page && ref.innerHTML !== page.content) {
          ref.innerHTML = page.content;
        }
      });
    });
  }, [pages]);

  const handleBack = useCallback(async () => {
    await handleSave();
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [handleSave, onClose]);

  return (
    <div className="note-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
        <button
            className="header-btn back-btn"
            aria-label="Go back"
            onClick={handleBack} 
          >
            <ArrowLeft size={18} />
            <span className="btn-text">Back</span>
          </button>
        </div>
        
        <div className="header-center">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="file-name-input"
            placeholder="Untitled"
            aria-label="File name"
          />
          {lastSaved && (
            <div style={{ 
              fontSize: '11px', 
              opacity: 0.8, 
              marginTop: '2px',
              textAlign: 'center'
            }}>
              {formatLastSaved}
            </div>
          )}
        </div>
        
        <div className="header-right">
          <button 
            className="header-btn save-btn"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save document"
            style={{ opacity: isSaving ? 0.6 : 1 }}
          >
            <Save size={18} />
            <span className="btn-text">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" role="toolbar" aria-label="Text formatting toolbar">
        <div className="toolbar-section">
          {/* Headings */}
          <button 
            className="toolbar-btn heading-btn"
            onClick={() => applyHeading('h1')}
            title="Heading 1"
            aria-label="Heading 1"
          >
            H₁
          </button>
          <button 
            className="toolbar-btn heading-btn"
            onClick={() => applyHeading('h2')}
            title="Heading 2"
            aria-label="Heading 2"
          >
            H₂
          </button>
          
          {/* Enhanced Font Family Dropdown */}
          <select 
            className="font-select"
            onChange={(e) => handleFontChange(e.target.value)}
            defaultValue="Inter"
            aria-label="Font family"
          >
            {/* Sans-serif fonts */}
            <optgroup label="Sans-serif">
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
              <option value="Ubuntu">Ubuntu</option>
              <option value="Nunito">Nunito</option>
            </optgroup>
            
            {/* Serif fonts */}
            <optgroup label="Serif">
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Times">Times</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Merriweather">Merriweather</option>
              <option value="Crimson Text">Crimson Text</option>
              <option value="Libre Baskerville">Libre Baskerville</option>
              <option value="Lora">Lora</option>
              <option value="Cormorant Garamond">Cormorant Garamond</option>
            </optgroup>
            
            {/* Monospace fonts */}
            <optgroup label="Monospace">
              <option value="Courier New">Courier New</option>
              <option value="Monaco">Monaco</option>
              <option value="Consolas">Consolas</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Inconsolata">Inconsolata</option>
            </optgroup>
            
            {/* Display/Decorative fonts */}
            <optgroup label="Display">
              <option value="Oswald">Oswald</option>
              <option value="Raleway">Raleway</option>
              <option value="Dancing Script">Dancing Script</option>
              <option value="Pacifico">Pacifico</option>
              <option value="Lobster">Lobster</option>
              <option value="Comfortaa">Comfortaa</option>
              <option value="Righteous">Righteous</option>
            </optgroup>
          </select>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Font Size Controls */}
          <button 
            className="toolbar-btn size-btn"
            onClick={() => handleFontSizeChange(-2)}
            title="Decrease font size (Ctrl+-)"
            aria-label="Decrease font size"
          >
            −
          </button>
          <span className="font-size-display" aria-label={`Current font size: ${fontSize}`}>
            {fontSize}
          </span>
          <button 
            className="toolbar-btn size-btn"
            onClick={() => handleFontSizeChange(2)}
            title="Increase font size (Ctrl++)"
            aria-label="Increase font size"
          >
            +
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Text Colors */}
          <div className="color-group">
            <input
              type="color"
              className="color-picker text-color"
              onChange={(e) => handleTextColor(e.target.value)}
              title="Text color"
              aria-label="Text color"
              value={currentTextColor}
            />
            <Type size={14} className="color-icon" style={{ color: currentTextColor }} />
          </div>
          
          <div className="color-group">
            <input
              type="color"
              className="color-picker highlight-color"
              onChange={(e) => handleHighlightColor(e.target.value)}
              title="Highlight color"
              aria-label="Highlight color"
              value={currentHighlightColor}
            />
            <Highlighter size={14} className="color-icon" style={{ color: currentHighlightColor }} />
          </div>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Text Formatting */}
          <button 
            className={`toolbar-btn format-btn ${activeFormats.has('bold') ? 'active' : ''}`}
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
            aria-pressed={activeFormats.has('bold')}
          >
            <Bold size={16} />
          </button>
          <button 
            className={`toolbar-btn format-btn ${activeFormats.has('italic') ? 'active' : ''}`}
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
            aria-pressed={activeFormats.has('italic')}
          >
            <Italic size={16} />
          </button>
          <button 
            className={`toolbar-btn format-btn ${activeFormats.has('underline') ? 'active' : ''}`}
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
            aria-pressed={activeFormats.has('underline')}
          >
            <Underline size={16} />
          </button>
          <button 
            className={`toolbar-btn format-btn ${activeFormats.has('strikethrough') ? 'active' : ''}`}
            onClick={() => execCommand('strikeThrough')}
            title="Strikethrough"
            aria-label="Strikethrough"
            aria-pressed={activeFormats.has('strikethrough')}
          >
            <Strikethrough size={16} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Alignment */}
          <button 
            className="toolbar-btn align-btn"
            onClick={() => execCommand('justifyLeft')}
            title="Align left"
            aria-label="Align left"
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className="toolbar-btn align-btn"
            onClick={() => execCommand('justifyCenter')}
            title="Align center"
            aria-label="Align center"
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className="toolbar-btn align-btn"
            onClick={() => execCommand('justifyRight')}
            title="Align right"
            aria-label="Align right"
          >
            <AlignRight size={16} />
          </button>
          <button 
            className="toolbar-btn align-btn"
            onClick={() => execCommand('justifyFull')}
            title="Justify"
            aria-label="Justify"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Lists */}
          <button 
            className="toolbar-btn list-btn"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet list"
            aria-label="Bullet list"
          >
            <List size={16} />
          </button>
          <button 
            className="toolbar-btn list-btn"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered list"
            aria-label="Numbered list"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Additional Tools */}
          <button 
            className="toolbar-btn page-add-btn"
            onClick={addNewPage}
            title="Add new page"
            aria-label="Add new page"
          >
            <Plus size={16} />
            <span className="add-page-text">Page</span>
          </button>
        </div>

        <div className="page-counter" aria-label={`Total pages: ${pages.length}`}>
          <span>Pages: {pages.length}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-container">
        <div className="pages-wrapper">
          {pages.map((page, index) => (
            <div key={page.id} className="document-page" id={`page-${page.id}`}>
              {/* Page Title */}
              {index === 0 && (
                <div className="title-section">
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => updatePageContent(page.id, 'title', e.target.value)}
                    className="page-title-input"
                    placeholder="Title"
                    aria-label="Document title"
                  />
                </div>
              )}

              {/* Page Content */}
              <div
                ref={(el) => {
                  if (el) contentRefs.current[page.id] = el;
                }}
                className="content-editor"
                contentEditable
                suppressContentEditableWarning={true}
                dir="ltr"
                style={{ 
                  fontSize: `${fontSize}px`, 
                  direction: 'ltr', 
                  textAlign: 'left',
                  unicodeBidi: 'normal',
                  color: currentTextColor
                }}
                onInput={(e) => {
                  updatePageContent(page.id, 'content', e.target.innerHTML);
                  updateActiveFormats();
                }}
                onKeyDown={(e) => handleKeyDown(e, page.id)}
                onPaste={(e) => {
                  // Handle paste events to prevent formatting continuation
                  setTimeout(() => resetFormatting(), 0);
                }}
                onFocus={() => {
                  // Clear formatting when focusing
                  setTimeout(() => resetFormatting(), 0);
                }}
                data-placeholder={index === 0 ? "Start writing..." : `Continue writing on page ${page.id}...`}
                role="textbox"
                aria-multiline="true"
                aria-label={`Page ${page.id} content`}
              />

              {/* Page Number */}
              <div className="page-number" aria-label={`Page ${page.id}`}>
                {page.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
