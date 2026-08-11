import asyncHandler from 'express-async-handler';
import Order from '../Models/Order.js';
import nodemailer from 'nodemailer';

export const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    phone,
    customerEmail,
    wilaya,
    address,
    desk,
    deliveryType,
    deliveryPrice,
    items
  } = req.body;

  if (!customerName || !phone || !wilaya || !deliveryType || !items?.length) {
    res.status(400);
    throw new Error('Veuillez remplir tous les champs obligatoires');
  }

  if (deliveryType === 'home' && !address) {
    res.status(400);
    throw new Error('L\'adresse est obligatoire pour la livraison à domicile');
  }

  if (deliveryType === 'desk' && !desk) {
    res.status(400);
    throw new Error('Le point de livraison est obligatoire');
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = subtotal + (deliveryPrice || 0);

  const order = await Order.create({
    customerName: customerName.trim(),
    phone: phone.trim(),
    customerEmail: customerEmail?.trim() || null,
    wilaya,
    address: deliveryType === 'home' ? address?.trim() : null,
    desk: deliveryType === 'desk' ? desk?.trim() : null,
    deliveryType,
    deliveryPrice: deliveryPrice || 0,
    items,
    subtotal,
    totalPrice,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: "Commande passée avec succès ! Nous vous contacterons bientôt.",
    orderId: order._id
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const validStatuses = ['pending', 'confirmed', 'in_delivery', 'reached', 'canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Commande non trouvée" });
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  // Email notification (French only)
  if (order.customerEmail) {
    const statusLabels = {
      pending: "En attente",
      confirmed: "Confirmée",
      in_delivery: "En cours de livraison",
      reached: "Livrée",
      canceled: "Annulée"
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2>Bonjour ${order.customerName},</h2>
        <p>Le statut de votre commande a été mis à jour :</p>
        <h3 style="color: #111;">${statusLabels[status]}</h3>
        <p>Numéro de commande : <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <p>Merci pour votre confiance !</p>
      </div>
    `;

    transporter.sendMail({
      from: `"ShoeLand" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Mise à jour de votre commande #${order._id.toString().slice(-6)}`,
      html
    }).catch(err => console.error("Email error:", err));
  }

  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 })
  res.json(orders);
 
});