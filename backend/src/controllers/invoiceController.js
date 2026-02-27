import Invoice from '../models/Invoice.js';

export const getInvoicesByCase = async (req, res) => {
    try {
        const caseId = req.query.caseId;
        const filter = { createdBy: req.user._id };
        if (caseId) filter.caseId = caseId;
        const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const { caseId, clientName, amount, hourlyRate, hours, description, dueDate } = req.body;

        if (!caseId) return res.status(400).json({ message: 'caseId is required' });
        if (!amount) return res.status(400).json({ message: 'Amount is required' });

        const count = await Invoice.countDocuments();
        const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}-${new Date().getFullYear()}`;

        const invoice = await Invoice.create({
            caseId,
            clientName: clientName || 'Client',
            invoiceNumber,
            amount: parseFloat(amount),
            hourlyRate: parseFloat(hourlyRate) || 0,
            hours: parseFloat(hours) || 0,
            description,
            dueDate: dueDate || undefined,
            status: 'Draft',
            createdBy: req.user._id,
        });

        console.log("Saving Invoice with createdBy:", req.user._id);

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { status: req.body.status },
            { returnDocument: 'after' }
        );
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
