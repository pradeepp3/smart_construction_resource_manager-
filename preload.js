const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Authentication
    auth: {
        login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
        logout: () => ipcRenderer.invoke('auth:logout'),
        getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
    },

    // Projects
    projects: {
        getAll: () => ipcRenderer.invoke('projects:getAll'),
        create: (projectData) => ipcRenderer.invoke('projects:create', projectData),
        getById: (projectId) => ipcRenderer.invoke('projects:getById', projectId),
        update: (projectId, updates) => ipcRenderer.invoke('projects:update', projectId, updates),
        delete: (projectId) => ipcRenderer.invoke('projects:delete', projectId)
    },

    // Labour
    labour: {
        getAll: (projectId) => ipcRenderer.invoke('labour:getAll', projectId),
        create: (workerData) => ipcRenderer.invoke('labour:create', workerData),
        update: (workerId, updates) => ipcRenderer.invoke('labour:update', workerId, updates),
        delete: (workerId) => ipcRenderer.invoke('labour:delete', workerId)
    },

    // Materials
    materials: {
        getAll: (projectId) => ipcRenderer.invoke('materials:getAll', projectId),
        create: (materialData) => ipcRenderer.invoke('materials:create', materialData),
        update: (materialId, updates) => ipcRenderer.invoke('materials:update', materialId, updates),
        delete: (materialId) => ipcRenderer.invoke('materials:delete', materialId)
    },

    // Equipment
    equipment: {
        getAll: (projectId) => ipcRenderer.invoke('equipment:getAll', projectId),
        create: (equipmentData) => ipcRenderer.invoke('equipment:create', equipmentData),
        update: (equipmentId, updates) => ipcRenderer.invoke('equipment:update', equipmentId, updates),
        delete: (equipmentId) => ipcRenderer.invoke('equipment:delete', equipmentId)
    },

    // Finance
    finance: {
        getSummary: (projectId) => ipcRenderer.invoke('finance:getSummary', projectId),
        getExpenses: (projectId) => ipcRenderer.invoke('finance:getExpenses', projectId),
        createExpense: (expenseData) => ipcRenderer.invoke('finance:createExpense', expenseData)
    },

    // Settings
    settings: {
        getConfig: () => ipcRenderer.invoke('settings:getConfig'),
        updateConfig: (updates) => ipcRenderer.invoke('settings:updateConfig', updates),
        selectDbPath: () => ipcRenderer.invoke('settings:selectDbPath'),
        onDbSwitched: (callback) => ipcRenderer.on('db:switched', (event, data) => callback(data))
    }
});
