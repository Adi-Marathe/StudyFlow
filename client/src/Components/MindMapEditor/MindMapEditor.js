import { useCallback, useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import "reactflow/dist/style.css";
import "./MindMapEditor.css";
import logo from '../../Assets/images/StudyFlow-logo.png'

const colors = ["#701ad9", "#ff6f61", "#ffa500", "#4caf50", "#2196f3", "#9c27b0"];

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
  
  const [mindMapTitle, setMindMapTitle] = useState("Untitled");
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef(null);

  const initialNodes = useMemo(() => [
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
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [fontSize, setFontSize] = useState(14);

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

  // Update nodes with onChange callback
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ 
        ...n, 
        data: { ...n.data, onChange: onNodeLabelChange } 
      }))
    );
  }, [onNodeLabelChange, setNodes]);

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

  const handleSave = useCallback(() => {
    const finalTitle = mindMapTitle.trim() || "Untitled";
    const mindMapData = { title: finalTitle, nodes, edges };
    console.log("Saving mind map:", mindMapData);
    alert("Mind map saved successfully!");
  }, [mindMapTitle, nodes, edges]);

  const handleExit = useCallback(() => {
    const hasChanges = nodes.length > 1 || edges.length > 0 || mindMapTitle !== "Untitled";
    
    if (hasChanges) {
      // eslint-disable-next-line no-restricted-globals
      const shouldExit = window.confirm(
        "You have unsaved changes. Are you sure you want to exit?"
      );
      if (!shouldExit) return;
    }
    
    navigate('/mindmaps');
  }, [nodes.length, edges.length, mindMapTitle, navigate]);

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

  const snapGrid = useMemo(() => ([10, 10]), []); // Grid snapping for better performance

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
          <button className="btn-save" onClick={handleSave}>
            <FiSave /> Save
          </button>
        </div>
      </header>

      <div className="mindmap-body">
        <aside className="mindmap-sidebar">
          <div className="sidebar-top">
            <button className="action-btn m-add-btn" title="Add Node" onClick={addNode}>
              <FiPlus />
            </button>
            <button className="action-btn delete-btn" title="Delete Selected" onClick={deleteSelected}>
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
