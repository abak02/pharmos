// const { db } = require('@vercel/postgres');
// const {
//     medicineList
//   } = require('../app/lib/medicine-data_updated.js');
//   const { v4: uuidv4 } = require('uuid');

// //  console.log(medicineList);
//   async function seedMedicineList(client) {
//     try {
//       await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//       // Create the "users" table if it doesn't exist
//       const createTable = await client.sql`
//         CREATE TABLE IF NOT EXISTS medicinelist (
//           id UUID PRIMARY KEY,
//           brandname VARCHAR(255),
//           genericname TEXT,
//           nameofthemanufacturer VARCHAR(255),
//           strength TEXT,
//           dosagedescription VARCHAR(255),
//           price VARCHAR(255),  
//           dar VARCHAR(255) NOT NULL,
//           usefor VARCHAR(255)
//         );
//       `;
  
//       console.log(`Created "medicinelist" table`);
  
//       // Insert data into the "users" table
//       const insertedMedicine = await Promise.all(
//         medicineList.map(async (medicine) => {
        
//           return client.sql`
//           INSERT INTO medicinelist (id, brandname, genericname, nameofthemanufacturer,strength,dosagedescription, price,dar,usefor)
//           VALUES (${medicine.id}, ${medicine.brandName}, ${medicine.genericName}, ${medicine.nameOfTheManufacturer},${medicine.strength},${medicine.dosageDescription}, ${medicine.price},${medicine.DAR},${medicine.useFor})
//           ON CONFLICT (id) DO NOTHING;
//         `;
//         }),
//       );
  
//       console.log(`Seeded ${insertedMedicine.length} medicines`);
  
//       return {
//         createTable,
//         medicinelist: insertedMedicine,
//       };
//     } catch (error) {
//       console.error('Error seeding medicinelist:', error);
//       throw error;
//     }
//   }
  

//   async function main() {
//     const client = await db.connect();
  
//     await seedMedicineList(client);
  
  
//     await client.end();
//   }
  
//   main().catch((err) => {
//     console.error(
//       'An error occurred while attempting to seed the database:',
//       err,
//     );
//   });
  


// const { db } = require('@vercel/postgres');
// const {
//     medicineList
// } = require('../app/lib/medicine-data_updated.js');

// async function seedMedicineList(client) {
//     try {
//         await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        
//         // Create the table if it doesn't exist
//         const createTable = await client.sql`
//             CREATE TABLE IF NOT EXISTS medicinelist (
//                 id UUID PRIMARY KEY,
//                 brandname VARCHAR(255),
//                 genericname TEXT,
//                 nameofthemanufacturer VARCHAR(255),
//                 strength TEXT,
//                 dosagedescription VARCHAR(255),
//                 price VARCHAR(255),  
//                 dar VARCHAR(255) NOT NULL,
//                 usefor VARCHAR(255)
//             );
//         `;

//         console.log(`Created "medicinelist" table`);

//         // Insert or update data
//         const insertedMedicine = await Promise.all(
//             medicineList.map(async (medicine) => {
//                 return client.sql`
//                     INSERT INTO medicinelist (id, brandname, genericname, nameofthemanufacturer, strength, dosagedescription, price, dar, usefor)
//                     VALUES (${medicine.id}, ${medicine.brandName}, ${medicine.genericName}, ${medicine.nameOfTheManufacturer}, ${medicine.strength}, ${medicine.dosageDescription}, ${medicine.price}, ${medicine.DAR}, ${medicine.useFor})
//                     ON CONFLICT (id) DO UPDATE SET
//                         brandname = EXCLUDED.brandname,
//                         genericname = EXCLUDED.genericname,
//                         nameofthemanufacturer = EXCLUDED.nameofthemanufacturer,
//                         strength = EXCLUDED.strength,
//                         dosagedescription = EXCLUDED.dosagedescription,
//                         price = EXCLUDED.price,
//                         dar = EXCLUDED.dar,
//                         usefor = EXCLUDED.usefor;
//                 `;
//             }),
//         );

//         console.log(`Processed ${insertedMedicine.length} medicines (inserted new or updated existing)`);

//         return {
//             createTable,
//             medicinelist: insertedMedicine,
//         };
//     } catch (error) {
//         console.error('Error seeding medicinelist:', error);
//         throw error;
//     }
// }

// async function main() {
//     const client = await db.connect();
//     await seedMedicineList(client);
//     await client.end();
// }

// main().catch((err) => {
//     console.error(
//         'An error occurred while attempting to seed the database:',
//         err,
//     );
// });

// const { db } = require('@vercel/postgres');

// async function seedMedicineList(client) {
//   try {
//     const { medicineList } = require('../app/lib/medicine-data_updated.js');
    
//     console.log('Medicine data loaded:', medicineList.length, 'records');

//     await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
//     // Create the table
//     const createTable = await client.sql`
//       CREATE TABLE IF NOT EXISTS medicinelist (
//         id UUID PRIMARY KEY,
//         brandname VARCHAR(255),
//         genericname TEXT,
//         nameofthemanufacturer VARCHAR(255),
//         strength TEXT,
//         dosagedescription VARCHAR(255),
//         price VARCHAR(255),  
//         dar VARCHAR(255) NOT NULL,
//         usefor VARCHAR(255)
//       );
//     `;
//     console.log('Created "medicinelist" table');

//     // Use much smaller batches with delays
//     const batchSize = 100; // Reduced from 500
//     let successfulInserts = 0;
//     let failedInserts = 0;

//     for (let i = 0; i < medicineList.length; i += batchSize) {
//       const batch = medicineList.slice(i, i + batchSize);
      
//       console.log(`Processing batch ${Math.floor(i/batchSize) + 1} (records ${i} to ${i + batch.length - 1})`);
      
//       try {
//         const batchResults = await Promise.all(
//           batch.map(async (medicine) => {
//             try {
//               const result = await client.sql`
//                 INSERT INTO medicinelist (id, brandname, genericname, nameofthemanufacturer, strength, dosagedescription, price, dar, usefor)
//                 VALUES (${medicine.id}, ${medicine.brandName}, ${medicine.genericName}, ${medicine.nameOfTheManufacturer}, ${medicine.strength}, ${medicine.dosageDescription}, ${medicine.price}, ${medicine.DAR}, ${medicine.useFor})
//                 ON CONFLICT (id) DO UPDATE SET
//                   brandname = EXCLUDED.brandname,
//                   genericname = EXCLUDED.genericname,
//                   nameofthemanufacturer = EXCLUDED.nameofthemanufacturer,
//                   strength = EXCLUDED.strength,
//                   dosagedescription = EXCLUDED.dosagedescription,
//                   price = EXCLUDED.price,
//                   dar = EXCLUDED.dar,
//                   usefor = EXCLUDED.usefor;
//               `;
//               return { success: true, result };
//             } catch (error) {
//               console.error(`Error inserting medicine ${medicine.id}:`, error.message);
//               return { success: false, error };
//             }
//           })
//         );

//         const successfulBatch = batchResults.filter(result => result.success);
//         successfulInserts += successfulBatch.length;
//         failedInserts += batchResults.length - successfulBatch.length;
        
//         console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${successfulBatch.length}/${batch.length} successful`);
        
//         // Add delay between batches to prevent timeouts
//         if (i + batchSize < medicineList.length) {
//           console.log('Waiting 1 second before next batch...');
//           await new Promise(resolve => setTimeout(resolve, 1000));
//         }
        
//       } catch (batchError) {
//         console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, batchError.message);
//         failedInserts += batch.length;
//       }
//     }

//     console.log(`Seeding completed: ${successfulInserts} successful, ${failedInserts} failed out of ${medicineList.length} total`);

//     return {
//       createTable,
//       successfulInserts,
//       failedInserts,
//       totalMedicines: medicineList.length
//     };
//   } catch (error) {
//     console.error('Error in seedMedicineList:', error);
//     throw error;
//   }
// }

// async function main() {
//   let client;
//   try {
//     client = await db.connect();
//     await seedMedicineList(client);
//   } catch (err) {
//     console.error('Seeding failed:', err);
//   } finally {
//     if (client) {
//       await client.end();
//     }
//   }
// }

// main();


const { db } = require('@vercel/postgres');

async function upsertMedicineData() {
  const { medicineList } = require('../app/lib/medicines_with_manufacturer_ids.js');
  
  // Resume logic - change this to continue from where it failed
  const startIndex = 0; // Set this to the last successful index + 1
  const batchSize = 100; // Process 100 records at a time
  const delayBetweenBatches = 1000; // 1 second delay between batches
  
  const remainingMedicines = medicineList.slice(startIndex);
  
  console.log(`Starting from record ${startIndex}`);
  console.log(`Total records: ${medicineList.length}`);
  console.log(`Remaining records: ${remainingMedicines.length}`);
  console.log(`Batch size: ${batchSize}`);

  const client = await db.connect();
  
  try {
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalFailed = 0;
    
    // Process in batches
    for (let batchStart = 0; batchStart < remainingMedicines.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, remainingMedicines.length);
      const batch = remainingMedicines.slice(batchStart, batchEnd);
      const absoluteBatchStart = startIndex + batchStart;
      
      console.log(`\nProcessing batch ${Math.floor(batchStart/batchSize) + 1}: records ${absoluteBatchStart} to ${absoluteBatchStart + batch.length - 1}`);
      
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchFailed = 0;
      
      // Process each record in the current batch
      for (let i = 0; i < batch.length; i++) {
        const medicine = batch[i];
        const absoluteIndex = absoluteBatchStart + i;
        
        try {
          // Make sure all required fields are present and handle null/undefined values
          const result = await client.sql`
            INSERT INTO medicinelist (
              id, manufacturer_id, brandname, genericname, 
              strength, dosagedescription, price, dar, usefor
            )
            VALUES (
              ${medicine.id}, 
              ${medicine.manufacturer_id || null}, 
              ${medicine.brandname || null}, 
              ${medicine.genericname || null}, 
              ${medicine.strength || null}, 
              ${medicine.dosagedescription || null}, 
              ${medicine.price || 0}, 
              ${medicine.DAR || medicine.dar || null}, 
              ${medicine.usefor || medicine.useFor || null}
            )
            ON CONFLICT (id) DO UPDATE SET
              manufacturer_id = EXCLUDED.manufacturer_id,
              brandname = EXCLUDED.brandname,
              genericname = EXCLUDED.genericname,
              strength = EXCLUDED.strength,
              dosagedescription = EXCLUDED.dosagedescription,
              price = EXCLUDED.price,
              dar = EXCLUDED.dar,
              usefor = EXCLUDED.usefor
            RETURNING xmax::text::int > 0 as was_updated;
          `;
          
          totalProcessed++;
          
          // Check if it was an update or insert
          if (result.rows[0]?.was_updated) {
            totalUpdated++;
            batchUpdated++;
          } else {
            totalInserted++;
            batchInserted++;
          }
          
          // Log progress every 50 records within batch
          if ((i + 1) % 50 === 0) {
            console.log(`  ↳ Progress: ${i + 1}/${batch.length} records in current batch`);
          }
          
        } catch (error) {
          console.error(`❌ Failed record ${absoluteIndex} (${medicine.id}):`, error.message);
          console.error(`  Data:`, {
            id: medicine.id,
            manufacturer_id: medicine.manufacturer_id,
            brandname: medicine.brandname,
            genericname: medicine.genericname
          });
          totalFailed++;
          batchFailed++;
          totalProcessed++;
        }
      }
      
      console.log(`Batch ${Math.floor(batchStart/batchSize) + 1} completed: ${batch.length} processed (${batchInserted} inserted, ${batchUpdated} updated, ${batchFailed} failed)`);
      console.log(`Progress: ${absoluteBatchStart + batch.length}/${medicineList.length} (${Math.round((absoluteBatchStart + batch.length) / medicineList.length * 100)}%)`);
      
      // Save progress checkpoint
      console.log(`💾 Checkpoint: Next start index should be ${absoluteBatchStart + batch.length}`);
      
      // Save checkpoint to file for more robust resume (optional)
      // require('fs').writeFileSync('./checkpoint.txt', (absoluteBatchStart + batch.length).toString());
      
      // Delay between batches to prevent timeout
      if (batchEnd < remainingMedicines.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    console.log('\n🎉 Operation completed!');
    console.log(`📊 Final Results:`);
    console.log(`   Total processed: ${totalProcessed}`);
    console.log(`   New inserts: ${totalInserted}`);
    console.log(`   Updates: ${totalUpdated}`);
    console.log(`   Failed: ${totalFailed}`);
    
    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} records failed. Check the logs above for details.`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await client.release();
  }
}

// Simple checkpoint file reader for resume
function getCheckpoint() {
  try {
    const fs = require('fs');
    if (fs.existsSync('./checkpoint.txt')) {
      const checkpoint = parseInt(fs.readFileSync('./checkpoint.txt', 'utf8'));
      console.log(`📖 Resuming from checkpoint: ${checkpoint}`);
      return checkpoint;
    }
  } catch (error) {
    // Ignore if checkpoint file doesn't exist
  }
  return 0;
}

// Run the function
upsertMedicineData().catch(console.error);