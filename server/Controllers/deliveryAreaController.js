import asyncHandler from 'express-async-handler';
import DeliveryArea from '../Models/DeliveryArea.js';

export const getDeliveryAreas = asyncHandler(async (req, res) => {
  const areas = await DeliveryArea.find({}).sort({ wilaya: 1 });
  const formattedAreas = areas.map(area => ({
    id: area._id,
    wilaya: area.wilaya,
    priceHome: area.priceHome,
    priceDesk: area.priceDesk,
    desks: area.desks && area.desks.length > 0 ? area.desks : [], 
  }));

  res.json({
    areas: formattedAreas,
  });
});


export const createDeliveryArea = asyncHandler(async (req, res) => {
  const { wilaya, priceHome = 600, priceDesk = 700, desks = [] } = req.body;

  if (!wilaya ) {
    res.status(400);
    throw new Error("Wilaya is required");
  }

  const exists = await DeliveryArea.findOne({

    wilaya: wilaya.trim(),
  });

  if (exists) {
    res.status(400);
    throw new Error(`This wilaya already exists `);
  }

  const area = await DeliveryArea.create({
    wilaya: wilaya.trim(),

    priceHome: Number(priceHome),
    priceDesk: Number(priceDesk),
    desks, 
  });

  res.status(201).json(area);
});


export const updateDeliveryArea = asyncHandler(async (req, res) => {
  const area = await DeliveryArea.findById(req.params.id);
  if (!area) {
    res.status(404);
    throw new Error("Delivery area not found");
  }

  // Only allow updating these fields
  const { priceHome, priceDesk, desks } = req.body;
  if (priceHome !== undefined) area.priceHome = Number(priceHome);
  if (priceDesk !== undefined) area.priceDesk = Number(priceDesk);
  if (desks !== undefined) area.desks = desks;

  await area.save();
  res.json(area);
});


export const deleteDeliveryArea = asyncHandler(async (req, res) => {
  const area = await DeliveryArea.findById(req.params.id);
  if (!area) {
    res.status(404);
    throw new Error("Delivery area not found");
  }

  await area.deleteOne();
  res.json({ message: "Delivery area removed" });
});

