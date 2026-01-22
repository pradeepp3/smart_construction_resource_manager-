const { getDatabase } = require('./connection');
const { ObjectId } = require('mongodb');

// ==================== AUTHENTICATION ====================

async function authenticateUser(credentials) {
    const db = getDatabase();
    const users = db.collection('users');

    const user = await users.findOne({
        username: credentials.username,
        password: credentials.password // In production, use bcrypt
    });

    return user;
}

// ==================== PROJECTS ====================

async function getAllProjects() {
    const db = getDatabase();
    const projects = db.collection('projects');
    const results = await projects.find({}).toArray();
    return results.map(project => ({
        ...project,
        _id: project._id.toString()
    }));
}

async function createProject(projectData) {
    const db = getDatabase();
    const projects = db.collection('projects');

    const newProject = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await projects.insertOne(newProject);
    return { ...newProject, _id: result.insertedId.toString() };
}

async function getProjectById(projectId) {
    const db = getDatabase();
    const projects = db.collection('projects');

    try {
        const id = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
        const project = await projects.findOne({ _id: id });
        return project ? { ...project, _id: project._id.toString() } : null;
    } catch (error) {
        const project = await projects.findOne({ _id: projectId });
        return project ? { ...project, _id: project._id.toString() } : null;
    }
}

async function updateProject(projectId, updates) {
    const db = getDatabase();
    const projects = db.collection('projects');

    try {
        const id = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
        await projects.updateOne(
            { _id: id },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        return await getProjectById(projectId);
    } catch (error) {
        await projects.updateOne(
            { _id: projectId },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        return await getProjectById(projectId);
    }
}

async function deleteProject(projectId) {
    const db = getDatabase();
    const projects = db.collection('projects');

    try {
        const id = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
        await projects.deleteOne({ _id: id });
    } catch (error) {
        await projects.deleteOne({ _id: projectId });
    }
}

// ==================== LABOUR/WORKERS ====================

async function getAllWorkers(projectId) {
    const db = getDatabase();
    const workers = db.collection('workers');
    const results = await workers.find({ projectId }).toArray();
    return results.map(worker => ({
        ...worker,
        _id: worker._id.toString()
    }));
}

async function createWorker(workerData) {
    const db = getDatabase();
    const workers = db.collection('workers');

    const newWorker = {
        ...workerData,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await workers.insertOne(newWorker);
    return { ...newWorker, _id: result.insertedId.toString() };
}

async function updateWorker(workerId, updates) {
    const db = getDatabase();
    const workers = db.collection('workers');

    try {
        const id = typeof workerId === 'string' ? new ObjectId(workerId) : workerId;
        await workers.updateOne(
            { _id: id },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await workers.findOne({ _id: id });
        return { ...updated, _id: updated._id.toString() };
    } catch (error) {
        await workers.updateOne(
            { _id: workerId },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await workers.findOne({ _id: workerId });
        return { ...updated, _id: updated._id.toString() };
    }
}

async function deleteWorker(workerId) {
    const db = getDatabase();
    const workers = db.collection('workers');

    try {
        const id = typeof workerId === 'string' ? new ObjectId(workerId) : workerId;
        await workers.deleteOne({ _id: id });
    } catch (error) {
        await workers.deleteOne({ _id: workerId });
    }
}

// ==================== MATERIALS ====================

async function getAllMaterials(projectId) {
    const db = getDatabase();
    const materials = db.collection('materials');
    const results = await materials.find({ projectId }).toArray();
    return results.map(material => ({
        ...material,
        _id: material._id.toString()
    }));
}

async function createMaterial(materialData) {
    const db = getDatabase();
    const materials = db.collection('materials');

    const newMaterial = {
        ...materialData,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await materials.insertOne(newMaterial);
    return { ...newMaterial, _id: result.insertedId.toString() };
}

async function updateMaterial(materialId, updates) {
    const db = getDatabase();
    const materials = db.collection('materials');

    try {
        const id = typeof materialId === 'string' ? new ObjectId(materialId) : materialId;
        await materials.updateOne(
            { _id: id },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await materials.findOne({ _id: id });
        return { ...updated, _id: updated._id.toString() };
    } catch (error) {
        await materials.updateOne(
            { _id: materialId },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await materials.findOne({ _id: materialId });
        return { ...updated, _id: updated._id.toString() };
    }
}

async function deleteMaterial(materialId) {
    const db = getDatabase();
    const materials = db.collection('materials');

    try {
        const id = typeof materialId === 'string' ? new ObjectId(materialId) : materialId;
        await materials.deleteOne({ _id: id });
    } catch (error) {
        await materials.deleteOne({ _id: materialId });
    }
}

// ==================== EQUIPMENT ====================

async function getAllEquipment(projectId) {
    const db = getDatabase();
    const equipment = db.collection('equipment');
    const results = await equipment.find({ projectId }).toArray();
    return results.map(item => ({
        ...item,
        _id: item._id.toString()
    }));
}

async function createEquipment(equipmentData) {
    const db = getDatabase();
    const equipment = db.collection('equipment');

    const newEquipment = {
        ...equipmentData,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await equipment.insertOne(newEquipment);
    return { ...newEquipment, _id: result.insertedId.toString() };
}

async function updateEquipment(equipmentId, updates) {
    const db = getDatabase();
    const equipment = db.collection('equipment');

    try {
        const id = typeof equipmentId === 'string' ? new ObjectId(equipmentId) : equipmentId;
        await equipment.updateOne(
            { _id: id },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await equipment.findOne({ _id: id });
        return { ...updated, _id: updated._id.toString() };
    } catch (error) {
        await equipment.updateOne(
            { _id: equipmentId },
            { $set: { ...updates, updatedAt: new Date() } }
        );
        const updated = await equipment.findOne({ _id: equipmentId });
        return { ...updated, _id: updated._id.toString() };
    }
}

async function deleteEquipment(equipmentId) {
    const db = getDatabase();
    const equipment = db.collection('equipment');

    try {
        const id = typeof equipmentId === 'string' ? new ObjectId(equipmentId) : equipmentId;
        await equipment.deleteOne({ _id: id });
    } catch (error) {
        await equipment.deleteOne({ _id: equipmentId });
    }
}

// ==================== FINANCE ====================

async function getAllExpenses(projectId) {
    const db = getDatabase();
    const expenses = db.collection('expenses');
    return await expenses.find({ projectId }).toArray();
}

async function createExpense(expenseData) {
    const db = getDatabase();
    const expenses = db.collection('expenses');

    const newExpense = {
        ...expenseData,
        createdAt: new Date()
    };

    const result = await expenses.insertOne(newExpense);
    return { ...newExpense, _id: result.insertedId };
}

async function getFinancialSummary(projectId) {
    const db = getDatabase();

    // Get all workers for labour costs
    const workers = await getAllWorkers(projectId);
    const labourCost = workers.reduce((sum, w) => {
        const cost = w.totalCost || ((w.dailyWage || 0) * (w.daysWorked || 0));
        return sum + (parseFloat(cost) || 0);
    }, 0);

    // Get all materials
    const materials = await getAllMaterials(projectId);
    const materialCost = materials.reduce((sum, m) => sum + (parseFloat(m.totalCost) || 0), 0);

    // Get all equipment
    const equipment = await getAllEquipment(projectId);
    const equipmentCost = equipment.reduce((sum, e) => sum + (parseFloat(e.totalCost) || 0), 0);

    // Get other expenses
    const expenses = await getAllExpenses(projectId);
    const otherExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    return {
        labourCost,
        materialCost,
        equipmentCost,
        otherExpenses,
        totalCost: labourCost + materialCost + equipmentCost + otherExpenses
    };
}

// ==================== CONFIGURATION ====================

async function getConfiguration() {
    const db = getDatabase();
    const config = db.collection('config');

    let cfg = await config.findOne({ type: 'app-config' });

    if (!cfg) {
        cfg = {
            type: 'app-config',
            dbPath: '',
            theme: 'dark',
            createdAt: new Date()
        };
        await config.insertOne(cfg);
    }

    return cfg;
}

async function updateConfiguration(updates) {
    const db = getDatabase();
    const config = db.collection('config');

    await config.updateOne(
        { type: 'app-config' },
        { $set: { ...updates, updatedAt: new Date() } },
        { upsert: true }
    );

    return await getConfiguration();
}

module.exports = {
    authenticateUser,
    getAllProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getAllWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    getAllMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getAllEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getAllExpenses,
    createExpense,
    getFinancialSummary,
    getConfiguration,
    updateConfiguration
};
