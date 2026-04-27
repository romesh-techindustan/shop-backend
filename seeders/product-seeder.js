import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sequelize from "../config/database.js";
import Product from "../models/product.model.js";
import "../models/associations.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const productCatalog = {
  "JBL_BOOMBOX.png": {
    name: "JBL Boombox Speaker",
    category: "electronics",
    price: 960,
    stock: 18,
    color: "Black",
  },
  "Copa_Sense.png": {
    name: "Copa Sense Shoes",
    category: "shoes",
    price: 120,
    stock: 30,
    color: "White",
    size: "L",
  },
  "gammaxx-speaker.png": {
    name: "GAMMAXX Speaker",
    category: "electronics",
    price: 370,
    stock: 24,
    color: "Black",
  },
  "joystick.png": {
    name: "HAVIT Gamepad",
    category: "electronics",
    price: 120,
    stock: 88,
    color: "Black",
  },
  "keyboard.png": {
    name: "RGB Gaming Keyboard",
    category: "electronics",
    price: 96,
    stock: 45,
    color: "Black",
  },
  "perfume.png": {
    name: "Luxury Perfume",
    category: "beauty",
    price: 85,
    stock: 36,
  },
  "jacket.png": {
    name: "Quilted Satin Jacket",
    category: "jacket",
    price: 660,
    stock: 20,
    color: "Green",
    size: "L",
  },
  "New-Mercedes-Benz-Gtr.png": {
    name: "Mercedes-Benz GTR Model",
    category: "automotive",
    price: 960,
    stock: 8,
    color: "Silver",
  },
  "bookself.png": {
    name: "Small Bookshelf",
    category: "home",
    price: 360,
    stock: 18,
    color: "Wood",
  },
  "GP11.png": {
    name: "GP11 Shooter USB Gamepad",
    category: "electronics",
    price: 660,
    stock: 30,
    color: "Black",
  },
  "monitor.png": {
    name: "IPS LCD Gaming Monitor",
    category: "electronics",
    price: 1160,
    stock: 17,
    color: "Black",
  },
  "cat.png": {
    name: "Breed Dry Pet Food",
    category: "home",
    price: 100,
    stock: 40,
  },
  "iphone.png": {
    name: "iPhone Smartphone",
    category: "electronics",
    price: 999,
    stock: 25,
    color: "Black",
  },
  "chair.png": {
    name: "Comfort Chair",
    category: "home",
    price: 375,
    stock: 22,
    color: "White",
  },
  "speaker-three.png": {
    name: "Portable Speaker",
    category: "electronics",
    price: 140,
    stock: 32,
    color: "Black",
  },
  "eos-250d.png": {
    name: "Canon EOS 250D Camera",
    category: "electronics",
    price: 700,
    stock: 14,
    color: "Black",
  },
  "ideapad-gaming.png": {
    name: "IdeaPad Gaming Laptop",
    category: "electronics",
    price: 1200,
    stock: 12,
    color: "Black",
  },
  "Light-Gucci-Savoy-medium-duffle-bag.png": {
    name: "Gucci Savoy Duffle Bag",
    category: "accessories",
    price: 960,
    stock: 10,
    color: "Brown",
  },
  "ps5-playstation.png": {
    name: "PlayStation 5 Console",
    category: "electronics",
    price: 500,
    stock: 16,
    color: "White",
  },
  "attractive-woman-wearing-hat-posing.png": {
    name: "Wide Brim Fashion Hat",
    category: "accessories",
    price: 65,
    stock: 26,
    color: "Beige",
  },
  "Light-The-North-Face-x-Gucci-coat.png": {
    name: "The North Face x Gucci Coat",
    category: "jacket",
    price: 960,
    stock: 7,
    color: "Blue",
    size: "L",
  },
};

function titleFromFileName(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function skuFromFileName(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

async function getUploadImages() {
  const files = await fs.readdir(uploadsDir);

  return files.filter((file) => allowedExtensions.has(path.extname(file).toLowerCase()));
}

async function seedProducts() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const imageFiles = await getUploadImages();

  for (const fileName of imageFiles) {
    const catalogProduct = productCatalog[fileName] ?? {};
    const sku = catalogProduct.sku ?? skuFromFileName(fileName);

    const [product, created] = await Product.findOrCreate({
      where: { sku },
      defaults: {
        name: catalogProduct.name ?? titleFromFileName(fileName),
        sku,
        image: `/uploads/${fileName}`,
        description:
          catalogProduct.description ??
          `${catalogProduct.name ?? titleFromFileName(fileName)} from the shop catalog.`,
        price: catalogProduct.price ?? 99,
        stock: catalogProduct.stock ?? 20,
        isActive: true,
        category: catalogProduct.category ?? "accessories",
        color: catalogProduct.color ?? null,
        size: catalogProduct.size ?? null,
      },
    });

    if (!created && product.image !== `/uploads/${fileName}`) {
      await product.update({ image: `/uploads/${fileName}` });
    }

    console.log(`${created ? "Created" : "Skipped"} ${sku}`);
  }

  console.log(`Seeded ${imageFiles.length} product image(s).`);
}

seedProducts()
  .catch((error) => {
    console.error("Product seeder failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
