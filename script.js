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
    const groupBtn = document.getElementById('groupBtn');
    const ungroupBtn = document.getElementById('ungroupBtn');
    const duplicateBtn = document.getElementById('duplicateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const bringFwdBtn = document.getElementById('bringFwdBtn');
    const bringToFrontBtn = document.getElementById('bringToFrontBtn');
    const sendBackBtn = document.getElementById('sendBackBtn');
    const sendToBackBtn = document.getElementById('sendToBackBtn');
    
    // Alignment Actions
    const alignLeftBtn = document.getElementById('alignLeftBtn');
    const alignCenterXBtn = document.getElementById('alignCenterXBtn');
    const alignRightBtn = document.getElementById('alignRightBtn');
    const alignTopBtn = document.getElementById('alignTopBtn');
    const alignCenterYBtn = document.getElementById('alignCenterYBtn');
    const alignBottomBtn = document.getElementById('alignBottomBtn');
    
    // Theme & Export & Zoom
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const exportDropdownBtn = document.getElementById('exportDropdownBtn');
    const exportDropdownContent = document.getElementById('exportDropdownContent');
    const exportPng = document.getElementById('exportPng');
    const exportJpeg = document.getElementById('exportJpeg');
    const exportSvg = document.getElementById('exportSvg');
    
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomDisplay = document.getElementById('zoomDisplay');
    const panModeBtn = document.getElementById('panModeBtn');
    
    // Properties Panels
    const panelTitle = document.getElementById('panelTitle');
    const canvasProps = document.getElementById('canvasProps');
    const objectProps = document.getElementById('objectProps');
    const strokeProperties = document.getElementById('strokeProperties');
    const imageProperties = document.getElementById('imageProperties');
    
    // Brush Settings
    const brushSettingsSection = document.getElementById('brushSettingsSection');
    const brushType = document.getElementById('brushType');
    const brushColor = document.getElementById('brushColor');
    const brushColorHexValue = document.getElementById('brushColorHexValue');
    const brushSizeSlider = document.getElementById('brushSizeSlider');
    const brushSizeDisplay = document.getElementById('brushSizeDisplay');
    
    // Canvas Properties
    const bgColor = document.getElementById('bgColor');
    const bgHexValue = document.getElementById('bgHexValue');
    const canvasWidth = document.getElementById('canvasWidth');
    const canvasHeight = document.getElementById('canvasHeight');
    
    // Object Properties
    const fillColorGroup = document.getElementById('fillColorGroup');
    const fillColor = document.getElementById('fillColor');
    const hexValue = document.getElementById('hexValue');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValueDisplay = document.getElementById('opacityValueDisplay');
    
    // Stroke Properties
    const strokeColor = document.getElementById('strokeColor');
    const strokeHexValue = document.getElementById('strokeHexValue');
    const strokeWidthSlider = document.getElementById('strokeWidthSlider');
    const strokeWidthValue = document.getElementById('strokeWidthValue');
    const strokeDashStyle = document.getElementById('strokeDashStyle');
    
    // Font Properties
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const alignTextLeft = document.getElementById('alignTextLeft');
    const alignTextCenter = document.getElementById('alignTextCenter');
    const alignTextRight = document.getElementById('alignTextRight');
    const alignTextJustify = document.getElementById('alignTextJustify');
    const charSpacing = document.getElementById('charSpacing');
    
    // Image Filter Elements
    const filterGrayscale = document.getElementById('filterGrayscale');
    const filterSepia = document.getElementById('filterSepia');
    const filterInvert = document.getElementById('filterInvert');
    const filterVintage = document.getElementById('filterVintage');
    const filterBlur = document.getElementById('filterBlur');
    const blurVal = document.getElementById('blurVal');
    
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

    // --- Zoom & Pan Logic ---
    let isPanning = false;
    let isPanMode = false;
    let isSpacePressed = false;
    let lastPosX, lastPosY;

    // Update Zoom display
    function updateZoomDisplay() {
        const zoom = Math.round(canvas.getZoom() * 100);
        zoomDisplay.textContent = `${zoom}%`;
    }

    // Zoom Functions
    function zoomTo(newZoom, point) {
        // Clamp zoom between 10% and 500%
        newZoom = Math.max(0.1, Math.min(5.0, newZoom));
        
        if (point) {
            canvas.zoomToPoint(point, newZoom);
        } else {
            const center = canvas.getVpCenter();
            canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
        }
        updateZoomDisplay();
    }

    // Ctrl+Wheel Zoom at Pointer
    canvas.on('mouse:wheel', function(opt) {
        if (opt.e.ctrlKey) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
            zoomTo(zoom, point);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        }
    });

    // Zoom Buttons
    zoomInBtn.addEventListener('click', () => {
        zoomTo(canvas.getZoom() + 0.1);
    });

    zoomOutBtn.addEventListener('click', () => {
        zoomTo(canvas.getZoom() - 0.1);
    });

    zoomResetBtn.addEventListener('click', () => {
        canvas.setZoom(1.0);
        const vpt = canvas.viewportTransform;
        vpt[4] = 0;
        vpt[5] = 0;
        canvas.requestRenderAll();
        updateZoomDisplay();
    });

    // Pan Mode Button Toggle
    panModeBtn.addEventListener('click', () => {
        isPanMode = !isPanMode;
        panModeBtn.classList.toggle('active', isPanMode);
        if (isPanMode) {
            canvas.defaultCursor = 'grab';
            canvas.selection = false;
            canvas.discardActiveObject().renderAll();
        } else {
            canvas.defaultCursor = 'default';
            canvas.selection = true;
        }
    });

    // Canvas Panning Events
    canvas.on('mouse:down', function(opt) {
        const e = opt.e;
        if (isPanMode || isSpacePressed) {
            isPanning = true;
            canvas.defaultCursor = 'grabbing';
            canvas.discardActiveObject().renderAll();
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
    });

    canvas.on('mouse:move', function(opt) {
        if (isPanning) {
            const e = opt.e;
            const vpt = canvas.viewportTransform;
            vpt[4] += e.clientX - lastPosX;
            vpt[5] += e.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
    });

    canvas.on('mouse:up', function() {
        if (isPanning) {
            isPanning = false;
            canvas.defaultCursor = (isPanMode || isSpacePressed) ? 'grab' : 'default';
        }
    });

    // --- Helper Functions ---
    function centerObject(obj) {
        canvas.add(obj);
        canvas.centerObject(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
    }

    function updatePropertiesPanel() {
        const activeObj = canvas.getActiveObject();
        
        // Handle Group / Ungroup visibility
        if (activeObj && activeObj.type === 'activeSelection') {
            groupBtn.style.display = 'inline-block';
            ungroupBtn.style.display = 'none';
        } else if (activeObj && activeObj.type === 'group') {
            groupBtn.style.display = 'none';
            ungroupBtn.style.display = 'inline-block';
        } else {
            groupBtn.style.display = 'none';
            ungroupBtn.style.display = 'none';
        }
        
        if (activeObj) {
            panelTitle.textContent = 'Object Properties';
            canvasProps.style.display = 'none';
            objectProps.style.display = 'block';
            
            // Sync Fill Color
            if (activeObj.fill) {
                let color = typeof activeObj.fill === 'string' ? activeObj.fill : '#000000';
                if(activeObj.type === 'line' && activeObj.stroke) {
                    color = activeObj.stroke;
                }
                fillColor.value = color.length === 7 ? color : '#000000';
                hexValue.textContent = fillColor.value.toUpperCase();
            }

            // Sync Opacity
            if (activeObj.opacity !== undefined) {
                opacitySlider.value = activeObj.opacity;
                opacityValueDisplay.textContent = Math.round(activeObj.opacity * 100);
            }

            // Sync Stroke properties
            if (activeObj.type !== 'image') {
                strokeProperties.style.display = 'block';
                if (activeObj.stroke) {
                    strokeColor.value = activeObj.stroke.length === 7 ? activeObj.stroke : '#000000';
                    strokeHexValue.textContent = strokeColor.value.toUpperCase();
                } else {
                    strokeColor.value = '#000000';
                    strokeHexValue.textContent = '#000000';
                }
                strokeWidthSlider.value = activeObj.strokeWidth || 0;
                strokeWidthValue.textContent = activeObj.strokeWidth || 0;
                
                if (activeObj.strokeDashArray) {
                    const dash = activeObj.strokeDashArray[0];
                    if (dash === 10) strokeDashStyle.value = 'dashed';
                    else if (dash === 2) strokeDashStyle.value = 'dotted';
                    else strokeDashStyle.value = 'solid';
                } else {
                    strokeDashStyle.value = 'solid';
                }
            } else {
                strokeProperties.style.display = 'none';
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

                if (activeObj.underline) underlineBtn.classList.add('active');
                else underlineBtn.classList.remove('active');

                if (activeObj.linethrough) strikeBtn.classList.add('active');
                else strikeBtn.classList.remove('active');

                // Align Text buttons
                const currentAlign = activeObj.textAlign || 'left';
                alignTextLeft.classList.toggle('active', currentAlign === 'left');
                alignTextCenter.classList.toggle('active', currentAlign === 'center');
                alignTextRight.classList.toggle('active', currentAlign === 'right');
                alignTextJustify.classList.toggle('active', currentAlign === 'justify');

                charSpacing.value = activeObj.charSpacing || 0;
            } else {
                textProperties.style.display = 'none';
            }

            // Image Properties & Filter Sync
            if (activeObj.type === 'image') {
                imageProperties.style.display = 'block';
                fillColorGroup.style.display = 'none';
                
                const getFilterIndex = (type) => {
                    if (!activeObj.filters) return -1;
                    return activeObj.filters.findIndex(f => f && f.type.toLowerCase() === type.toLowerCase());
                };

                const grayscaleIdx = getFilterIndex('grayscale');
                const sepiaIdx = getFilterIndex('sepia');
                const invertIdx = getFilterIndex('invert');
                const vintageIdx = getFilterIndex('vintage');
                const blurIdx = getFilterIndex('blur');

                filterGrayscale.classList.toggle('active', grayscaleIdx > -1);
                filterSepia.classList.toggle('active', sepiaIdx > -1);
                filterInvert.classList.toggle('active', invertIdx > -1);
                filterVintage.classList.toggle('active', vintageIdx > -1);

                if (blurIdx > -1) {
                    const blurValNum = activeObj.filters[blurIdx].blur || 0;
                    filterBlur.value = Math.round(blurValNum * 20); // Scale up float 0-1 to slider scale
                    blurVal.textContent = Math.round(blurValNum * 20);
                } else {
                    filterBlur.value = 0;
                    blurVal.textContent = 0;
                }
            } else {
                imageProperties.style.display = 'none';
                fillColorGroup.style.display = 'block';
            }
        } else {
            panelTitle.textContent = 'Canvas Properties';
            canvasProps.style.display = 'block';
            objectProps.style.display = 'none';
            
            // Sync Canvas Properties
            bgColor.value = canvas.backgroundColor === '#ffffff' || !canvas.backgroundColor ? '#ffffff' : canvas.backgroundColor;
            bgHexValue.textContent = bgColor.value.toUpperCase();
            canvasWidth.value = canvas.width;
            canvasHeight.value = canvas.height;
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

    function setDrawingBrush() {
        const type = brushType.value;
        const color = brushColor.value;
        const width = parseInt(brushSizeSlider.value, 10);
        
        if (type === 'Pencil') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        } else if (type === 'Spray') {
            canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
        } else if (type === 'Circle') {
            canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
        }
        
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = width;
    }

    drawModeBtn.addEventListener('click', () => {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        if (canvas.isDrawingMode) {
            drawModeBtn.classList.add('active');
            setDrawingBrush();
            canvas.discardActiveObject();
            canvas.renderAll();
            brushSettingsSection.style.display = 'block';
        } else {
            drawModeBtn.classList.remove('active');
            brushSettingsSection.style.display = 'none';
        }
    });

    brushType.addEventListener('change', () => {
        if (canvas.isDrawingMode) {
            setDrawingBrush();
        }
    });

    brushColor.addEventListener('input', (e) => {
        const val = e.target.value;
        brushColorHexValue.textContent = val.toUpperCase();
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.color = val;
        }
    });

    brushSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        brushSizeDisplay.textContent = size;
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.width = parseInt(size, 10);
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

    function duplicate() {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        activeObject.clone((cloned) => {
            canvas.discardActiveObject();
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20,
                evented: true,
            });
            
            if (cloned.type === 'activeSelection') {
                cloned.canvas = canvas;
                cloned.forEachObject((obj) => {
                    canvas.add(obj);
                });
                cloned.setCoords();
            } else {
                canvas.add(cloned);
            }
            
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            saveHistory();
        });
    }

    duplicateBtn.addEventListener('click', duplicate);

    function groupObjects() {
        if (!canvas.getActiveObject()) return;
        if (canvas.getActiveObject().type !== 'activeSelection') return;
        
        canvas.getActiveObject().toGroup();
        canvas.requestRenderAll();
        saveHistory();
        updatePropertiesPanel();
    }

    function ungroupObjects() {
        if (!canvas.getActiveObject()) return;
        if (canvas.getActiveObject().type !== 'group') return;
        
        canvas.getActiveObject().toActiveSelection();
        canvas.requestRenderAll();
        saveHistory();
        updatePropertiesPanel();
    }

    groupBtn.addEventListener('click', groupObjects);
    ungroupBtn.addEventListener('click', ungroupObjects);

    deleteBtn.addEventListener('click', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach((obj) => {
                canvas.remove(obj);
            });
        }
    });

    // Keyboard support for delete, duplicate, group, ungroup, zoom, pan, undo, redo
    window.addEventListener('keydown', (e) => {
        // Prevent keyboard shortcuts if editing text
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        // Undo (Ctrl+Z)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            undo();
            return;
        }

        // Redo (Ctrl+Y)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            redo();
            return;
        }

        // Delete / Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length) {
                canvas.discardActiveObject();
                activeObjects.forEach((obj) => {
                    canvas.remove(obj);
                });
            }
        }
        
        // Ctrl+D or Cmd+D for duplicate
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            duplicate();
        }

        // Ctrl+G or Cmd+G for group / ungroup
        if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
            e.preventDefault();
            if (e.shiftKey) {
                ungroupObjects();
            } else {
                groupObjects();
            }
        }

        // Ctrl + (Zoom In)
        if ((e.ctrlKey || e.metaKey) && e.key === '=') {
            e.preventDefault();
            zoomTo(canvas.getZoom() + 0.1);
        }

        // Ctrl - (Zoom Out)
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomTo(canvas.getZoom() - 0.1);
        }

        // Ctrl 0 (Reset Zoom)
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            zoomResetBtn.click();
        }

        // Spacebar for panning
        if (e.code === 'Space') {
            const activeEl = document.activeElement;
            const isEditingInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA');
            if (!isEditingInput) {
                e.preventDefault();
                isSpacePressed = true;
                canvas.defaultCursor = 'grab';
                canvas.selection = false;
                panModeBtn.classList.add('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            if (!isPanMode) {
                canvas.defaultCursor = 'default';
                canvas.selection = true;
                panModeBtn.classList.remove('active');
            } else {
                canvas.defaultCursor = 'grab';
            }
        }
    });

    bringFwdBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.bringForward(activeObj);
            saveHistory();
        }
    });

    bringToFrontBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.bringToFront(activeObj);
            canvas.renderAll();
            saveHistory();
        }
    });

    sendBackBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.sendBackwards(activeObj);
            saveHistory();
        }
    });

    sendToBackBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.sendToBack(activeObj);
            canvas.renderAll();
            saveHistory();
        }
    });

    // Object Alignment Functions
    function alignObject(direction) {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const bound = activeObj.getBoundingRect();

        switch (direction) {
            case 'left':
                activeObj.set({ left: activeObj.left - bound.left });
                break;
            case 'centerX':
                canvas.centerObjectH(activeObj);
                break;
            case 'right':
                activeObj.set({ left: activeObj.left + (canvasWidth - (bound.left + bound.width)) });
                break;
            case 'top':
                activeObj.set({ top: activeObj.top - bound.top });
                break;
            case 'centerY':
                canvas.centerObjectV(activeObj);
                break;
            case 'bottom':
                activeObj.set({ top: activeObj.top + (canvasHeight - (bound.top + bound.height)) });
                break;
        }
        activeObj.setCoords();
        canvas.renderAll();
        saveHistory();
    }

    alignLeftBtn.addEventListener('click', () => alignObject('left'));
    alignCenterXBtn.addEventListener('click', () => alignObject('centerX'));
    alignRightBtn.addEventListener('click', () => alignObject('right'));
    alignTopBtn.addEventListener('click', () => alignObject('top'));
    alignCenterYBtn.addEventListener('click', () => alignObject('centerY'));
    alignBottomBtn.addEventListener('click', () => alignObject('bottom'));

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            history = [];
            historyIndex = -1;
            saveHistory();
        }
    });

    // --- Canvas Properties Logic ---
    bgColor.addEventListener('input', (e) => {
        const color = e.target.value;
        bgHexValue.textContent = color.toUpperCase();
        canvas.backgroundColor = color;
        canvas.renderAll();
    });
    
    bgColor.addEventListener('change', () => {
        saveHistory();
    });

    canvasWidth.addEventListener('change', (e) => {
        let width = parseInt(e.target.value, 10);
        if (width < 100) width = 100;
        canvas.setWidth(width);
        saveHistory();
    });

    canvasHeight.addEventListener('change', (e) => {
        let height = parseInt(e.target.value, 10);
        if (height < 100) height = 100;
        canvas.setHeight(height);
        saveHistory();
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

    // --- Stroke Properties Logic ---
    strokeColor.addEventListener('input', (e) => {
        const val = e.target.value;
        strokeHexValue.textContent = val.toUpperCase();
        const activeObjects = canvas.getActiveObjects();
        let changed = false;
        activeObjects.forEach(obj => {
            if (obj.type !== 'image') {
                obj.set('stroke', val);
                changed = true;
            }
        });
        if (changed) {
            canvas.renderAll();
        }
    });

    strokeColor.addEventListener('change', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            saveHistory();
        }
    });

    strokeWidthSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        strokeWidthValue.textContent = val;
        const activeObjects = canvas.getActiveObjects();
        let changed = false;
        activeObjects.forEach(obj => {
            if (obj.type !== 'image') {
                obj.set('strokeWidth', val);
                changed = true;
            }
        });
        if (changed) {
            canvas.renderAll();
        }
    });

    strokeWidthSlider.addEventListener('change', () => {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            saveHistory();
        }
    });

    strokeDashStyle.addEventListener('change', (e) => {
        const style = e.target.value;
        const activeObjects = canvas.getActiveObjects();
        let changed = false;
        activeObjects.forEach(obj => {
            if (obj.type !== 'image') {
                let dashArray = null;
                if (style === 'dashed') {
                    dashArray = [10, 5];
                } else if (style === 'dotted') {
                    dashArray = [2, 4];
                }
                obj.set('strokeDashArray', dashArray);
                changed = true;
            }
        });
        if (changed) {
            canvas.renderAll();
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

    // --- Enhanced Text Properties Logic ---
    underlineBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            const isUnderline = activeObj.underline;
            activeObj.set('underline', !isUnderline);
            underlineBtn.classList.toggle('active', !isUnderline);
            canvas.renderAll();
            saveHistory();
        }
    });

    strikeBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            const isStrike = activeObj.linethrough;
            activeObj.set('linethrough', !isStrike);
            strikeBtn.classList.toggle('active', !isStrike);
            canvas.renderAll();
            saveHistory();
        }
    });

    function setTextAlignment(align) {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('textAlign', align);
            
            alignTextLeft.classList.toggle('active', align === 'left');
            alignTextCenter.classList.toggle('active', align === 'center');
            alignTextRight.classList.toggle('active', align === 'right');
            alignTextJustify.classList.toggle('active', align === 'justify');
            
            canvas.renderAll();
            saveHistory();
        }
    }

    alignTextLeft.addEventListener('click', () => setTextAlignment('left'));
    alignTextCenter.addEventListener('click', () => setTextAlignment('center'));
    alignTextRight.addEventListener('click', () => setTextAlignment('right'));
    alignTextJustify.addEventListener('click', () => setTextAlignment('justify'));

    charSpacing.addEventListener('change', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('charSpacing', parseInt(e.target.value, 10));
            canvas.renderAll();
            saveHistory();
        }
    });

    // --- Image Filters Logic ---
    filterGrayscale.addEventListener('click', () => {
        toggleImageFilter('grayscale', new fabric.Image.filters.Grayscale());
    });

    filterSepia.addEventListener('click', () => {
        toggleImageFilter('sepia', new fabric.Image.filters.Sepia());
    });

    filterInvert.addEventListener('click', () => {
        toggleImageFilter('invert', new fabric.Image.filters.Invert());
    });

    filterVintage.addEventListener('click', () => {
        toggleImageFilter('vintage', new fabric.Image.filters.Vintage());
    });

    filterBlur.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        blurVal.textContent = val;
        applyBlurFilter(val);
    });

    filterBlur.addEventListener('change', () => {
        saveHistory();
    });

    function toggleImageFilter(filterType, filterInstance) {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') return;
        
        const filterIdx = activeObj.filters.findIndex(f => f && f.type.toLowerCase() === filterType.toLowerCase());
        if (filterIdx > -1) {
            activeObj.filters.splice(filterIdx, 1);
        } else {
            activeObj.filters.push(filterInstance);
        }
        activeObj.applyFilters();
        canvas.renderAll();
        saveHistory();
        updatePropertiesPanel();
    }

    function applyBlurFilter(val) {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') return;
        
        const filterIdx = activeObj.filters.findIndex(f => f && f.type.toLowerCase() === 'blur');
        if (val === 0) {
            if (filterIdx > -1) {
                activeObj.filters.splice(filterIdx, 1);
            }
        } else {
            const blurValFloat = val / 20;
            if (filterIdx > -1) {
                activeObj.filters[filterIdx].blur = blurValFloat;
            } else {
                activeObj.filters.push(new fabric.Image.filters.Blur({ blur: blurValFloat }));
            }
        }
        activeObj.applyFilters();
        canvas.renderAll();
    }

    // --- Save/Load/Export ---
    const STORAGE_KEY = 'artify_design_v1';
    
    // Theme switch logic
    const currentTheme = localStorage.getItem('artify_theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('artify_theme', isDark ? 'dark' : 'light');
        themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

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

    // Dropdown toggle
    exportDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('#exportDropdownBtn') && !e.target.closest('#exportDropdownBtn')) {
            exportDropdownContent.classList.remove('show');
        }
    });

    function downloadFile(url, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportPng.addEventListener('click', (e) => {
        e.preventDefault();
        exportDropdownContent.classList.remove('show');
        canvas.discardActiveObject().renderAll();
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2 // High resolution export
        });
        downloadFile(dataURL, 'artify-design.png');
    });

    exportJpeg.addEventListener('click', (e) => {
        e.preventDefault();
        exportDropdownContent.classList.remove('show');
        canvas.discardActiveObject().renderAll();
        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.95,
            multiplier: 2 // High resolution export
        });
        downloadFile(dataURL, 'artify-design.jpg');
    });

    exportSvg.addEventListener('click', (e) => {
        e.preventDefault();
        exportDropdownContent.classList.remove('show');
        canvas.discardActiveObject().renderAll();
        const svgData = canvas.toSVG();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadFile(url, 'artify-design.svg');
    });

    // Initial button state
    updateHistoryButtons();
    updatePropertiesPanel();
});
