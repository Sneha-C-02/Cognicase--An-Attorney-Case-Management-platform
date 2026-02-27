import Task from '../models/Task.js';
import { logActivity } from '../utils/activityLogger.js';
export const getTasksByCase = async (req, res) => {
    try {
        const caseId = req.query.caseId || req.params.caseId;
        const filter = { createdBy: req.user._id };
        if (caseId) filter.caseId = caseId;

        const tasks = await Task.find(filter).populate('caseId', 'title').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, caseId, priority, dueDate, description } = req.body;

        if (!title) return res.status(400).json({ message: 'Task title is required.' });

        const taskData = {
            title,
            priority: priority || 'Medium',
            status: 'Todo',
            description,
            dueDate: dueDate || undefined,
            deadline: dueDate || undefined,
            createdBy: req.user._id,
        };

        console.log("Saving Task with createdBy:", req.user._id);

        // Only set caseId if it's a valid non-empty string
        if (caseId && caseId.trim() !== '') {
            taskData.caseId = caseId;
        }

        const task = await Task.create(taskData);

        // Log activity only when associated with a case
        if (taskData.caseId) {
            try {
                await logActivity(task.caseId, 'TASK_ADDED', `New task added: "${task.title}"`, req.user?.name, req.user.id);
            } catch { /* ignore */ }
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
