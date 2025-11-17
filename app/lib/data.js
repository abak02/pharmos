"use server";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import { formatCurrency } from "./utils";

// Define constants at the top
const ITEMS_PER_PAGE = 40;
const CUSTOMER_PER_PAGE = 25;
const INVOICES_PER_PAGE = 25;
const SHOP_PER_PAGE = 40;

// Medicine functions remain the same
export async function fetchMedicine() {
  noStore();
  try {
    const data = await sql`
        SELECT
          ml.id,
          ml.brandname,
          ml.genericname,
          m.nameofthemanufacturer,
          ml.price,
          COALESCE(si.quantity, 0) as quantity
        FROM medicinelist ml
        LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
        LEFT JOIN shopinventory si ON ml.id = si.medicine_id
        ORDER BY ml.brandname ASC
      `;

    const medicine = data.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
    return medicine;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all medicine.");
  }
}

export async function fetchMedicineById(id) {
  noStore();
  try {
    const data = await sql`
        SELECT
          ml.id,
          ml.brandname,
          ml.genericname,
          m.nameofthemanufacturer,
          ml.dosagedescription,
          ml.price,
          COALESCE(si.quantity, 0) as quantity
        FROM medicinelist ml
        LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
        LEFT JOIN shopinventory si ON ml.id = si.medicine_id
        WHERE ml.id = ${id}
      `;

    const medicine = data.rows[0];
    return {
      ...medicine,
      price: medicine.price / 100, // convert from cents to taka
    };
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch medicine by id.");
  }
}

export async function fetchMedicinePages(query) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM medicinelist ml
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE
        ml.brandname ILIKE ${`%${query}%`} OR
        ml.genericname ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error Details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    throw new Error("Failed to fetch total number of medicine pages.");
  }
}

export async function fetchFilteredMedicine(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const medicines = await sql`
      SELECT
        ml.id,
        ml.brandname,
        ml.genericname,
        m.nameofthemanufacturer,
        ml.dosagedescription,
        ml.strength,
        ml.price,
        COALESCE(si.quantity, 0) as quantity
      FROM medicinelist ml
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      LEFT JOIN shopinventory si ON ml.id = si.medicine_id
      WHERE
        ml.brandname ILIKE ${`%${query}%`} OR
        ml.genericname ILIKE ${`%${query}%`}
      ORDER BY 
        -- Prioritize brand names that start with the query
        CASE WHEN ml.brandname ILIKE ${`${query}%`} THEN 1
             WHEN ml.genericname ILIKE ${`${query}%`} THEN 2
             ELSE 3 END,
        ml.brandname ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return medicines.rows.map((med) => ({
      ...med,
      price: med.price / 100,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch medicine list.");
  }
}

export async function fetchFilteredMedicinebyBrandName(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const medicines = await sql`
      SELECT
        ml.id,
        ml.brandname,
        ml.genericname,
        m.nameofthemanufacturer,
        ml.dosagedescription,
        ml.price
      FROM medicinelist ml
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE
        ml.brandname ILIKE ${`${query}%`}
      ORDER BY ml.brandname ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return medicines.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch medicine list by brand name.");
  }
}

export async function fetchFilteredMedicineForSuggestion(query) {
  noStore();
  try {
    const medicines = await sql`
      SELECT
        ml.id,
        ml.brandname,
        ml.dosagedescription,
        ml.price
      FROM medicinelist ml
      WHERE
        ml.brandname ILIKE ${`${query}%`}
      ORDER BY ml.brandname ASC
      LIMIT 20
    `;

    return medicines.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch medicine list for suggestion.");
  }
}

export async function fetchFilteredMedicineWithStockForSuggestion(query) {
  noStore();
  try {
    const medicines = await sql`
      SELECT
        ml.id,
        ml.brandname,
        ml.dosagedescription,
        ml.price,
        COALESCE(si.quantity, 0) as stock_quantity
      FROM medicinelist ml
      LEFT JOIN shopinventory si ON ml.id = si.medicine_id
      WHERE
        ml.brandname ILIKE ${`${query}%`}
      ORDER BY ml.brandname ASC
      LIMIT 20
    `;

    return medicines.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
      stock_quantity: med.stock_quantity || 0,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

// Shop inventory related functions
export async function fetchShopPages(query) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*) 
      FROM shopinventory si
      JOIN medicinelist ml ON si.medicine_id = ml.id
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE ml.brandname ILIKE ${`%${query}%`} OR
            ml.genericname ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(count.rows[0].count) / SHOP_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of shop items.");
  }
}

export async function fetchShopMedicines(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * SHOP_PER_PAGE;

  try {
    const data = await sql`
      SELECT 
        si.medicine_id,
        ml.brandname,
        ml.genericname,
        m.nameofthemanufacturer,
        ml.dosagedescription,
        ml.strength,
        ml.price,
        si.quantity
      FROM shopinventory si
      JOIN medicinelist ml ON si.medicine_id = ml.id
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE ml.brandname ILIKE ${`%${query}%`} OR
            ml.genericname ILIKE ${`%${query}%`}
      ORDER BY ml.brandname ASC
      LIMIT ${SHOP_PER_PAGE} OFFSET ${offset}
    `;

    return data.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch shop medicines.");
  }
}

export async function fetchShopMedicinesById(id) {
  noStore();
  try {
    const data = await sql`
      SELECT 
        si.medicine_id,
        si.quantity
      FROM shopinventory si
      WHERE si.medicine_id = ${id}
    `;

    const shopMedicine = data.rows[0];
    return shopMedicine;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch shop medicine.");
  }
}

// Manufacturer related functions
export async function fetchManufacturersWithLowStock() {
  noStore();
  try {
    const data = await sql`
      SELECT 
        COALESCE(m.nameofthemanufacturer, 'Unknown') as name,
        COUNT(*) as low_stock_count,
        SUM(CASE WHEN si.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM shopinventory si
      INNER JOIN medicinelist ml ON si.medicine_id = ml.id
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE si.quantity <= 10
      GROUP BY m.nameofthemanufacturer
      ORDER BY low_stock_count DESC, name ASC
      LIMIT 50
    `;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch manufacturers.");
  }
}

export async function fetchLowStockMedicinesByManufacturer(manufacturerName) {
  noStore();
  try {
    const data = await sql`
      SELECT 
        ml.id as medicine_id,
        ml.brandname,
        ml.genericname,
        ml.dosagedescription,
        m.nameofthemanufacturer,
        ml.price,
        si.quantity
      FROM shopinventory si
      INNER JOIN medicinelist ml ON si.medicine_id = ml.id
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      WHERE si.quantity <= 10
      AND m.nameofthemanufacturer = ${manufacturerName}
      ORDER BY 
        si.quantity ASC,
        ml.brandname ASC
      LIMIT 100
    `;

    return data.rows.map((med) => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch medicines by manufacturer.");
  }
}

// Customer functions
export async function fetchCustomerPages(query) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*) FROM customers
      WHERE
      name ILIKE ${`%${query}%`} OR
      phone_no ILIKE ${`%${query}%`} 
    `;
    const totalPages = Math.ceil(
      Number(count.rows[0].count) / CUSTOMER_PER_PAGE
    );
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of customers.");
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchCustomer(query) {
  noStore();
  try {
    const data = await sql`
      SELECT
        id,
        name,
       phone_no
      FROM customers
      WHERE
        name ILIKE ${`%${query}%`} OR
      phone_no ILIKE ${`%${query}%`}
      ORDER BY name ASC
      Limit 10
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * CUSTOMER_PER_PAGE;

  try {
    const data = await sql`
      SELECT
        c.id,
        c.name,
        c.phone_no,
        COUNT(i.id) AS total_invoices,
        SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS total_pending_cents,
        SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid_cents,
        SUM(CASE WHEN i.status = 'partial' THEN (i.amount - COALESCE(i.paid_amount, 0)) ELSE 0 END) AS total_partial_cents
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.phone_no ILIKE ${`%${query}%`}
      GROUP BY c.id, c.name, c.phone_no
      ORDER BY c.name ASC
      LIMIT ${CUSTOMER_PER_PAGE} OFFSET ${offset}
    `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: (customer.total_pending_cents || 0) / 100,
      total_paid: (customer.total_paid_cents || 0) / 100,
      total_partial: (customer.total_partial_cents || 0) / 100,
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

// Invoice functions - UPDATED for new database structure
export async function fetchInvoicesPages(
  query,
  customerId = null,
  status = null
) {
  noStore();
  try {
    let whereConditions = [];
    let queryParams = [];

    if (customerId) {
      whereConditions.push(
        `invoices.customer_id = $${whereConditions.length + 1}`
      );
      queryParams.push(customerId);
    }

    if (status) {
      whereConditions.push(`invoices.status = $${whereConditions.length + 1}`);
      queryParams.push(status);
    }

    if (query) {
      const paramIndex = whereConditions.length + 1;
      whereConditions.push(`(
        customers.name ILIKE $${paramIndex} OR
        customers.phone_no ILIKE $${paramIndex} OR
        invoices.amount::text ILIKE $${paramIndex} OR
        invoices.date::text ILIKE $${paramIndex} OR
        invoices.status ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${query}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const countQuery = {
      text: `
        SELECT COUNT(*)
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ${whereClause}
      `,
      values: queryParams,
    };

    const count = await sql.query(countQuery);
    const totalPages = Math.ceil(
      Number(count.rows[0].count) / INVOICES_PER_PAGE
    );
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchFilteredInvoices(
  query,
  currentPage,
  customerId = null,
  status = 'all'
) {
  noStore();
  const offset = (currentPage - 1) * INVOICES_PER_PAGE;

  try {
    let whereConditions = [];
    let queryParams = [];

    if (customerId) {
      whereConditions.push(
        `invoices.customer_id = $${whereConditions.length + 1}`
      );
      queryParams.push(customerId);
    }

    if (status) {
      whereConditions.push(`invoices.status = $${whereConditions.length + 1}`);
      queryParams.push(status);
    }

    if (query) {
      const paramIndex = whereConditions.length + 1;
      whereConditions.push(`(
        customers.name ILIKE $${paramIndex} OR
        customers.phone_no ILIKE $${paramIndex} OR
        invoices.amount::text ILIKE $${paramIndex} OR
        invoices.date::text ILIKE $${paramIndex} OR
        invoices.status ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${query}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const invoicesQuery = {
      text: `
        SELECT
          invoices.id,
          invoices.amount,
          invoices.date,
          invoices.status,
          invoices.paid_amount,
          invoices.discounted_amount,
          customers.name,
          customers.phone_no
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ${whereClause}
        ORDER BY invoices.date DESC
        LIMIT ${INVOICES_PER_PAGE} OFFSET ${offset}
      `,
      values: queryParams,
    };

    const invoices = await sql.query(invoicesQuery);

    return invoices.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
      paid_amount: invoice.paid_amount / 100,
      discounted_amount: invoice.discounted_amount / 100,
      // Calculate remaining amount for partial invoices
      remaining_amount:
        invoice.status === "partial"
          ? (invoice.amount - invoice.paid_amount) / 100
          : 0,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await sql`
      SELECT 
        invoices.amount, 
        invoices.date, 
        invoices.status,
        invoices.paid_amount,
        customers.name, 
        customers.phone_no, 
        invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
      paid_amount: invoice.paid_amount / 100,
      remaining_amount:
        invoice.status === "partial"
          ? (invoice.amount - invoice.paid_amount) / 100
          : 0,
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}
export async function fetchCardData() {
  noStore();
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending",
        SUM(CASE WHEN status = 'partial' THEN (amount - paid_amount) ELSE 0 END) AS "partial_remaining"
      FROM invoices
    `;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
    const numberOfCustomers = Number(data[1].rows[0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid / 100 ?? "0");
    const totalPendingInvoices = formatCurrency(
      data[2].rows[0].pending / 100 ?? "0"
    );
    const totalPartialRemaining = formatCurrency(
      data[2].rows[0].partial_remaining / 100 ?? "0"
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
      totalPartialRemaining,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchInvoiceById(id) {
  noStore();
  try {
    const data = await sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status,
        invoices.date,
        invoices.time,
        invoices.discounted_amount,
        invoices.paid_amount,
        customers.name,
        customers.phone_no
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
      discounted_amount: invoice.discounted_amount / 100,
      paid_amount: invoice.paid_amount / 100,
      // Calculate pending amount for partial invoices
      pending_amount: invoice.status === 'partial' ? (invoice.amount - invoice.paid_amount) / 100 : 0,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchInvoices() {
  noStore();
  try {
    const data = await sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status,
        invoices.date,
        invoices.time,
        invoices.paid_amount
      FROM invoices;
    `;

    const invoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100,
      paid_amount: invoice.paid_amount / 100,
    }));

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchCustomerById(id) {
  try {
    const data = await sql`
      SELECT
        id,
        name,
        phone_no
      FROM customers
      WHERE id = ${id}
    `;

    const customers = data.rows[0];
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer by id.");
  }
}

export async function fetchMedicineByInvoiceID(id) {
  try {
    const data = await sql`
    SELECT 
      ml.brandname, 
      ml.dosagedescription, 
      im.quantity, 
      im.price_per_unit
    FROM 
      invoice_medicines AS im
    JOIN 
      medicinelist AS ml ON im.medicine_id = ml.id
    WHERE 
      im.invoice_id = ${id};
    `;

    const medicinelist = data.rows.map((med) => ({
      ...med,
      price_per_unit: med.price_per_unit / 100,
    }));

    return medicinelist;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch medicines by invoice id.");
  }
}

// NEW: Fetch payment history for an invoice
export async function fetchPaymentsByInvoiceId(invoiceId) {
  noStore();
  try {
    const data = await sql`
      SELECT
        id,
        amount,
        given_amount,
        payment_date,
        payment_time,
        created_at
      FROM payments
      WHERE invoice_id = ${invoiceId}
      ORDER BY created_at DESC
    `;

    return data.rows.map((payment) => ({
      ...payment,
      amount: payment.amount / 100,
      given_amount: payment.given_amount / 100,
      change_amount: (payment.given_amount - payment.amount) / 100,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch payment history.");
  }
}

export async function fetchInvoiceSummary(invoiceId) {
  noStore();
  try {
    // First query for invoice and customer details
    const invoiceData = await sql`
      SELECT 
        i.*,
        c.name as customer_name,
        c.phone_no as customer_phone,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_paid_cents,
        COALESCE(SUM(p.given_amount), 0) as total_given_cents,
        COALESCE(SUM(p.given_amount - p.amount), 0) as total_change_cents
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.id = ${invoiceId}
      GROUP BY i.id, c.id
    `;

    if (invoiceData.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    const row = invoiceData.rows[0];

    // Second query for medicines
    const medicinesData = await sql`
      SELECT 
        im.medicine_id as id,
        im.medicine_id,
        ml.brandname,
        ml.dosagedescription,
        im.quantity,
        im.price_per_unit
      FROM invoice_medicines im
      JOIN medicinelist ml ON im.medicine_id = ml.id
      WHERE im.invoice_id = ${invoiceId}
      ORDER BY ml.brandname
    `;

    // Third query for payments
    const paymentsData = await sql`
      SELECT 
        id,
        amount,
        given_amount,
        payment_date,
        payment_time,
        created_at
      FROM payments
      WHERE invoice_id = ${invoiceId}
      ORDER BY created_at DESC
    `;

    const processedPayments = paymentsData.rows.map(payment => ({
      ...payment,
      amount: payment.amount / 100,
      given_amount: payment.given_amount / 100,
      change_amount: (payment.given_amount - payment.amount) / 100
    }));

    const processedMedicines = medicinesData.rows.map(medicine => ({
      ...medicine,
      price_per_unit: medicine.price_per_unit / 100
    }));

    return {
      id: row.id,
      customer_id: row.customer_id,
      amount: row.amount / 100,
      status: row.status,
      date: row.date,
      time: row.time,
      discounted_amount: (row.discounted_amount || 0) / 100,
      paid_amount: (row.paid_amount || 0) / 100,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      total_paid: row.total_paid_cents / 100,
      total_given: row.total_given_cents / 100,
      total_change: row.total_change_cents / 100,
      remaining_amount: Math.max(0, (row.amount - row.total_paid_cents) / 100),
      payment_count: parseInt(row.payment_count) || 0,
      payments: processedPayments,
      medicines: processedMedicines,
      latest_given_amount: processedPayments.length > 0 ? processedPayments[0].given_amount : 0
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice summary.");
  }
}