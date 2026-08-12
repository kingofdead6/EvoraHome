import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User, { normalisePhone } from './Models/User.js';

dotenv.config();

const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Variables d'environnement manquantes: ${missing.join(', ')}`);
  process.exit(1);
}

const email = 'admin@gmail.com';
const telephone = process.env.ADMIN_PHONE || '0540870382';
const password = 'Pwd123456';
const role = 'SUPER_ADMIN';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connecté');

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    if (existingEmail.role !== role) {
      existingEmail.role = role;
      await existingEmail.save();
      console.log(`Mise à jour du rôle de ${email} en ${role}`);
    } else {
      console.log(`Compte existant trouvé pour ${email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const existingPhone = await User.findOne({ telephone: normalisePhone(telephone) });
  if (existingPhone) {
    console.error(`Impossible de créer le compte: le téléphone ${telephone} est déjà utilisé`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const user = new User({
    nom: 'Super Admin',
    telephone,
    email,
    passwordHash: password,
    role,
  });
  await user.save();

  console.log(`Compte créé: ${email} (${role})`);
  console.log(`Téléphone: ${telephone}`);
  console.log(`Mot de passe: ${password}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
