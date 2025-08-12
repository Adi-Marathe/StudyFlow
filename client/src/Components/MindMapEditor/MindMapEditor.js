import { useCallback, useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider
} from "reactflow";
import { FiPlus, FiTrash2, FiSave, FiMinus, FiX } from "react-icons/fi";
import { toast } from 'react-toastify';
import "reactflow/dist/style.css";
import 'react-toastify/dist/ReactToastify.css';
import "./MindMapEditor.css";
import logo from '../../Assets/images/StudyFlow-logo.png'

const colors = ["#701ad9", "#ff6f61", "#ffa500", "#4caf50", "#2196f3", "#9c27b0"];

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// MEMOIZED CUSTOM NODE - This is crucial for performance
const CustomNode = memo(({ data, id, selected }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = useCallback(() => setEditing(true), []);

  const finishEditing = useCallback(() => {
    setEditing(false);
    if (data.onChange) {
      data.onChange(id, value);
    }
  }, [data.onChange, id, value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") finishEditing();
    if (e.key === "Escape") {
      setValue(data.label);
      setEditing(false);
    }
  }, [finishEditing, data.label]);

  return (
    <div
      className={`custom-node ${selected ? "selected" : ""}`}
      style={{
        backgroundColor: data.color,
        color: "#fff",
        fontSize: `${data.fontSize || 14}px`,
        boxShadow: selected 
          ? `0 0 0 3px ${data.color}70` 
          : `0 6px 20px ${data.color}30`,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
        style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"  
        style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="custom-handle"
        style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="custom-handle"
        style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={finishEditing}
          className="node-input"
          style={{ fontSize: `${data.fontSize || 14}px` }}
          maxLength={50}
        />
      ) : (
        <div className="node-label">{value}</div>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// SIMPLE EDGE COMPONENT - No complex animations
const CustomEdge = memo(({ id, sourceX, sourceY, targetX, targetY }) => {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + 60},${sourceY} ${targetX - 60},${targetY} ${targetX},${targetY}`;

  return (
    <g className="react-flow__edge">
      <path
        id={id}
        d={edgePath}
        stroke="#8b5cf6"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

CustomEdge.displayName = 'CustomEdge';

// MEMOIZED NODE AND EDGE TYPES - Defined outside component
const nodeTypes = { customNode: CustomNode };
const edgeTypes = { custom: CustomEdge };

function MindMapEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Extract existing mind map data from navigation state
  const existingMindMap = location.state;
  
  const [mindMapTitle, setMindMapTitle] = useState("Untitled");
  const [editingTitle, setEditingTitle] = useState(false);
  const [mindMapId, setMindMapId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // ✅ Guard against duplicate loading
  const titleInputRef = useRef(null);

  // ✅ Dynamic initial nodes based on existing data
  const initialNodes = useMemo(() => {
    if (existingMindMap?.nodes && existingMindMap.nodes.length > 0) {
      return existingMindMap.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: null // Will be set later
        }
      }));
    }
    
    return [
      {
        id: "root",
        type: "customNode",
        position: { x: 0, y: 0 },
        data: { 
          label: "Idea Flow", 
          color: colors[0], 
          fontSize: 16
        },
      },
    ];
  }, [existingMindMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [fontSize, setFontSize] = useState(14);

  // ✅ Load existing mind map data on component mount (FIXED - No duplicate toasts)
  useEffect(() => {
    // ✅ Prevent duplicate loading
    if (hasLoaded) return;

    console.log('Loading mind map data...');
    console.log('Existing mind map:', existingMindMap);

    if (existingMindMap) {
      // Set title and ID for existing mind map
      setMindMapTitle(existingMindMap.title || "Untitled");
      setMindMapId(existingMindMap.mindMapId);
      
      // Set nodes and edges
      setNodes(existingMindMap.nodes || initialNodes);
      setEdges(existingMindMap.edges || []);
      
      // ✅ REMOVED: Duplicate toast notification - cleaner UX
    } else {
      // New mind map
      setNodes(initialNodes);
      setEdges([]);
    }
    
    setIsLoading(false);
    setHasLoaded(true); // ✅ Mark as loaded to prevent duplicates
  }, []); // ✅ Empty dependency array - only run once

  // MEMOIZED CALLBACK FUNCTIONS - Critical for performance
  const onNodeLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((n) => 
        n.id === id 
          ? { ...n, data: { ...n.data, label: newLabel } } 
          : n
      )
    );
  }, [setNodes]);

  // ✅ Update nodes with onChange callback after loading
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      setNodes((nds) =>
        nds.map((n) => ({ 
          ...n, 
          data: { ...n.data, onChange: onNodeLabelChange } 
        }))
      );
    }
  }, [onNodeLabelChange, setNodes, isLoading, nodes.length]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const id = crypto.randomUUID();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "customNode",
        position: { 
          x: Math.random() * 400 - 200, 
          y: Math.random() * 300 - 150 
        },
        data: { 
          label: "New Topic", 
          color: selectedColor, 
          fontSize,
          onChange: onNodeLabelChange
        },
      },
    ]);
  }, [selectedColor, fontSize, onNodeLabelChange, setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  const changeColor = useCallback((color) => {
    setNodes((nds) => 
      nds.map((n) => 
        n.selected 
          ? { ...n, data: { ...n.data, color } } 
          : n
      )
    );
    setSelectedColor(color);
  }, [setNodes]);

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(fontSize + 2, 32);
    setFontSize(newSize);
    setNodes((nds) => 
      nds.map((n) => 
        n.selected 
          ? { ...n, data: { ...n.data, fontSize: newSize } } 
          : n
      )
    );
  }, [fontSize, setNodes]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(fontSize - 2, 10);
    setFontSize(newSize);
    setNodes((nds) => 
      nds.map((n) => 
        n.selected 
          ? { ...n, data: { ...n.data, fontSize: newSize } } 
          : n
      )
    );
  }, [fontSize, setNodes]);

  // ✅ UPDATED SAVE FUNCTION WITH DATA CLEANING
  const handleSave = useCallback(async () => {
    const finalTitle = mindMapTitle.trim() || "Untitled";
    
    // ✅ Clean nodes and edges data before sending (REMOVE FUNCTIONS)
    const cleanNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        color: node.data.color,
        fontSize: node.data.fontSize
      },
      selected: node.selected || false
    }));

    const cleanEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      selected: edge.selected || false
    }));

    const mindMapData = { 
      title: finalTitle, 
      nodes: cleanNodes, 
      edges: cleanEdges 
    };

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to save mind maps');
        setIsSaving(false);
        return;
      }

      const isUpdate = mindMapId !== null;
      const url = isUpdate 
        ? `${API_BASE_URL}/api/mindmaps/${mindMapId}` 
        : `${API_BASE_URL}/api/mindmaps`;
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mindMapData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isUpdate ? 'update' : 'save'} mind map`);
      }

      const result = await response.json();
      
      toast.success(`Mind map ${isUpdate ? 'updated' : 'saved'} successfully! 🎉`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      if (!isUpdate) {
        setMindMapId(result.mindMap._id); // ✅ Fixed: removed escaped underscore
      }
      
    } catch (error) {
      console.error('Error saving mind map:', error);
      toast.error(`Error saving mind map: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [mindMapTitle, nodes, edges, mindMapId]);

  const handleExit = useCallback(() => {
    navigate('/mindmaps');
  }, [navigate]);

  const handleTitleClick = useCallback(() => {
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }, []);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      const trimmedTitle = mindMapTitle.trim();
      if (!trimmedTitle) {
        setMindMapTitle("Untitled");
      }
      setEditingTitle(false);
    }
  }, [mindMapTitle]);

  const handleTitleFinish = useCallback(() => {
    const trimmedTitle = mindMapTitle.trim();
    if (!trimmedTitle) {
      setMindMapTitle("Untitled");
    } 
    setEditingTitle(false);
  }, [mindMapTitle]);

  // MEMOIZED OPTIONS - Critical for performance
  const defaultEdgeOptions = useMemo(() => ({
    type: "custom"
  }), []);

  const snapGrid = useMemo(() => ([10, 10]), []);

  // ✅ Show loading state while initializing
  if (isLoading) {
    return (
      <div className="mindmap-loading-container">
        <div className="mindmap-loading-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading mind map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mindmap-container">
      <header className="mindmap-header">
        <div className="header-left">
          <div className="sf-logo">
            <span className="sf-logo-icon">
              <img alt="StudyFlow" src={logo} height="45" />
            </span>
            <span className="sf-logo-text">Study<span className="flow">Flow</span></span>
          </div>
        </div>

        <div className="header-center">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={mindMapTitle}
              onChange={(e) => setMindMapTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleFinish}
              className="title-input"
              placeholder="Enter mind map title..."
            />
          ) : (
            <h1 className="mind-map-title" onClick={handleTitleClick}>
              {mindMapTitle || "Untitled"}
            </h1>
          )}
        </div>

        <div className="header-right">
          {/* ✅ Only Save button - No cancel/exit button */}
          <button 
            className="btn-save" 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.6 : 1 }}
          >
            <FiSave /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="mindmap-body">
        <aside className="mindmap-sidebar">
          <div className="sidebar-top">
            <button className="action-btn m-add-btn" title="Add Node" onClick={addNode}>
              <FiPlus />
            </button>
            <button className="action-btn m-delete-btn" title="Delete Selected" onClick={deleteSelected}>
              <FiTrash2 />
            </button>

            <div className="sidebar-divider"></div>

            <div className="sidebar-section">
              <span className="section-label">COLORS</span>
              <div className="color-palette">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${color === selectedColor ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => changeColor(color)}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <span className="section-label">FONT SIZE</span>
              <div className="font-controls">
                <button className="font-btn" onClick={decreaseFontSize}>
                  <FiMinus />
                </button>
                <span className="font-display">{fontSize}px</span>
                <button className="font-btn" onClick={increaseFontSize}>
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>

          <div className="sidebar-bottom">
            <button className="exit-btn" title="Exit Mind Map" onClick={handleExit}>
              <FiX />
            </button>
          </div>
        </aside>

        <section className="mindmap-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            snapToGrid={true}
            snapGrid={snapGrid}
            onlyRenderVisibleElements={true}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <MiniMap className="custom-minimap" />
            <Controls className="custom-controls" />
            <Background gap={20} size={1} color="#e2e8f0" />
          </ReactFlow>
        </section>
      </div>
    </div>
  );
}

// WRAP WITH PROVIDER FOR OPTIMAL PERFORMANCE
export default function MindMapEditorWrapper() {
  return (
    <ReactFlowProvider>
      <MindMapEditor />
    </ReactFlowProvider>
  );
}
