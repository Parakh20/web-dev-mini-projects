class AgentForge {
    constructor() {
        this.blocks = new Map();
        this.connections = [];
        this.nextBlockId = 1;
        this.selectedBlock = null;
        this.isSimulating = false;
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.connectionStart = null;
        
        this.sampleData = {
            "sampleWorkflow": {
                "blocks": [
                    {
                        "id": "crm-1",
                        "type": "data-source",
                        "subtype": "crm",
                        "name": "CRM Data Source",
                        "position": {"x": 100, "y": 200},
                        "config": {
                            "endpoint": "https://api.salesforce.com/customers",
                            "query": "SELECT * FROM Customer WHERE status = 'active'",
                            "authentication": "OAuth2"
                        }
                    },
                    {
                        "id": "llm-1",
                        "type": "action",
                        "subtype": "llm-summary",
                        "name": "LLM Summary",
                        "position": {"x": 350, "y": 200},
                        "config": {
                            "model": "gpt-4",
                            "prompt": "Summarize customer data and identify key insights:",
                            "maxTokens": 150
                        }
                    },
                    {
                        "id": "email-1",
                        "type": "output",
                        "subtype": "send-email",
                        "name": "Send Email",
                        "position": {"x": 600, "y": 200},
                        "config": {
                            "recipients": ["manager@company.com"],
                            "subject": "Customer Insights Report",
                            "template": "Please find the customer analysis: {{summary}}"
                        }
                    }
                ],
                "connections": [
                    {"from": "crm-1", "to": "llm-1"},
                    {"from": "llm-1", "to": "email-1"}
                ]
            },
            "blockTypes": {
                "data-source": {
                    "crm": {"icon": "👥", "name": "CRM", "color": "#3498db"},
                    "database": {"icon": "🗄️", "name": "Database", "color": "#2ecc71"},
                    "api": {"icon": "🔗", "name": "API", "color": "#e74c3c"},
                    "file": {"icon": "📄", "name": "File", "color": "#f39c12"}
                },
                "action": {
                    "llm-summary": {"icon": "🤖", "name": "LLM Summary", "color": "#9b59b6"},
                    "transform": {"icon": "⚙️", "name": "Transform", "color": "#34495e"},
                    "filter": {"icon": "🔍", "name": "Filter", "color": "#16a085"},
                    "validate": {"icon": "✅", "name": "Validate", "color": "#27ae60"}
                },
                "output": {
                    "send-email": {"icon": "📧", "name": "Send Email", "color": "#e67e22"},
                    "save-db": {"icon": "💾", "name": "Save to DB", "color": "#2c3e50"},
                    "report": {"icon": "📊", "name": "Generate Report", "color": "#8e44ad"},
                    "webhook": {"icon": "🔔", "name": "Webhook", "color": "#c0392b"}
                }
            },
            "simulationData": {
                "crmData": [
                    {"id": 1, "name": "John Smith", "email": "john@example.com", "status": "active", "lastOrder": "2025-06-15"},
                    {"id": 2, "name": "Sarah Johnson", "email": "sarah@example.com", "status": "active", "lastOrder": "2025-06-20"},
                    {"id": 3, "name": "Mike Brown", "email": "mike@example.com", "status": "active", "lastOrder": "2025-06-25"}
                ],
                "llmSummary": "Analysis of 3 active customers shows consistent engagement with recent orders. John Smith and Sarah Johnson show strong retention patterns, while Mike Brown represents a recent acquisition. Recommend targeted follow-up campaigns for continued engagement.",
                "emailResult": "Email sent successfully to manager@company.com at 2025-07-03 10:23:45"
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupSVGMarkers();
        this.loadSampleWorkflow();
        this.addLog('info', 'AgentForge initialized - Ready to build workflows');
    }
    
    setupEventListeners() {
        // Component drag and drop
        const componentBlocks = document.querySelectorAll('.component-block');
        componentBlocks.forEach(block => {
            block.addEventListener('dragstart', this.handleComponentDragStart.bind(this));
            block.addEventListener('dragend', this.handleComponentDragEnd.bind(this));
        });
        
        // Canvas drop zone
        const canvas = document.getElementById('canvas');
        canvas.addEventListener('dragover', this.handleCanvasDragOver.bind(this));
        canvas.addEventListener('drop', this.handleCanvasDrop.bind(this));
        
        // Simulation controls
        document.getElementById('runSimulationBtn').addEventListener('click', this.runSimulation.bind(this));
        
        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', this.exportWorkflow.bind(this));
        document.getElementById('importBtn').addEventListener('click', this.importWorkflow.bind(this));
        document.getElementById('fileInput').addEventListener('change', this.handleFileImport.bind(this));
        
        // Canvas controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.setZoom(this.zoomLevel + 0.1));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.setZoom(this.zoomLevel - 0.1));
        document.getElementById('resetZoomBtn').addEventListener('click', () => this.setZoom(1));
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('cancelBtn').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveBlockProperties.bind(this));
        
        // Context menu
        document.addEventListener('click', this.hideContextMenu.bind(this));
        document.getElementById('deleteBlockBtn').addEventListener('click', this.deleteSelectedBlock.bind(this));
        document.getElementById('duplicateBlockBtn').addEventListener('click', this.duplicateSelectedBlock.bind(this));
        
        // Clear logs
        document.getElementById('clearLogsBtn').addEventListener('click', this.clearLogs.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    setupSVGMarkers() {
        const svg = document.getElementById('connectionsLayer');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', 'var(--color-primary)');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }
    
    loadSampleWorkflow() {
        const workflow = this.sampleData.sampleWorkflow;
        
        // Load blocks
        workflow.blocks.forEach(blockData => {
            this.createBlock(blockData);
        });
        
        // Load connections
        workflow.connections.forEach(conn => {
            this.connections.push(conn);
        });
        
        this.updateConnections();
        this.addLog('info', 'Sample workflow loaded successfully');
    }
    
    handleComponentDragStart(e) {
        const type = e.target.dataset.type;
        const subtype = e.target.dataset.subtype;
        
        e.dataTransfer.setData('text/plain', JSON.stringify({ type, subtype }));
        e.dataTransfer.effectAllowed = 'copy';
        
        // Add drag preview
        const dragPreview = e.target.cloneNode(true);
        dragPreview.classList.add('drag-preview');
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 0, 0);
        
        setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
    
    handleComponentDragEnd(e) {
        // Cleanup handled by browser
    }
    
    handleCanvasDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Add drop zone styling
        const canvas = document.getElementById('canvas');
        canvas.classList.add('drop-zone');
    }
    
    handleCanvasDrop(e) {
        e.preventDefault();
        
        const canvas = document.getElementById('canvas');
        canvas.classList.remove('drop-zone');
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.zoomLevel - this.panOffset.x;
            const y = (e.clientY - rect.top) / this.zoomLevel - this.panOffset.y;
            
            this.createBlockFromDrop(data.type, data.subtype, x, y);
        } catch (error) {
            this.addLog('error', 'Failed to create block: ' + error.message);
        }
    }
    
    createBlockFromDrop(type, subtype, x, y) {
        const blockTypes = this.sampleData.blockTypes[type];
        if (!blockTypes || !blockTypes[subtype]) return;
        
        const blockInfo = blockTypes[subtype];
        const blockData = {
            id: `${subtype}-${this.nextBlockId++}`,
            type,
            subtype,
            name: blockInfo.name,
            position: { x, y },
            config: this.getDefaultConfig(type, subtype)
        };
        
        this.createBlock(blockData);
        this.addLog('info', `Created new ${blockInfo.name} block`);
    }
    
    getDefaultConfig(type, subtype) {
        const defaults = {
            'data-source': {
                'crm': { endpoint: '', query: '', authentication: 'API Key' },
                'database': { connectionString: '', query: '', timeout: 30 },
                'api': { url: '', method: 'GET', headers: {} },
                'file': { path: '', format: 'JSON', encoding: 'UTF-8' }
            },
            'action': {
                'llm-summary': { model: 'gpt-4', prompt: '', maxTokens: 150 },
                'transform': { transformType: 'JSON', mapping: {} },
                'filter': { condition: '', operator: 'equals' },
                'validate': { schema: '', required: true }
            },
            'output': {
                'send-email': { recipients: [], subject: '', template: '' },
                'save-db': { table: '', connectionString: '', mode: 'insert' },
                'report': { format: 'PDF', template: '', recipients: [] },
                'webhook': { url: '', method: 'POST', headers: {} }
            }
        };
        
        return defaults[type]?.[subtype] || {};
    }
    
    createBlock(blockData) {
        const blockElement = document.createElement('div');
        blockElement.className = 'workflow-block';
        blockElement.dataset.blockId = blockData.id;
        blockElement.style.left = blockData.position.x + 'px';
        blockElement.style.top = blockData.position.y + 'px';
        
        const blockTypes = this.sampleData.blockTypes[blockData.type];
        const blockInfo = blockTypes[blockData.subtype];
        
        blockElement.innerHTML = `
            <div class="workflow-block__header">
                <span class="workflow-block__icon">${blockInfo.icon}</span>
                <h4 class="workflow-block__title">${blockData.name}</h4>
            </div>
            <div class="workflow-block__body">
                <p class="workflow-block__description">${this.getBlockDescription(blockData)}</p>
            </div>
            <div class="workflow-block__ports">
                ${blockData.type !== 'data-source' ? '<div class="port port--input"></div>' : ''}
                ${blockData.type !== 'output' ? '<div class="port port--output"></div>' : ''}
            </div>
        `;
        
        // Add event listeners
        blockElement.addEventListener('click', () => this.selectBlock(blockData.id));
        blockElement.addEventListener('dblclick', () => this.openBlockProperties(blockData.id));
        blockElement.addEventListener('contextmenu', (e) => this.showContextMenu(e, blockData.id));
        blockElement.addEventListener('mousedown', (e) => this.startBlockDrag(e, blockData.id));
        
        // Add port event listeners
        const ports = blockElement.querySelectorAll('.port');
        ports.forEach(port => {
            port.addEventListener('click', (e) => this.handlePortClick(e, blockData.id, port.classList.contains('port--output')));
        });
        
        document.getElementById('blocksContainer').appendChild(blockElement);
        this.blocks.set(blockData.id, blockData);
    }
    
    getBlockDescription(blockData) {
        const descriptions = {
            'crm': 'Connects to CRM system',
            'database': 'Queries database',
            'api': 'Calls external API',
            'file': 'Reads file data',
            'llm-summary': 'AI text summarization',
            'transform': 'Data transformation',
            'filter': 'Filters data',
            'validate': 'Validates data',
            'send-email': 'Sends email',
            'save-db': 'Saves to database',
            'report': 'Generates report',
            'webhook': 'Sends webhook'
        };
        
        return descriptions[blockData.subtype] || 'Process data';
    }
    
    selectBlock(blockId) {
        // Remove previous selection
        document.querySelectorAll('.workflow-block').forEach(block => {
            block.classList.remove('active');
        });
        
        // Select new block
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('active');
            this.selectedBlock = blockId;
            this.updatePropertiesPanel(blockId);
        }
    }
    
    updatePropertiesPanel(blockId) {
        const blockData = this.blocks.get(blockId);
        if (!blockData) return;
        
        const panel = document.getElementById('propertiesPanel');
        panel.innerHTML = `
            <div class="property-field">
                <label class="form-label">Block Name</label>
                <input type="text" class="form-control" value="${blockData.name}" readonly>
            </div>
            <div class="property-field">
                <label class="form-label">Block Type</label>
                <input type="text" class="form-control" value="${blockData.type}" readonly>
            </div>
            <div class="property-field">
                <label class="form-label">Configuration</label>
                <button class="btn btn--primary btn--full-width" onclick="agentForge.openBlockProperties('${blockId}')">
                    Configure Block
                </button>
            </div>
            <div class="property-field">
                <label class="form-label">Position</label>
                <div style="display: flex; gap: 8px;">
                    <input type="number" class="form-control" value="${Math.round(blockData.position.x)}" readonly>
                    <input type="number" class="form-control" value="${Math.round(blockData.position.y)}" readonly>
                </div>
            </div>
        `;
    }
    
    openBlockProperties(blockId) {
        const blockData = this.blocks.get(blockId);
        if (!blockData) return;
        
        const modal = document.getElementById('propertyModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Configure ${blockData.name}`;
        modalBody.innerHTML = this.generateConfigForm(blockData);
        
        modal.classList.add('show');
        modal.dataset.blockId = blockId;
    }
    
    generateConfigForm(blockData) {
        const config = blockData.config;
        let formHTML = '';
        
        Object.entries(config).forEach(([key, value]) => {
            const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            if (Array.isArray(value)) {
                formHTML += `
                    <div class="form-group">
                        <label class="form-label">${displayKey}</label>
                        <textarea class="form-control" name="${key}" rows="3">${value.join(', ')}</textarea>
                    </div>
                `;
            } else if (typeof value === 'object') {
                formHTML += `
                    <div class="form-group">
                        <label class="form-label">${displayKey}</label>
                        <textarea class="form-control" name="${key}" rows="4">${JSON.stringify(value, null, 2)}</textarea>
                    </div>
                `;
            } else {
                const inputType = typeof value === 'number' ? 'number' : 'text';
                formHTML += `
                    <div class="form-group">
                        <label class="form-label">${displayKey}</label>
                        <input type="${inputType}" class="form-control" name="${key}" value="${value}">
                    </div>
                `;
            }
        });
        
        return formHTML;
    }
    
    saveBlockProperties() {
        const modal = document.getElementById('propertyModal');
        const blockId = modal.dataset.blockId;
        const blockData = this.blocks.get(blockId);
        
        if (!blockData) return;
        
        const form = modal.querySelector('#modalBody');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const key = input.name;
            let value = input.value;
            
            // Parse JSON for object fields
            if (input.tagName === 'TEXTAREA' && (value.startsWith('{') || value.startsWith('['))) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // If parsing fails, treat as array if comma-separated
                    if (value.includes(',')) {
                        value = value.split(',').map(v => v.trim());
                    }
                }
            } else if (input.type === 'number') {
                value = parseFloat(value) || 0;
            } else if (value.includes(',') && Array.isArray(blockData.config[key])) {
                value = value.split(',').map(v => v.trim());
            }
            
            blockData.config[key] = value;
        });
        
        this.blocks.set(blockId, blockData);
        this.closeModal();
        this.updatePropertiesPanel(blockId);
        this.addLog('info', `Updated configuration for ${blockData.name}`);
    }
    
    closeModal() {
        const modal = document.getElementById('propertyModal');
        modal.classList.remove('show');
        delete modal.dataset.blockId;
    }
    
    showContextMenu(e, blockId) {
        e.preventDefault();
        const contextMenu = document.getElementById('contextMenu');
        
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.classList.add('show');
        contextMenu.dataset.blockId = blockId;
    }
    
    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.remove('show');
    }
    
    deleteSelectedBlock() {
        const contextMenu = document.getElementById('contextMenu');
        const blockId = contextMenu.dataset.blockId;
        
        if (blockId) {
            this.deleteBlock(blockId);
        }
        
        this.hideContextMenu();
    }
    
    deleteBlock(blockId) {
        // Remove block element
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.remove();
        }
        
        // Remove from blocks map
        this.blocks.delete(blockId);
        
        // Remove connections
        this.connections = this.connections.filter(conn => 
            conn.from !== blockId && conn.to !== blockId
        );
        
        this.updateConnections();
        this.addLog('info', `Deleted block ${blockId}`);
        
        // Clear properties panel if this block was selected
        if (this.selectedBlock === blockId) {
            this.selectedBlock = null;
            document.getElementById('propertiesPanel').innerHTML = 
                '<p class="properties-empty">Click on a block to configure its properties</p>';
        }
    }
    
    duplicateSelectedBlock() {
        const contextMenu = document.getElementById('contextMenu');
        const blockId = contextMenu.dataset.blockId;
        
        if (blockId) {
            const originalBlock = this.blocks.get(blockId);
            if (originalBlock) {
                const newBlock = {
                    ...originalBlock,
                    id: `${originalBlock.subtype}-${this.nextBlockId++}`,
                    position: {
                        x: originalBlock.position.x + 50,
                        y: originalBlock.position.y + 50
                    }
                };
                
                this.createBlock(newBlock);
                this.addLog('info', `Duplicated block ${originalBlock.name}`);
            }
        }
        
        this.hideContextMenu();
    }
    
    handlePortClick(e, blockId, isOutput) {
        e.stopPropagation();
        
        if (isOutput) {
            this.connectionStart = blockId;
            this.addLog('info', `Started connection from ${blockId}`);
        } else {
            if (this.connectionStart && this.connectionStart !== blockId) {
                this.createConnection(this.connectionStart, blockId);
                this.connectionStart = null;
            }
        }
    }
    
    createConnection(fromId, toId) {
        // Check if connection already exists
        const exists = this.connections.some(conn => 
            conn.from === fromId && conn.to === toId
        );
        
        if (!exists) {
            this.connections.push({ from: fromId, to: toId });
            this.updateConnections();
            this.addLog('info', `Connected ${fromId} to ${toId}`);
        }
    }
    
    updateConnections() {
        const svg = document.getElementById('connectionsLayer');
        
        // Clear existing connections
        const existingLines = svg.querySelectorAll('.connection-line');
        existingLines.forEach(line => line.remove());
        
        // Draw new connections
        this.connections.forEach(conn => {
            const fromBlock = document.querySelector(`[data-block-id="${conn.from}"]`);
            const toBlock = document.querySelector(`[data-block-id="${conn.to}"]`);
            
            if (fromBlock && toBlock) {
                this.drawConnection(fromBlock, toBlock);
            }
        });
    }
    
    drawConnection(fromBlock, toBlock) {
        const svg = document.getElementById('connectionsLayer');
        const fromRect = fromBlock.getBoundingClientRect();
        const toRect = toBlock.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        
        const fromX = fromRect.right - svgRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
        const toX = toRect.left - svgRect.left;
        const toY = toRect.top + toRect.height / 2 - svgRect.top;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (fromX + toX) / 2;
        
        const pathData = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        
        line.setAttribute('d', pathData);
        line.setAttribute('class', 'connection-line');
        
        svg.appendChild(line);
    }
    
    startBlockDrag(e, blockId) {
        if (e.target.classList.contains('port')) return;
        
        this.isDragging = true;
        this.draggedBlock = blockId;
        
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        const rect = blockElement.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        document.addEventListener('mousemove', this.handleBlockDrag.bind(this));
        document.addEventListener('mouseup', this.stopBlockDrag.bind(this));
        
        e.preventDefault();
    }
    
    handleBlockDrag(e) {
        if (!this.isDragging) return;
        
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        
        const x = (e.clientX - rect.left - this.dragOffset.x) / this.zoomLevel;
        const y = (e.clientY - rect.top - this.dragOffset.y) / this.zoomLevel;
        
        const blockElement = document.querySelector(`[data-block-id="${this.draggedBlock}"]`);
        blockElement.style.left = x + 'px';
        blockElement.style.top = y + 'px';
        
        // Update block data
        const blockData = this.blocks.get(this.draggedBlock);
        blockData.position = { x, y };
        this.blocks.set(this.draggedBlock, blockData);
        
        // Update connections
        this.updateConnections();
    }
    
    stopBlockDrag() {
        this.isDragging = false;
        this.draggedBlock = null;
        
        document.removeEventListener('mousemove', this.handleBlockDrag.bind(this));
        document.removeEventListener('mouseup', this.stopBlockDrag.bind(this));
    }
    
    setZoom(level) {
        this.zoomLevel = Math.max(0.1, Math.min(2, level));
        const canvas = document.getElementById('canvas');
        canvas.style.transform = `scale(${this.zoomLevel})`;
        
        this.updateConnections();
    }
    
    async runSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        const statusIndicator = document.getElementById('statusIndicator');
        const progressFill = document.getElementById('progressFill');
        const runBtn = document.getElementById('runSimulationBtn');
        
        statusIndicator.textContent = 'Running...';
        statusIndicator.className = 'status-indicator running';
        runBtn.disabled = true;
        
        this.addLog('info', 'Starting workflow simulation...');
        
        try {
            // Get execution order
            const executionOrder = this.getExecutionOrder();
            
            for (let i = 0; i < executionOrder.length; i++) {
                const blockId = executionOrder[i];
                const progress = ((i + 1) / executionOrder.length) * 100;
                
                progressFill.style.width = progress + '%';
                
                // Highlight current block
                const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
                blockElement.classList.add('executing');
                
                // Simulate processing
                await this.simulateBlockExecution(blockId);
                
                // Remove highlight
                blockElement.classList.remove('executing');
                
                // Add delay between blocks
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            statusIndicator.textContent = 'Completed Successfully';
            statusIndicator.className = 'status-indicator success';
            this.addLog('success', 'Workflow simulation completed successfully');
            
        } catch (error) {
            statusIndicator.textContent = 'Error';
            statusIndicator.className = 'status-indicator error';
            this.addLog('error', 'Simulation failed: ' + error.message);
        } finally {
            this.isSimulating = false;
            runBtn.disabled = false;
            
            // Reset after delay
            setTimeout(() => {
                statusIndicator.textContent = 'Ready';
                statusIndicator.className = 'status-indicator';
                progressFill.style.width = '0%';
            }, 3000);
        }
    }
    
    getExecutionOrder() {
        // Simple topological sort based on connections
        const visited = new Set();
        const order = [];
        
        const visit = (blockId) => {
            if (visited.has(blockId)) return;
            visited.add(blockId);
            
            // Visit dependencies first
            this.connections.forEach(conn => {
                if (conn.to === blockId) {
                    visit(conn.from);
                }
            });
            
            order.push(blockId);
        };
        
        this.blocks.forEach((_, blockId) => visit(blockId));
        return order;
    }
    
    async simulateBlockExecution(blockId) {
        const blockData = this.blocks.get(blockId);
        const simulationDelay = Math.random() * 2000 + 1000; // 1-3 seconds
        
        this.addLog('info', `Executing ${blockData.name}...`);
        
        await new Promise(resolve => setTimeout(resolve, simulationDelay));
        
        // Simulate different outcomes based on block type
        const simulationResults = {
            'crm': () => {
                this.addLog('success', `Retrieved ${this.sampleData.simulationData.crmData.length} customer records`);
                return this.sampleData.simulationData.crmData;
            },
            'llm-summary': () => {
                this.addLog('success', `Generated summary: "${this.sampleData.simulationData.llmSummary.substring(0, 50)}..."`);
                return this.sampleData.simulationData.llmSummary;
            },
            'send-email': () => {
                this.addLog('success', this.sampleData.simulationData.emailResult);
                return 'Email sent successfully';
            }
        };
        
        const result = simulationResults[blockData.subtype];
        if (result) {
            return result();
        } else {
            this.addLog('success', `${blockData.name} executed successfully`);
            return `${blockData.name} result`;
        }
    }
    
    exportWorkflow() {
        const workflow = {
            blocks: Array.from(this.blocks.values()),
            connections: this.connections,
            metadata: {
                exported: new Date().toISOString(),
                version: '1.0'
            }
        };
        
        const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agentforge-workflow.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.addLog('info', 'Workflow exported successfully');
    }
    
    importWorkflow() {
        document.getElementById('fileInput').click();
    }
    
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workflow = JSON.parse(e.target.result);
                this.loadWorkflow(workflow);
                this.addLog('info', 'Workflow imported successfully');
            } catch (error) {
                this.addLog('error', 'Failed to import workflow: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    loadWorkflow(workflow) {
        // Clear existing workflow
        this.blocks.clear();
        this.connections = [];
        document.getElementById('blocksContainer').innerHTML = '';
        
        // Load blocks
        workflow.blocks.forEach(blockData => {
            this.createBlock(blockData);
        });
        
        // Load connections
        this.connections = workflow.connections || [];
        this.updateConnections();
        
        // Update next block ID
        const maxId = Math.max(...workflow.blocks.map(b => {
            const match = b.id.match(/-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
        }));
        this.nextBlockId = maxId + 1;
    }
    
    addLog(type, message) {
        const container = document.getElementById('logsContainer');
        const timestamp = new Date().toLocaleString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-entry--${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        
        container.appendChild(logEntry);
        container.scrollTop = container.scrollHeight;
    }
    
    clearLogs() {
        const container = document.getElementById('logsContainer');
        container.innerHTML = '';
        this.addLog('info', 'Logs cleared');
    }
    
    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedBlock) {
            this.deleteBlock(this.selectedBlock);
        } else if (e.key === 'Escape') {
            this.hideContextMenu();
            this.closeModal();
        }
    }
}

// Initialize the application
const agentForge = new AgentForge();

// Make component blocks draggable
document.querySelectorAll('.component-block').forEach(block => {
    block.draggable = true;
});

// Handle window resize
window.addEventListener('resize', () => {
    agentForge.updateConnections();
});