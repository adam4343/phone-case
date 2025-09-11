// import { db } from "..";
// import { color } from "../schema/colors.schema";
// import { material, model } from "../schema/phone-case.schema";

// export async function seedDatabase() {
//   console.log('Starting database seeding...');

//   try {
//     // Clear existing data (optional - remove if you want to keep existing data)
//     await db.delete(color);
//     await db.delete(model);
//     await db.delete(material);
    
//     console.log('Cleared existing data');

//     // Seed colors
//     const colorsData = [
//       { name: 'Lavender', hex: '#e8d8f3' },
//       { name: 'Sage', hex: '#B9C69B' },
//       { name: 'Mist Blue', hex: '#A7BDDD' },
//       { name: 'White', hex: '#FFFFFF' },
//       { name: 'Black', hex: '#3F4346' }
//     ];

//     const insertedColors = await db.insert(color).values(colorsData).returning();
//     console.log(`Seeded ${insertedColors.length} colors`);

//     // Seed models
//     const modelsData = [
//       { name: 'iPhone 13', year: 2021, price: 2 },
//       { name: 'iPhone 14', year: 2022, price: 3 },
//       { name: 'iPhone 14 Pro', year: 2022, price: 4 },
//       { name: 'iPhone 15', year: 2023, price: 4 },
//       { name: 'iPhone 15 Pro', year: 2023, price: 5 },
//       { name: 'iPhone 16', year: 2024, price: 5 },
//       { name: 'iPhone 16 Pro', year: 2024, price: 6 },
//       { name: 'iPhone 17', year: 2025, price: 6 },
//       { name: 'iPhone 17 Pro', year: 2025, price: 7 }
//     ];

//     const insertedModels = await db.insert(model).values(modelsData).returning();
//     console.log(`Seeded ${insertedModels.length} models`);

//     // Seed materials
//     const materialsData = [
//       { 
//         name: 'Silicone', 
//         description: 'Basic silicone material', 
//         price: 0 
//       },
//       { 
//         name: 'Soft Polycarbonate', 
//         description: 'Scratch-resistant coating', 
//         price: 3 
//       },
//       { 
//         name: 'Leather', 
//         description: 'Premium look, durable, can be heavy', 
//         price: 5 
//       }
//     ];

//     const insertedMaterials = await db.insert(material).values(materialsData).returning();
//     console.log(`Seeded ${insertedMaterials.length} materials`);

//     console.log('Database seeding completed successfully!');
    
//     return {
//       colors: insertedColors,
//       models: insertedModels,
//       materials: insertedMaterials
//     };

//   } catch (error) {
//     console.error('Error seeding database:', error);
//     throw error;
//   }
// }

// // Alternative version that preserves existing data (doesn't clear tables)
// export async function seedDatabaseSafe() {
//   console.log('Starting safe database seeding (preserving existing data)...');

//   try {
//     // Check if data already exists
//     const existingColors = await db.select().from(color).limit(1);
//     const existingModels = await db.select().from(model).limit(1);
//     const existingMaterials = await db.select().from(material).limit(1);

//     let insertedColors = [];
//     let insertedModels = [];
//     let insertedMaterials = [];

//     // Seed colors only if none exist
//     if (existingColors.length === 0) {
//       const colorsData = [
//         { name: 'Lavender', hex: '#e8d8f3' },
//         { name: 'Sage', hex: '#B9C69B' },
//         { name: 'Mist Blue', hex: '#A7BDDD' },
//         { name: 'White', hex: '#FFFFFF' },
//         { name: 'Black', hex: '#3F4346' }
//       ];

//       insertedColors = await db.insert(color).values(colorsData).returning();
//       console.log(`Seeded ${insertedColors.length} colors`);
//     } else {
//       console.log('Colors already exist, skipping...');
//     }

//     // Seed models only if none exist
//     if (existingModels.length === 0) {
//       const modelsData = [
//         { name: 'iPhone 13', year: 2021, price: 2 },
//         { name: 'iPhone 14', year: 2022, price: 3 },
//         { name: 'iPhone 14 Pro', year: 2022, price: 4 },
//         { name: 'iPhone 15', year: 2023, price: 4 },
//         { name: 'iPhone 15 Pro', year: 2023, price: 5 },
//         { name: 'iPhone 16', year: 2024, price: 5 },
//         { name: 'iPhone 16 Pro', year: 2024, price: 6 },
//         { name: 'iPhone 17', year: 2025, price: 6 },
//         { name: 'iPhone 17 Pro', year: 2025, price: 7 }
//       ];

//       insertedModels = await db.insert(model).values(modelsData).returning();
//       console.log(`Seeded ${insertedModels.length} models`);
//     } else {
//       console.log('Models already exist, skipping...');
//     }

//     // Seed materials only if none exist
//     if (existingMaterials.length === 0) {
//       const materialsData = [
//         { 
//           name: 'Silicone', 
//           description: 'Basic silicone material', 
//           price: 0 
//         },
//         { 
//           name: 'Soft Polycarbonate', 
//           description: 'Scratch-resistant coating', 
//           price: 3 
//         },
//         { 
//           name: 'Leather', 
//           description: 'Premium look, durable, can be heavy', 
//           price: 5 
//         }
//       ];

//       insertedMaterials = await db.insert(material).values(materialsData).returning();
//       console.log(`Seeded ${insertedMaterials.length} materials`);
//     } else {
//       console.log('Materials already exist, skipping...');
//     }

//     console.log('Safe database seeding completed successfully!');
    
//     return {
//       colors: insertedColors,
//       models: insertedModels,
//       materials: insertedMaterials
//     };

//   } catch (error) {
//     console.error('Error seeding database:', error);
//     throw error;
//   }
// }

// Usage example:
// await seedDatabase(); // Clears existing data and seeds fresh
// await seedDatabaseSafe(); // Only seeds if tables are empty