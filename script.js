document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    const canvasEl = document.getElementById('canvas');
    const propertiesPanel = document.getElementById('propertiesPanel');
    const textProperties = document.getElementById('textProperties');
    
    // Tools
    const addTextBtn = document.getElementById('addTextBtn');
    const addRectBtn = document.getElementById('addRectBtn');
    const addCircleBtn = document.getElementById('addCircleBtn');
    const addTriangleBtn = document.getElementById('addTriangleBtn');
    const addLineBtn = document.getElementById('addLineBtn');
    const drawModeBtn = document.getElementById('drawModeBtn');
    const imageUpload = document.getElementById('imageUpload');
    
    // Actions
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const bringFwdBtn = document.getElementById('bringFwdBtn');
    const sendBackBtn = document.getElementById('sendBackBtn');
    
    // Final Actions
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Properties
    const fillColor = document.getElementById('fillColor');
    const hexValue = document.getElementById('hexValue');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValueDisplay = document.getElementById('opacityValueDisplay');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    
    // History
    let history = [];
    let historyIndex = -1;
    let isHistoryAction = false;

    // --- Initialize Fabric Canvas ---
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true // Keep selected object in its layer
    });

    // --- Undo / Redo Mechanism ---
    function saveHistory() {
        if (isHistoryAction) return;

        // If we are overriding future history
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }

        history.push(JSON.stringify(canvas.toJSON()));
        historyIndex = history.length - 1;
        
        // Cap history to 50 states to save memory
        if (history.length > 50) {
            history.shift();
            historyIndex--;
        }
        
        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        undoBtn.style.opacity = historyIndex > 0 ? "1" : "0.5";
        undoBtn.style.cursor = historyIndex > 0 ? "pointer" : "not-allowed";
        
        redoBtn.style.opacity = historyIndex < history.length - 1 ? "1" : "0.5";
        redoBtn.style.cursor = historyIndex < history.length - 1 ? "pointer" : "not-allowed";
    }

    function undo() {
        if (historyIndex > 0) {
            isHistoryAction = true;
            historyIndex--;
            canvas.loadFromJSON(history[historyIndex], () => {
                canvas.renderAll();
                isHistoryAction = false;
                updateHistoryButtons();
            });
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            isHistoryAction = true;
            historyIndex++;
            canvas.loadFromJSON(history[historyIndex], () => {
                canvas.renderAll();
                isHistoryAction = false;
                updateHistoryButtons();
            });
        }
    }

    // Save initial state
    saveHistory();

    // Canvas Events for History
    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    // --- Helper Functions ---
    function centerObject(obj) {
        canvas.add(obj);
        canvas.centerObject(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
    }

    function updatePropertiesPanel() {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            propertiesPanel.classList.add('active');
            
            // Sync Fill Color
            if (activeObj.fill) {
                let color = activeObj.fill;
                if(activeObj.type === 'line' && activeObj.stroke) {
                    color = activeObj.stroke;
                }
                fillColor.value = color.length === 7 ? color : '#000000'; // Simple hex check
                hexValue.textContent = fillColor.value.toUpperCase();
            }

            // Sync Opacity
            if (activeObj.opacity !== undefined) {
                opacitySlider.value = activeObj.opacity;
                opacityValueDisplay.textContent = Math.round(activeObj.opacity * 100);
            }

            // Text Properties
            if (activeObj.type === 'i-text' || activeObj.type === 'text') {
                textProperties.style.display = 'block';
                fontFamily.value = activeObj.fontFamily || 'Inter';
                fontSize.value = activeObj.fontSize || 32;
                
                if (activeObj.fontWeight === 'bold') boldBtn.classList.add('active');
                else boldBtn.classList.remove('active');
                
                if (activeObj.fontStyle === 'italic') italicBtn.classList.add('active');
                else italicBtn.classList.remove('active');
            } else {
                textProperties.style.display = 'none';
            }
        } else {
            propertiesPanel.classList.remove('active');
            textProperties.style.display = 'none';
        }
    }

    // Canvas Selection Events
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', updatePropertiesPanel);

    // --- Tools ---
    addTextBtn.addEventListener('click', () => {
        const text = new fabric.IText('Double click to edit', {
            fontFamily: 'Inter',
            fontSize: 32,
            fill: '#0f172a',
            left: 100,
            top: 100
        });
        centerObject(text);
    });

    addRectBtn.addEventListener('click', () => {
        const rect = new fabric.Rect({
            width: 150,
            height: 100,
            fill: '#6366f1',
            rx: 8, // Rounded corners
            ry: 8
        });
        centerObject(rect);
    });

    addCircleBtn.addEventListener('click', () => {
        const circle = new fabric.Circle({
            radius: 60,
            fill: '#8b5cf6'
        });
        centerObject(circle);
    });

    addTriangleBtn.addEventListener('click', () => {
        const triangle = new fabric.Triangle({
            width: 100,
            height: 100,
            fill: '#10b981'
        });
        centerObject(triangle);
    });

    addLineBtn.addEventListener('click', () => {
        const line = new fabric.Line([50, 50, 200, 50], {
            stroke: '#0f172a',
            strokeWidth: 4,
            padding: 10 // Easier to select
        });
        centerObject(line);
    });

    drawModeBtn.addEventListener('click', () => {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        if (canvas.isDrawingMode) {
            drawModeBtn.classList.add('active');
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = fillColor.value;
            canvas.freeDrawingBrush.width = 5;
            canvas.discardActiveObject();
            canvas.renderAll();
        } else {
            drawModeBtn.classList.remove('active');
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(f) {
            const data = f.target.result;
            fabric.Image.fromURL(data, (img) => {
                // Scale down if image is too large
                if (img.width > canvas.width) {
                    img.scaleToWidth(canvas.width * 0.8);
                }
                if (img.height > canvas.height) {
                    img.scaleToHeight(canvas.height * 0.8);
                }
                centerObject(img);
            });
        };
        reader.readAsDataURL(file);
        
        // Reset input so the same file can be uploaded again if needed
        e.target.value = '';
    });

    // --- Actions ---
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    deleteBtn.addEventListener('click', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach((obj) => {
                canvas.remove(obj);
            });
        }
    });

    // Keyboard support for delete
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Prevent deletion if editing text
            const activeObj = canvas.getActiveObject();
            if (activeObj && activeObj.isEditing) return;

            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length) {
                canvas.discardActiveObject();
                activeObjects.forEach((obj) => {
                    canvas.remove(obj);
                });
            }
        }
    });

    bringFwdBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.bringForward(activeObj);
            saveHistory(); // Manual save for layer changes
        }
    });

    sendBackBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.sendBackwards(activeObj);
            saveHistory();
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            history = [];
            historyIndex = -1;
            saveHistory();
        }
    });

    // --- Properties Logic ---
    fillColor.addEventListener('input', (e) => {
        const color = e.target.value;
        hexValue.textContent = color.toUpperCase();
        
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.color = color;
        }

        const activeObjects = canvas.getActiveObjects();
        let changed = false;
        
        activeObjects.forEach(obj => {
            if (obj.type === 'line') {
                obj.set('stroke', color);
            } else {
                obj.set('fill', color);
            }
            changed = true;
        });

        if (changed) {
            canvas.renderAll();
            saveHistory(); // We'll trigger it here explicitly on input end typically, but let's do it on input so it updates visually and saves. 
            // Better to save on 'change' rather than 'input' to avoid history spam.
        }
    });

    fillColor.addEventListener('change', () => {
        saveHistory(); // Save when color picker closes
    });

    opacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        opacityValueDisplay.textContent = Math.round(val * 100);
        const activeObjects = canvas.getActiveObjects();
        let changed = false;
        activeObjects.forEach(obj => {
            obj.set('opacity', val);
            changed = true;
        });
        if (changed) {
            canvas.renderAll();
        }
    });

    opacitySlider.addEventListener('change', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            saveHistory();
        }
    });

    fontFamily.addEventListener('change', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('fontFamily', e.target.value);
            canvas.renderAll();
            saveHistory();
        }
    });

    fontSize.addEventListener('change', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('fontSize', parseInt(e.target.value, 10));
            canvas.renderAll();
            saveHistory();
        }
    });

    boldBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            const isBold = activeObj.fontWeight === 'bold';
            activeObj.set('fontWeight', isBold ? 'normal' : 'bold');
            boldBtn.classList.toggle('active');
            canvas.renderAll();
            saveHistory();
        }
    });

    italicBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            const isItalic = activeObj.fontStyle === 'italic';
            activeObj.set('fontStyle', isItalic ? 'normal' : 'italic');
            italicBtn.classList.toggle('active');
            canvas.renderAll();
            saveHistory();
        }
    });

    // --- Save/Load/Export ---
    const STORAGE_KEY = 'artify_design_v1';

    saveBtn.addEventListener('click', () => {
        const json = JSON.stringify(canvas.toJSON());
        localStorage.setItem(STORAGE_KEY, json);
        
        // Visual feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
        }, 2000);
    });

    loadBtn.addEventListener('click', () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            canvas.loadFromJSON(json, () => {
                canvas.renderAll();
                // Reset history
                history = [];
                isHistoryAction = false;
                saveHistory();
                updatePropertiesPanel();
            });
            
            // Visual feedback
            const originalText = loadBtn.innerHTML;
            loadBtn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded';
            setTimeout(() => {
                loadBtn.innerHTML = originalText;
            }, 2000);
        } else {
            alert('No saved design found in this browser.');
        }
    });

    downloadBtn.addEventListener('click', () => {
        // Deselect objects to avoid showing bounding boxes
        canvas.discardActiveObject();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2 // High resolution export
        });

        const link = document.createElement('a');
        link.download = 'artify-design.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initial button state
    updateHistoryButtons();
    updatePropertiesPanel();
});
