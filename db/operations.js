const { getDatabase } = require('./connection');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

function toNumber(value, fallback = 0) {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(num) ? num : fallback;
}

function sanitizeProjectPayload(data = {}) {
    const payload = { ...data };

    if ('budget' in payload) payload.budget = toNumber(payload.budget);

    if ('budgetBreakdown' in payload) {
        const breakdown = payload.budgetBreakdown || {};
        payload.budgetBreakdown = {
            labour: toNumber(breakdown.labour),
            materials: toNumber(breakdown.materials),
            equipment: toNumber(breakdown.equipment),
            other: toNumber(breakdown.other)
        };
    }

    return payload;
}

function sanitizeWorkerPayload(data = {}) {
    const payload = { ...data };
    if ('dailyWage' in payload) payload.dailyWage = toNumber(payload.dailyWage);
    if ('daysWorked' in payload) payload.daysWorked = toNumber(payload.daysWorked);
    if ('sqftRate' in payload) payload.sqftRate = toNumber(payload.sqftRate);
    if ('sqftArea' in payload) payload.sqftArea = toNumber(payload.sqftArea);
    if ('totalCost' in payload) payload.totalCost = toNumber(payload.totalCost);
    if ('totalCapital' in payload) payload.totalCapital = toNumber(payload.totalCapital);
    return payload;
}

function sanitizeMaterialPayload(data = {}) {
    const payload = { ...data };
    if ('quantity' in payload) payload.quantity = toNumber(payload.quantity);
    if ('unitPrice' in payload) payload.unitPrice = toNumber(payload.unitPrice);
    if ('totalCost' in payload) payload.totalCost = toNumber(payload.totalCost);
    return payload;
}

function sanitizeEquipmentPayload(data = {}) {
    const payload = { ...data };
    if ('totalCost' in payload) payload.totalCost = toNumber(payload.totalCost);
    if ('rentalRate' in payload) payload.rentalRate = toNumber(payload.rentalRate);
    return payload;
}

function normalizeProject(project) {
    if (!project) return null;
    const breakdown = project.budgetBreakdown || {};
    return {
        ...project,
        _id: project._id.toString(),
        budget: toNumber(project.budget),
        budgetBreakdown: {
            labour: toNumber(breakdown.labour),
            materials: toNumber(breakdown.materials),
            equipment: toNumber(breakdown.equipment),
            other: toNumber(breakdown.other)
        }
    };
}

function normalizeWorker(worker) {
    if (!worker) return null;
    return {
        ...worker,
        _id: worker._id.toString(),
        dailyWage: toNumber(worker.dailyWage),
        daysWorked: toNumber(worker.daysWorked),
        sqftRate: toNumber(worker.sqftRate),
        sqftArea: toNumber(worker.sqftArea),
        totalCost: toNumber(worker.totalCost),
        totalCapital: toNumber(worker.totalCapital)
    };
}

function normalizeMaterial(material) {
    if (!material) return null;
    return {
        ...material,
        _id: material._id.toString(),
        quantity: toNumber(material.quantity),
        unitPrice: toNumber(material.unitPrice),
        totalCost: toNumber(material.totalCost)
    };
}

function normalizeEquipment(item) {
    if (!item) return null;
    return {
        ...item,
        _id: item._id.toString(),
        totalCost: toNumber(item.totalCost),
        rentalRate: toNumber(item.rentalRate)
    };
}

function normalizeExpense(expense) {
    if (!expense) return null;
    return {
        ...expense,
        _id: expense._id.toString(),
        amount: toNumber(expense.amount)
    };
}

// ==================== AUTHENTICATION ====================

async function authenticateUser(credentials) {
    const db = getDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ username: credentials.username });

    if (!user) return null;

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    return isMatch ? user : null;
}

// ==================== PROJECTS ====================

async function getAllProjects() {
    const db = getDatabase();
    const projects = db.collection('projects');
    const results = await projects.find({}).toArray();
    return results.map(normalizeProject);
}

async function createProject(projectData) {
    const db = getDatabase();
    const projects = db.collection('projects');

    const newProject = {
        ...sanitizeProjectPayload(projectData),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await projects.insertOne(newProject);
    return normalizeProject({ ...newProject, _id: result.insertedId });
}

async function getProjectById(projectId) {
    const db = getDatabase();
    const projects = db.collection('projects');

    try {
        const id = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
        const project = await projects.findOne({ _id: id });
        return normalizeProject(project);
    } catch (error) {
        const project = await projects.findOne({ _id: projectId });
        return normalizeProject(project);
    }
}

async function updateProject(projectId, updates) {
    const db = getDatabase();
    const projects = db.collection('projects');

    try {
        const id = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
        const sanitizedUpdates = sanitizeProjectPayload(updates);
        await projects.updateOne(
            { _id: id },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        return await getProjectById(projectId);
    } catch (error) {
        const sanitizedUpdates = sanitizeProjectPayload(updates);
        await projects.updateOne(
            { _id: projectId },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
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
    return results.map(normalizeWorker);
}

async function createWorker(workerData) {
    const db = getDatabase();
    const workers = db.collection('workers');

    const newWorker = {
        ...sanitizeWorkerPayload(workerData),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await workers.insertOne(newWorker);
    return normalizeWorker({ ...newWorker, _id: result.insertedId });
}

async function updateWorker(workerId, updates) {
    const db = getDatabase();
    const workers = db.collection('workers');

    try {
        const id = typeof workerId === 'string' ? new ObjectId(workerId) : workerId;
        const sanitizedUpdates = sanitizeWorkerPayload(updates);
        await workers.updateOne(
            { _id: id },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await workers.findOne({ _id: id });
        return normalizeWorker(updated);
    } catch (error) {
        const sanitizedUpdates = sanitizeWorkerPayload(updates);
        await workers.updateOne(
            { _id: workerId },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await workers.findOne({ _id: workerId });
        return normalizeWorker(updated);
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
    return results.map(normalizeMaterial);
}

async function createMaterial(materialData) {
    const db = getDatabase();
    const materials = db.collection('materials');

    const newMaterial = {
        ...sanitizeMaterialPayload(materialData),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await materials.insertOne(newMaterial);
    return normalizeMaterial({ ...newMaterial, _id: result.insertedId });
}

async function updateMaterial(materialId, updates) {
    const db = getDatabase();
    const materials = db.collection('materials');

    try {
        const id = typeof materialId === 'string' ? new ObjectId(materialId) : materialId;
        const sanitizedUpdates = sanitizeMaterialPayload(updates);
        await materials.updateOne(
            { _id: id },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await materials.findOne({ _id: id });
        return normalizeMaterial(updated);
    } catch (error) {
        const sanitizedUpdates = sanitizeMaterialPayload(updates);
        await materials.updateOne(
            { _id: materialId },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await materials.findOne({ _id: materialId });
        return normalizeMaterial(updated);
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
    return results.map(normalizeEquipment);
}

async function createEquipment(equipmentData) {
    const db = getDatabase();
    const equipment = db.collection('equipment');

    const newEquipment = {
        ...sanitizeEquipmentPayload(equipmentData),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await equipment.insertOne(newEquipment);
    return normalizeEquipment({ ...newEquipment, _id: result.insertedId });
}

async function updateEquipment(equipmentId, updates) {
    const db = getDatabase();
    const equipment = db.collection('equipment');

    try {
        const id = typeof equipmentId === 'string' ? new ObjectId(equipmentId) : equipmentId;
        const sanitizedUpdates = sanitizeEquipmentPayload(updates);
        await equipment.updateOne(
            { _id: id },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await equipment.findOne({ _id: id });
        return normalizeEquipment(updated);
    } catch (error) {
        const sanitizedUpdates = sanitizeEquipmentPayload(updates);
        await equipment.updateOne(
            { _id: equipmentId },
            { $set: { ...sanitizedUpdates, updatedAt: new Date() } }
        );
        const updated = await equipment.findOne({ _id: equipmentId });
        return normalizeEquipment(updated);
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
    const results = await expenses.find({ projectId }).toArray();
    return results.map(normalizeExpense);
}

async function createExpense(expenseData) {
    const db = getDatabase();
    const expenses = db.collection('expenses');

    const newExpense = {
        ...expenseData,
        amount: toNumber(expenseData.amount),
        createdAt: new Date()
    };

    const result = await expenses.insertOne(newExpense);
    return normalizeExpense({ ...newExpense, _id: result.insertedId });
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

// ==================== ELECTRICIAN MEMBERS ====================

async function getElectricianMembers(workerId) {
    const db = getDatabase();
    const members = db.collection('electrician_members');
    const results = await members.find({ workerId }).sort({ createdAt: 1 }).toArray();
    return results.map(m => ({
        ...m,
        _id: m._id.toString()
    }));
}

async function addElectricianMember(memberData) {
    const db = getDatabase();
    const members = db.collection('electrician_members');
    const newMember = { ...memberData, createdAt: new Date() };
    const result = await members.insertOne(newMember);
    return { ...newMember, _id: result.insertedId.toString() };
}

async function deleteElectricianMember(memberId) {
    const db = getDatabase();
    const members = db.collection('electrician_members');
    const payments = db.collection('electrician_payments');
    try {
        const id = typeof memberId === 'string' ? new ObjectId(memberId) : memberId;
        // Cascade delete all payments for this member
        await payments.deleteMany({ memberId: memberId });
        await members.deleteOne({ _id: id });
    } catch (error) {
        await payments.deleteMany({ memberId: memberId });
        await members.deleteOne({ _id: memberId });
    }
}

// ==================== ELECTRICIAN WEEKLY PAYMENTS ====================

async function getElectricianPayments(memberId) {
    const db = getDatabase();
    const payments = db.collection('electrician_payments');
    const results = await payments.find({ memberId }).sort({ createdAt: 1 }).toArray();
    return results.map(p => ({
        ...p,
        _id: p._id.toString()
    }));
}

async function addElectricianPayment(paymentData) {
    const db = getDatabase();
    const payments = db.collection('electrician_payments');
    const newPayment = { ...paymentData, createdAt: new Date() };
    const result = await payments.insertOne(newPayment);
    return { ...newPayment, _id: result.insertedId.toString() };
}

async function deleteElectricianPayment(paymentId) {
    const db = getDatabase();
    const payments = db.collection('electrician_payments');
    try {
        const id = typeof paymentId === 'string' ? new ObjectId(paymentId) : paymentId;
        await payments.deleteOne({ _id: id });
    } catch (error) {
        await payments.deleteOne({ _id: paymentId });
    }
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
    updateConfiguration,
    getElectricianMembers,
    addElectricianMember,
    deleteElectricianMember,
    getElectricianPayments,
    addElectricianPayment,
    deleteElectricianPayment
};
