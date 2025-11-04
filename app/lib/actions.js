"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatTimeToLocal } from "./utils";
const { v4: uuidv4 } = require("uuid");
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  status: z.string(),
  discountPercentage: z.string().optional(),
  givenAmount: z.string().optional(),
});

const CreateCustomer = FormSchema.omit({ id: true });

export async function createCustomer(formData) {
  const { customerName, customerEmail } = CreateCustomer.parse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
  });

  const customerId = uuidv4();

  try {
    await sql`
    INSERT INTO customers (id, name, phone_no)
    VALUES (${customerId}, ${customerName}, ${customerEmail})
  `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function createInvoice(formData, selectedMedicines) {

    // Get and validate status with proper error handling
    let getStatus = formData.get('status');
    
    // Safety check - if status is null, determine from payment method
    if (!getStatus) {
        const paymentMethod = formData.get('paymentMethod') || 'cash';
        getStatus = paymentMethod === 'credit' ? 'pending' : 'paid';
    }

    const { customerName, customerEmail, status } = CreateCustomer.parse({
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        status: getStatus,
    });
    
    // Convert to cents and ROUND to integers
    const totalPrice = Math.round(parseFloat(formData.get('totalPrice')) * 100) || 0;
    const discountedPrice = Math.round(parseFloat(formData.get('discountedPrice')) * 100) || 0;
    const discountPercentage = parseFloat(formData.get('discountPercentage')) || 0;
    const givenAmount = Math.round(parseFloat(formData.get('givenAmount')) * 100) || 0;
    const changeAmount = Math.round(parseFloat(formData.get('changeAmount')) * 100) || 0;

    const invoiceId = uuidv4();
    const date = new Date();
    const formattedDateTime = date.toISOString();
    let customerId;

    try {
        // Check if the customer already exists
        const existingCustomer = await sql`
            SELECT id FROM customers WHERE phone_no = ${customerEmail}
        `;

        if (existingCustomer?.rows[0]?.id) {
            customerId = existingCustomer.rows[0].id;
        } else {
            customerId = uuidv4();
            await sql`
                INSERT INTO customers (id, name, phone_no)
                VALUES (${customerId}, ${customerName}, ${customerEmail})
            `;
        }

        // Use the pre-calculated discounted price in cents
        const finalAmount = discountedPrice;

        // Insert invoice details - all values are already in cents
        const discountedAmount = totalPrice - discountedPrice;
        
        await sql`
            INSERT INTO invoices (id, customer_id, date, amount, status, time, discounted_amount, given_amount)
            VALUES (${invoiceId}, ${customerId}, ${formattedDateTime}, ${finalAmount}, ${status}, ${formattedDateTime}, ${discountedAmount}, ${givenAmount})
        `;

        // Process each medicine in the invoice
        for (const medicine of selectedMedicines) {
            const { id, quantity, price, medicineName } = medicine;
            const pricePerUnit = Math.round(parseFloat(price) * 100) || 0; // Convert to cents
            const customerQuantity = parseInt(quantity) || 0;

            // 1. Insert into invoice_medicines table - price in cents
            await sql`
                INSERT INTO invoice_medicines (invoice_id, medicine_id, quantity, price_per_unit)
                VALUES (${invoiceId}, ${id}, ${customerQuantity}, ${pricePerUnit})
            `;

            // 2. Update medicine price in medicinelist table if changed
            const currentMedicine = await sql`
                SELECT price FROM medicinelist WHERE id = ${id}
            `;

            if (currentMedicine.rows.length > 0) {
                const currentPriceInCents = currentMedicine.rows[0].price;
                
                // Check if price has changed (compare in cents)
                if (Math.abs(currentPriceInCents - pricePerUnit) > 1) { // 1 cent difference
                    await sql`
                        UPDATE medicinelist 
                        SET price = ${pricePerUnit} 
                        WHERE id = ${id}
                    `;
                }
            }

            // 3. SMART INVENTORY UPDATE
            const currentInventory = await sql`
                SELECT quantity FROM shopinventory WHERE medicine_id = ${id}
            `;

            if (currentInventory.rows.length > 0) {
                const currentStock = currentInventory.rows[0].quantity;
                
                if (currentStock >= customerQuantity) {
                    const newStock = currentStock - customerQuantity;
                    await sql`
                        UPDATE shopinventory 
                        SET quantity = ${newStock} 
                        WHERE medicine_id = ${id}
                    `;
                } else {
                    await sql`
                        UPDATE shopinventory 
                        SET quantity = 0 
                        WHERE medicine_id = ${id}
                    `;
                }
            } else {
                await sql`
                    INSERT INTO shopinventory (medicine_id, quantity)
                    VALUES (${id}, 0)
                `;
            }
        }

        // Revalidate the invoices page
        revalidatePath('/dashboard/invoices');
        
        // Return success with redirect information
        return { 
            success: true, 
            message: 'Invoice created successfully!',
            redirectTo: '/dashboard/invoices'
        };

    } catch (error) {
        console.error('Database Error: Failed to Create Invoice.', error);
        return {
            success: false,
            message: 'Database Error: Failed to Create Invoice.'
        };
    }
}

// Update your schema to include givenAmount
const UpdateStatusSchema = z.object({
  status: z.string().nonempty("Status is required"),
  givenAmount: z.string().optional(),
});

export async function updateInvoice(id, formData) {
  // Parse the form data with given amount
  const { status, givenAmount } = UpdateStatusSchema.parse({
    status: formData.get("status"),
    givenAmount: formData.get("givenAmount") || "0", // Default to 0 if not provided
  });

  const date = new Date();
  const formattedDateTime = date.toISOString();

  try {
    // Convert given amount to cents
    const givenAmountInCents = Math.round(parseFloat(givenAmount) * 100) || 0;

    // Get current invoice amount to calculate change
    const currentInvoice = await sql`
      SELECT amount FROM invoices WHERE id = ${id}
    `;

    if (currentInvoice.rows.length === 0) {
      return { success: false, message: 'Invoice not found.' };
    }

    const invoiceAmount = currentInvoice.rows[0].amount;
    
    // Update invoice with status, given amount, and time
    await sql`
      UPDATE invoices
      SET status = ${status}, 
          given_amount = ${givenAmountInCents},
          time = ${formattedDateTime}
      WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    return { success: true, message: 'Invoice updated successfully!' };
  } catch (error) {
    console.error('Database Error: Failed to Update Invoice.', error);
    return {
      success: false,
      message: "Database Error: Failed to Update Invoice."
    };
  }
}

export async function deleteInvoice(id) {
  //console.log(id);
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(prevState, formData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function deleteShopMedicine(id) {
  try {
    await sql`DELETE FROM shopinventory WHERE medicine_id = ${id}::uuid`;
  } catch (error) {
    return {
      message: "Database Error: Failed to delete medicine.",
    };
  }
  revalidatePath("/dashboard/myshop");
}

const AddMedicineSchema = z.object({
  id: z.string(), // medicine ID (UUID)
  quantity: z.number(), // quantity to add
  price: z.string(), // price per unit
});

// Add medicine to shop inventory and update price
export async function addMedicineToShop({ id, quantity, price }) {
  const {
    id: medicineId,
    quantity: qty,
    price: priceStr,
  } = AddMedicineSchema.parse({
    id,
    quantity,
    price,
  });

  try {
    const numericPrice = parseFloat(priceStr.replace(/[^\d.-]/g, ""));

    // Check if medicine exists in shop inventory
    const existing = await sql`
      SELECT quantity
      FROM shopinventory
      WHERE medicine_id = ${medicineId}::uuid;
    `;

    if (existing.rows.length > 0) {
      // Medicine exists → update quantity
      const newQuantity = existing.rows[0].quantity + qty;
      await sql`
        UPDATE shopinventory
        SET quantity = ${newQuantity}
        WHERE medicine_id = ${medicineId}::uuid;
      `;
    } else {
      // Insert new medicine in shop inventory
      await sql`
        INSERT INTO shopinventory (medicine_id, quantity)
        VALUES (${medicineId}::uuid, ${qty});
      `;
    }

    // Update price in medicinelist
    await sql`
      UPDATE medicinelist
      SET price = ${numericPrice * 100}
      WHERE id = ${medicineId}::uuid;
    `;
  } catch (error) {
    console.error("Database Error (addMedicineToShop):", error);
    throw new Error("Failed to add medicine to shop inventory.");
  }

  // Revalidate the shop page
  revalidatePath("/dashboard/myshop");
}

const EditMedicineSchema = z.object({
  id: z.string(), // medicine ID (UUID)
  quantity: z.number(), // quantity to add
  price: z.string(), // new price per unit
});

// Edit existing medicine info in shop inventory
export async function editShopMedicine({ id, quantity, price }) {
  try {
    const numericPrice = parseFloat(price.toString().replace(/[^\d.-]/g, ""));
    const qty = Number(quantity);

    // Get current quantity
    const existing = await sql`
      SELECT quantity
      FROM shopinventory
      WHERE medicine_id = ${id}::uuid;
    `;

    if (existing.rows.length === 0) {
      throw new Error("Medicine not found in inventory.");
    }

    const currentQuantity = existing.rows[0].quantity;

    // --- 🧠 Smart Logic ---
    if (qty > 0) {
      // Case 2: Add to existing quantity
      const newQuantity = currentQuantity + qty;
      await sql`
        UPDATE shopinventory
        SET quantity = ${newQuantity}
        WHERE medicine_id = ${id}::uuid;
      `;
    }
    // If qty = 0 → skip quantity update

    // Always update price (case 1 or 2)
    await sql`
      UPDATE medicinelist
      SET price = ${numericPrice * 100}
      WHERE id = ${id}::uuid;
    `;

    revalidatePath("/dashboard/myshop");
  } catch (error) {
    console.error("Database Error (editShopMedicine):", error);
    throw new Error("Failed to update medicine information.");
  }
  redirect("/dashboard/myshop");
}
