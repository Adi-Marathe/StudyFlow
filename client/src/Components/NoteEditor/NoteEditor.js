import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Highlighter,
  Save,
  ArrowLeft,
  Plus,
} from "lucide-react";
import "./NoteEditor.css";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const NoteEditor = ({ noteId, onClose, onSave, userToken }) => {
  const [fileName, setFileName] = useState("");
  const [activeFormats, setActiveFormats] = useState(new Set());
  const [pages, setPages] = useState([{ id: 1, title: "", content: "" }]);
  const [fontSize, setFontSize] = useState(16);
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#ffff00");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const contentRefs = useRef({});
  const [currentNoteId, setCurrentNoteId] = useState(noteId || null);

  // Clear formatting helper (only use for explicit clear formatting button)
  const resetFormatting = useCallback(() => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const zwsp = document.createTextNode("\u200B");
      range.insertNode(zwsp);
      range.setStartAfter(zwsp);
      range.collapse(true);
      zwsp.remove();
      
      document.execCommand("removeFormat", false, null);
      document.execCommand("hiliteColor", false, "transparent");
      document.execCommand("backColor", false, "transparent");
      
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.error("Error resetting formatting:", e);
    }
  }, []);

  // Safe execCommand wrapper
  const execCommand = useCallback((command, value = null) => {
    try {
      if (document.queryCommandSupported && !document.queryCommandSupported(command)) {
        console.warn(`Command ${command} not supported`);
        return false;
      }
      const result = document.execCommand(command, false, value);
      updateActiveFormats();
      return result;
    } catch (e) {
      console.error(`Error executing command ${command}:`, e);
      return false;
    }
  }, []);

  // Save note
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        fileName: fileName || "Untitled",
        pages,
        fontSize,
        currentTextColor,
        currentHighlightColor,
        lastModified: new Date().toISOString(),
      };

      let url = `${API_BASE}/api/notes`;
      let method = "POST";
      if (currentNoteId) {
        url = `${API_BASE}/api/notes/${currentNoteId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Save failed:", res.status, errText);
        throw new Error(`Save failed with ${res.status}`);
      }
      const saved = await res.json();

      setLastSaved(new Date(saved.updatedAt || Date.now()));
      if (!currentNoteId && saved._id) setCurrentNoteId(saved._id);

      onSave?.(saved);
      toast.success(method === "POST" ? "Note created successfully" : "Note updated successfully");
      return saved;
    } catch (e) {
      console.error("Error saving:", e);
      toast.error("Error saving note");
    } finally {
      setIsSaving(false);
    }
  }, [currentNoteId, fileName, pages, fontSize, currentTextColor, currentHighlightColor, userToken, onSave]);

  // Auto-save every 30s if not empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fileName.trim() && pages.every((p) => !p.title.trim() && !p.content.trim())) return;
      handleSave();
    }, 30000);
    return () => clearTimeout(timer);
  }, [pages, fileName, handleSave]);

  // Font family change
  const handleFontChange = useCallback(
    (fontFamily) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontFamily = fontFamily;
        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch {
          execCommand("fontName", fontFamily);
        }
      } else {
        execCommand("fontName", fontFamily);
      }
    },
    [execCommand]
  );

  // Font size change
  const handleFontSizeChange = useCallback(
    (delta) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentNode
          : range.commonAncestorContainer;
        
        let currentSize = fontSize;
        if (parentElement?.style?.fontSize) {
          currentSize = parseInt(parentElement.style.fontSize) || fontSize;
        }
        
        const newSize = Math.max(8, Math.min(72, currentSize + delta));
        try {
          const span = document.createElement("span");
          span.style.fontSize = `${newSize}px`;
          span.style.fontFamily = "inherit";
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          range.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch {
          execCommand("fontSize", "7");
          requestAnimationFrame(() => {
            const fontElements = document.querySelectorAll('font[size="7"]');
            fontElements.forEach((el) => {
              el.style.fontSize = `${newSize}px`;
              el.removeAttribute("size");
            });
          });
        }
      } else {
        const newSize = Math.max(8, Math.min(72, fontSize + delta));
        setFontSize(newSize);
        const activeContentDiv = document.activeElement;
        if (activeContentDiv?.classList.contains("content-editor")) {
          activeContentDiv.style.fontSize = `${newSize}px`;
        }
      }
    },
    [fontSize, execCommand]
  );

  // Text color (FIXED - only applies to selected text)
  const handleTextColor = useCallback((color) => {
    setCurrentTextColor(color);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.color = color;
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      // Move caret after the span
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Highlight color (FIXED - only applies to selected text)
  const handleHighlightColor = useCallback((color) => {
    setCurrentHighlightColor(color);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const contents = range.extractContents();
      const span = document.createElement("span");
      span.style.backgroundColor = color;
      span.appendChild(contents);
      range.insertNode(span);
      // Move caret after inserted span
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Update active format buttons
  const updateActiveFormats = useCallback(() => {
    try {
      const formats = new Set();
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");
      if (document.queryCommandState("strikeThrough")) formats.add("strikethrough");
      setActiveFormats(formats);
    } catch (e) {
      console.error("Error updating active formats:", e);
    }
  }, []);

  // Apply headings
  const applyHeading = useCallback(
    (tag) => {
      execCommand("formatBlock", tag);
    },
    [execCommand]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e, pageId) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            execCommand("bold");
            return;
          case "i":
            e.preventDefault();
            execCommand("italic");
            return;
          case "u":
            e.preventDefault();
            execCommand("underline");
            return;
          case "s":
            e.preventDefault();
            handleSave();
            return;
          case "=":
          case "+":
            e.preventDefault();
            handleFontSizeChange(2);
            return;
          case "-":
            e.preventDefault();
            handleFontSizeChange(-2);
            return;
        }
      }
    },
    [execCommand, handleSave, handleFontSizeChange]
  );

  // Add new page
  const addNewPage = useCallback(() => {
    setPages((prevPages) => {
      const newPageId = prevPages.length + 1;
      const newPage = { id: newPageId, title: "", content: "" };
      setTimeout(() => {
        const newPageElement = document.getElementById(`page-${newPageId}`);
        if (newPageElement) {
          newPageElement.scrollIntoView({ behavior: "smooth" });
          newPageElement.querySelector(".content-editor")?.focus();
        }
      }, 100);
      return [...prevPages, newPage];
    });
  }, []);

  // Update page content
  const updatePageContent = useCallback((pageId, field, value) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === pageId ? { ...page, [field]: value } : page
      )
    );
  }, []);

  // Display file name
  const displayFileName = useMemo(
    () => fileName.trim() || "Untitled",
    [fileName]
  );

  // Format last saved time
  const formatLastSaved = useMemo(() => {
    if (!lastSaved) return "";
    const now = new Date();
    const mins = Math.floor((now - lastSaved) / 60000);
    if (mins < 1) return "Saved just now";
    if (mins < 60) return `Saved ${mins}m ago`;
    if (mins < 1440) return `Saved ${Math.floor(mins / 60)}h ago`;
    return `Saved ${lastSaved.toLocaleDateString()}`;
  }, [lastSaved]);

  // Load note if editing
  useEffect(() => {
    if (!currentNoteId || !userToken) return;

    fetch(`${API_BASE}/api/notes/${currentNoteId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          console.error("Load failed:", res.status, txt);
          throw new Error(`Fetch failed ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Loaded note', data);
        setFileName(data.fileName || "");
        setPages(data.pages || [{ id: 1, title: "", content: "" }]);
        setFontSize(data.fontSize || 16);
        setCurrentTextColor(data.currentTextColor || "#000000");
        setCurrentHighlightColor(data.currentHighlightColor || "#ffff00");
        setLastSaved(new Date(data.updatedAt || Date.now()));
      })
      .catch((err) => {
        console.error("Error loading note:", err);
        toast.error("Failed to load note");
      });
  }, [currentNoteId, userToken]);

  // Handle back button
  const handleBack = useCallback(async () => {
    const saved = await handleSave();
    if (saved && typeof onClose === "function") {
      onClose();
    }
  }, [handleSave, onClose]);

  // Sync pages state to DOM (fixes content loading)
  useEffect(() => {
    requestAnimationFrame(() => {
      pages.forEach((p) => {
        const el = contentRefs.current[p.id];
        if (!el) return;
        const html = p.content || '';
        if (el.innerHTML !== html) {
          el.innerHTML = html;
        }
      });
    });
  }, [pages]);

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
          />
        </div>
        <div className="header-right">
          <button
            className="header-btn save-btn"
            onClick={handleSave}
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.6 : 1 }}
          >
            <Save size={18} />
            <span className="btn-text">{isSaving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="toolbar"
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        <div className="toolbar-section">
          {/* Headings */}
          <button
            className="toolbar-btn heading-btn"
            onClick={() => applyHeading("h1")}
            title="Heading 1"
            aria-label="Heading 1"
          >
            H₁
          </button>
          <button
            className="toolbar-btn heading-btn"
            onClick={() => applyHeading("h2")}
            title="Heading 2"
            aria-label="Heading 2"
          >
            H₂
          </button>

          {/* Font Family Dropdown */}
          <select
            className="font-select"
            onChange={(e) => handleFontChange(e.target.value)}
            defaultValue="Inter"
            aria-label="Font family"
          >
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
            <optgroup label="Monospace">
              <option value="Courier New">Courier New</option>
              <option value="Monaco">Monaco</option>
              <option value="Consolas">Consolas</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Inconsolata">Inconsolata</option>
            </optgroup>
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
          <span
            className="font-size-display"
            aria-label={`Current font size: ${fontSize}`}
          >
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
            <Type
              size={14}
              className="color-icon"
              style={{ color: currentTextColor }}
            />
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
            <Highlighter
              size={14}
              className="color-icon"
              style={{ color: currentHighlightColor }}
            />
          </div>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Text Formatting */}
          <button
            className={`toolbar-btn format-btn ${
              activeFormats.has("bold") ? "active" : ""
            }`}
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
            aria-pressed={activeFormats.has("bold")}
          >
            <Bold size={16} />
          </button>
          <button
            className={`toolbar-btn format-btn ${
              activeFormats.has("italic") ? "active" : ""
            }`}
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
            aria-pressed={activeFormats.has("italic")}
          >
            <Italic size={16} />
          </button>
          <button
            className={`toolbar-btn format-btn ${
              activeFormats.has("underline") ? "active" : ""
            }`}
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
            aria-pressed={activeFormats.has("underline")}
          >
            <Underline size={16} />
          </button>
          <button
            className={`toolbar-btn format-btn ${
              activeFormats.has("strikethrough") ? "active" : ""
            }`}
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough"
            aria-label="Strikethrough"
            aria-pressed={activeFormats.has("strikethrough")}
          >
            <Strikethrough size={16} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Alignment */}
          <button
            className="toolbar-btn align-btn"
            onClick={() => execCommand("justifyLeft")}
            title="Align left"
            aria-label="Align left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            className="toolbar-btn align-btn"
            onClick={() => execCommand("justifyCenter")}
            title="Align center"
            aria-label="Align center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            className="toolbar-btn align-btn"
            onClick={() => execCommand("justifyRight")}
            title="Align right"
            aria-label="Align right"
          >
            <AlignRight size={16} />
          </button>
          <button
            className="toolbar-btn align-btn"
            onClick={() => execCommand("justifyFull")}
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
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet list"
            aria-label="Bullet list"
          >
            <List size={16} />
          </button>
          <button
            className="toolbar-btn list-btn"
            onClick={() => execCommand("insertOrderedList")}
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

        <div
          className="page-counter"
          aria-label={`Total pages: ${pages.length}`}
        >
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
                    onChange={(e) =>
                      updatePageContent(page.id, "title", e.target.value)
                    }
                    className="page-title-input"
                    placeholder="Title"
                    aria-label="Document title"
                  />
                </div>
              )}

              {/* Page Content */}
              <div
                ref={(el) => {
                  if (el) {
                    contentRefs.current[page.id] = el;
                    const html = page.content || '';
                    if (el.innerHTML !== html) {
                      el.innerHTML = html;
                    }
                  }
                }}
                className="content-editor"
                contentEditable
                suppressContentEditableWarning={true}
                dir="ltr"
                style={{
                  fontSize: `${fontSize}px`,
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                  // REMOVED: color: currentTextColor (this was causing whole document to change color)
                }}
                onInput={(e) => {
                  updatePageContent(page.id, "content", e.target.innerHTML);
                  updateActiveFormats();
                }}
                onKeyDown={(e) => handleKeyDown(e, page.id)}
                data-placeholder={
                  index === 0
                    ? "Start writing..."
                    : `Continue writing on page ${page.id}...`
                }
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
