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

// Helper function to capitalize each word
function capitalizeWords(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function createCustomer(formData) {
  const rawCustomerName = formData.get("customerName");
  const customerEmail = formData.get("customerEmail");

  // Capitalize the customer name
  const customerName = capitalizeWords(rawCustomerName);

  // Validate after capitalization
  const validatedFields = CreateCustomer.parse({
    customerName,
    customerEmail,
  });

  const customerId = uuidv4();

  try {
    await sql`
      INSERT INTO customers (id, name, phone_no)
      VALUES (${customerId}, ${customerName}, ${customerEmail})
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to Create Customer.",
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function createInvoice(formData, selectedMedicines) {
  // Get and validate status
  let getStatus = formData.get("status") || "pending";

  const { customerName, customerEmail, status } = CreateCustomer.parse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    status: getStatus,
  });

  // Get values and convert to cents
  const totalPriceInCents =
    Math.round(parseFloat(formData.get("totalPrice")) * 100) || 0;
  const discountedPriceInCents =
    Math.round(parseFloat(formData.get("discountedPrice")) * 100) || 0;
  const discountPercentage = Math.min(
    parseFloat(formData.get("discountPercentage")) || 0,
    10
  );
  // In createInvoice function:
  const givenAmountInCents =
    Math.round(parseFloat(formData.get("givenAmount")) * 100) || 0;
  const changeAmountInCents =
    Math.round(parseFloat(formData.get("changeAmount")) * 100) || 0;

  const invoiceId = uuidv4();
  const date = new Date();
  const formattedDateTime = date.toISOString();
  const formattedDate = date.toISOString().split("T")[0];
  const formattedTime = date.toTimeString().split(" ")[0];

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
                VALUES (${customerId}, ${capitalizeWords(
        customerName
      )}, ${customerEmail})
            `;
    }

    // Calculate discounted amount
    const discountedAmountInCents = totalPriceInCents - discountedPriceInCents;

    // FIX: Handle negative discount due to rounding
    let finalDiscountedAmountInCents = Math.max(discountedAmountInCents, 0);
    let finalAmountInCents = discountedPriceInCents;

    // If discount is negative (rounded price > original), adjust
    if (discountedAmountInCents < 0) {
      console.log("Adjusting negative discount:", {
        totalPriceInCents,
        discountedPriceInCents,
        discountedAmountInCents,
        discountPercentage,
      });
      finalDiscountedAmountInCents = 0;
      finalAmountInCents = totalPriceInCents; // Use original price
    }

    // Calculate paid_amount based on status
    let paidAmountInCents = 0;

    if (status === "paid") {
      paidAmountInCents = finalAmountInCents; // Full payment of adjusted amount
    } else if (status === "partial") {
      // For partial payments, paid_amount is the given amount (but not more than final amount)
      paidAmountInCents = Math.min(givenAmountInCents, finalAmountInCents);
    } // For pending, paidAmountInCents remains 0

    // Insert invoice details
    await sql`
            INSERT INTO invoices (
                id, customer_id, date, amount, status, time, 
                discounted_amount, paid_amount
            ) VALUES (
                ${invoiceId}, ${customerId}, ${formattedDateTime}, ${finalAmountInCents}, 
                ${status}, ${formattedDateTime}, ${finalDiscountedAmountInCents}, 
                ${paidAmountInCents}
            )
        `;

    // Create payment record if payment was made
    if ((status === "paid" || status === "partial") && paidAmountInCents > 0) {
      await sql`
                INSERT INTO payments (
                    invoice_id, amount, given_amount, payment_date, 
                    payment_time, created_at
                ) VALUES (
                    ${invoiceId}, ${paidAmountInCents}, ${givenAmountInCents}, 
                    ${formattedDate}, ${formattedTime}, ${formattedDateTime}
                )
            `;
    }

    // Process each medicine in the invoice
    for (const medicine of selectedMedicines) {
      const { id, quantity, price, medicineName } = medicine;
      const pricePerUnitInCents = Math.round(parseFloat(price) * 100) || 0;
      const customerQuantity = parseInt(quantity) || 0;

      // 1. Insert into invoice_medicines table
      await sql`
                INSERT INTO invoice_medicines (invoice_id, medicine_id, quantity, price_per_unit)
                VALUES (${invoiceId}, ${id}, ${customerQuantity}, ${pricePerUnitInCents})
            `;

      // 2. Update medicine price in medicinelist table if changed
      const currentMedicine = await sql`
                SELECT price FROM medicinelist WHERE id = ${id}
            `;

      if (currentMedicine.rows.length > 0) {
        const currentPriceInCents = currentMedicine.rows[0].price;

        // Check if price has changed (compare in cents)
        if (Math.abs(currentPriceInCents - pricePerUnitInCents) > 1) {
          await sql`
                        UPDATE medicinelist 
                        SET price = ${pricePerUnitInCents} 
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
    revalidatePath("/dashboard/invoices");
    

    return {
      success: true,
      message: "Invoice created successfully!",
      redirectTo: "/dashboard/invoices",
      data: {
        invoiceId,
        status,
        paidAmount: paidAmountInCents / 100,
        remainingAmount: (finalAmountInCents - paidAmountInCents) / 100,
      },
    };
  } catch (error) {
    console.error("Database Error: Failed to Create Invoice.", error);
    return {
      success: false,
      message: "Database Error: Failed to Create Invoice.",
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
  const formattedDate = date.toISOString().split("T")[0];
  const formattedTime = date.toTimeString().split(" ")[0];

  try {
    const givenAmountInCents = Math.round(parseFloat(givenAmount) * 100) || 0;

    // Get current invoice data
    const currentInvoice = await sql`
      SELECT amount, discounted_amount, paid_amount, status 
      FROM invoices 
      WHERE id = ${id}
    `;

    if (currentInvoice.rows.length === 0) {
      return { success: false, message: "Invoice not found." };
    }

    const invoiceData = currentInvoice.rows[0];
    const invoiceAmount = invoiceData.amount;
    const currentPaidAmount = invoiceData.paid_amount || 0;
    const currentStatus = invoiceData.status;

    let newPaidAmount = currentPaidAmount;
    let paymentAmountInCents = 0;
    let finalStatus = status;

    // Calculate payment amount based on status transition
    if (status === "paid") {
      if (currentStatus === "pending") {
        // First time payment - full payment
        paymentAmountInCents = invoiceAmount;
        newPaidAmount = invoiceAmount;
      } else if (currentStatus === "partial") {
        // Final payment to complete the invoice
        paymentAmountInCents = invoiceAmount - currentPaidAmount;
        newPaidAmount = invoiceAmount;
      }
    } else if (status === "partial") {
      // Partial payment - pay as much as possible from given amount
      const remainingAmount = invoiceAmount - currentPaidAmount;
      paymentAmountInCents = Math.min(givenAmountInCents, remainingAmount);
      newPaidAmount = currentPaidAmount + paymentAmountInCents;

      // If payment covers the remaining amount, automatically mark as paid
      if (newPaidAmount >= invoiceAmount) {
        finalStatus = "paid";
        newPaidAmount = invoiceAmount;
        paymentAmountInCents = invoiceAmount - currentPaidAmount;
      }
    }

    // Validate payment amount
    if (paymentAmountInCents < 0) {
      return { success: false, message: "Invalid payment amount." };
    }

    // Update invoice with status, paid amount, and time
    await sql`
      UPDATE invoices
      SET status = ${finalStatus}, 
          paid_amount = ${newPaidAmount},
          time = ${formattedDateTime}
      WHERE id = ${id}
    `;

    // Create payment record if payment was made
    if (paymentAmountInCents > 0) {
      await sql`
        INSERT INTO payments (invoice_id, amount, given_amount, payment_date, payment_time, created_at)
        VALUES (${id}, ${paymentAmountInCents}, ${givenAmountInCents}, ${formattedDate}, ${formattedTime}, ${formattedDateTime})
      `;
    }

    // If status is being changed without payment (e.g., mark as paid without payment)
    if (
      status === "paid" &&
      paymentAmountInCents === 0 &&
      currentStatus !== "paid"
    ) {
      // This handles cases where you want to mark as paid without recording a payment
      // For example, complimentary invoices or waived payments
      paymentAmountInCents = invoiceAmount - currentPaidAmount;
      newPaidAmount = invoiceAmount;

      await sql`
        UPDATE invoices
        SET status = 'paid', 
            paid_amount = ${newPaidAmount}
        WHERE id = ${id}
      `;
    }

    revalidatePath("/dashboard/invoices");
    return {
      success: true,
      message: `Invoice ${
        finalStatus === "paid" ? "paid" : "updated"
      } successfully!`,
      data: {
        paymentAmount: paymentAmountInCents / 100,
        givenAmount: givenAmountInCents / 100,
        changeAmount: (givenAmountInCents - paymentAmountInCents) / 100,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data.",
        errors: error.errors.map((e) => e.message),
      };
    }

    console.error("Database Error: Failed to Update Invoice.", error);
    return {
      success: false,
      message: "Database Error: Failed to Update Invoice.",
    };
  }
}

export async function deleteInvoice(id) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    await sql`DELETE FROM invoice_medicines WHERE invoice_id = ${id}`;
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: "Invoice deleted successfully!",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Failed to delete invoice.",
    };
  }
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

// Payment Schema
const PaymentSchema = z.object({
  customerId: z.string().uuid(),
  totalAmount: z.number().min(0.01, "Amount must be greater than 0"),
  allocations: z.array(
    z.object({
      invoiceId: z.string().uuid(),
      allocatedAmount: z
        .number()
        .min(0.01, "Allocated amount must be greater than 0"),
    })
  ),
  paymentDate: z.string(),
});

// app/lib/actions.js - Updated processPayment function without change_amount column
export async function processPayment(prevState, formData) {
  let client;

  try {
    // Parse and validate the form data
    const { customerId, totalAmount, allocations, paymentDate } =
      PaymentSchema.parse({
        customerId: formData.get("customerId"),
        totalAmount: parseFloat(formData.get("totalAmount")),
        allocations: JSON.parse(formData.get("allocations")),
        paymentDate: formData.get("paymentDate"),
      });

    // Convert amount to paisa (integer)
    const totalAmountInPaisa = Math.round(totalAmount * 100);

    // Start transaction
    client = await sql.connect();
    await client.query("BEGIN");

    const processedAllocations = [];

    for (const allocation of allocations) {
      const allocatedAmountInPaisa = Math.round(
        allocation.allocatedAmount * 100
      );

      // 1. Validate invoice exists and get current data
      const invoiceCheck = await client.query(
        `SELECT id, amount, paid_amount, status 
         FROM invoices 
         WHERE id = $1`,
        [allocation.invoiceId]
      );

      if (invoiceCheck.rows.length === 0) {
        throw new Error(`Invoice ${allocation.invoiceId} not found`);
      }

      const invoice = invoiceCheck.rows[0];
      const currentPaid = invoice.paid_amount || 0;
      const newPaidAmount = currentPaid + allocatedAmountInPaisa;
      const invoiceAmount = invoice.amount;
      const pendingAmount = invoiceAmount - currentPaid;

      // Validate payment doesn't exceed invoice amount
      if (allocatedAmountInPaisa > pendingAmount) {
        throw new Error(
          `Payment exceeds pending amount for invoice ${allocation.invoiceId}`
        );
      }

      // 2. Insert payment record
      const paymentResult = await client.query(
        `INSERT INTO payments (invoice_id, amount, payment_date, payment_time)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [allocation.invoiceId, allocatedAmountInPaisa, paymentDate]
      );

      // 3. Determine status and given_amount
      let newStatus;
      let newGivenAmount;

      if (allocatedAmountInPaisa === pendingAmount) {
        // FULL PAYMENT
        newStatus = "paid";
        newGivenAmount = allocatedAmountInPaisa; // Customer gave exact amount
      } else {
        // PARTIAL PAYMENT
        newStatus = "partial";
        newGivenAmount = allocatedAmountInPaisa; // Customer gave partial amount
      }

      // 4. Update invoice (without change_amount column)
      await client.query(
        `UPDATE invoices 
         SET paid_amount = $1,
             status = $2,
             time = NOW()
         WHERE id = $3`,
        [newPaidAmount, newStatus, allocation.invoiceId]
      );

      // Calculate change amount for response (given_amount - amount)
      const changeAmount =
        newGivenAmount > invoiceAmount ? newGivenAmount - invoiceAmount : 0;

      processedAllocations.push({
        invoiceId: allocation.invoiceId,
        allocatedAmount: allocatedAmountInPaisa / 100,
        newStatus: newStatus,
        givenAmount: newGivenAmount / 100,
        invoiceAmount: invoiceAmount / 100,
        changeAmount: changeAmount / 100, // Calculated change
        paymentId: paymentResult.rows[0].id,
      });
    }

    await client.query("COMMIT");

    // Revalidate relevant paths
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/payments");

    // Generate success message
    const fullyPaid = processedAllocations.filter(
      (a) => a.newStatus === "paid"
    ).length;
    const partiallyPaid = processedAllocations.filter(
      (a) => a.newStatus === "partial"
    ).length;

    let message = `Payment processed successfully! `;
    message += `Amount: ৳${totalAmount.toFixed(2)}. `;
    if (fullyPaid > 0) message += `${fullyPaid} invoice(s) fully paid. `;
    if (partiallyPaid > 0)
      message += `${partiallyPaid} invoice(s) partially paid.`;

    return {
      success: true,
      message: message,
      totalAmount: totalAmount,
      allocations: processedAllocations,
    };
  } catch (error) {
    // Rollback transaction if client is connected
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Database Error: Failed to Process Payment.", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed. Please check your input.",
      };
    }

    return {
      success: false,
      message: error.message || "Database Error: Failed to Process Payment.",
    };
  } finally {
    // Release client back to pool
    if (client) {
      client.release();
    }
  }
}

// Updated fetchPendingInvoices function
export async function fetchPendingInvoices(customerId) {
  try {
    const result = await sql`
      SELECT 
        id,
        amount,
        paid_amount,
        status,
        date,
        time
      FROM invoices 
      WHERE customer_id = ${customerId} 
        AND (amount - COALESCE(paid_amount, 0)) > 0
        AND status != 'paid'
      ORDER BY date ASC, amount ASC
    `;

    // Convert amounts from paisa to taka and calculate change
    const invoices = result.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
      paid_amount: (invoice.paid_amount || 0) / 100,
    }));

    return invoices;
  } catch (error) {
    console.error("Database Error: Failed to fetch pending invoices.", error);
    throw new Error("Failed to fetch pending invoices.");
  }
}
