import asyncHandler from 'express-async-handler';
import Contact from '../Models/Contact.js';

// @desc    Create new contact message
// @route   POST /api/contact
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Veuillez remplir tous les champs obligatoires');
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim(),
    subject: subject.trim(),
    message: message.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Message envoyé avec succès ! Nous vous répondrons bientôt.",
    contactId: contact._id
  });
});

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    res.status(404);
    throw new Error('Message non trouvé');
  }

  await Contact.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Message supprimé avec succès' });
});