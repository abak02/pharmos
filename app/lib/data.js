'use server'
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache'
import { formatCurrency } from './utils';


// Define constants at the top
const ITEMS_PER_PAGE = 40;
const CUSTOMER_PER_PAGE = 10;
const INVOICES_PER_PAGE = 15;
const SHOP_PER_PAGE = 40;


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

    const medicine = data.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
    return medicine;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all medicine.');
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
    console.error('Database Error:', err);
    throw new Error('Failed to fetch medicine by id.');
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
    console.error('Database Error Details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    throw new Error('Failed to fetch total number of medicine pages.');
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
        ml.price,
        COALESCE(si.quantity, 0) as quantity
      FROM medicinelist ml
      LEFT JOIN manufacturerlist m ON ml.manufacturer_id = m.manufacturer_id
      LEFT JOIN shopinventory si ON ml.id = si.medicine_id
      WHERE
        ml.brandname ILIKE ${`${query}%`} OR
        ml.genericname ILIKE ${`%${query}%`} 
      ORDER BY ml.brandname ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return medicines.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch medicine list.');
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

    return medicines.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch medicine list by brand name.');
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

    return medicines.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch medicine list for suggestion.');
  }
}

// Optimized medicine search with stock - now will use indexes
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

    return medicines.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
      stock_quantity: med.stock_quantity || 0,
    }));
  } catch (error) {
    console.error('Database Error:', error);
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
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of shop items.');
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
    
    return data.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch shop medicines.');
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
    console.error('Database Error:', err);
    throw new Error('Failed to fetch shop medicine.');
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
    console.error('Database Error:', error);
    throw new Error('Failed to fetch manufacturers.');
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
    
    return data.rows.map(med => ({
      ...med,
      price: med.price / 100, // convert from cents to taka
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch medicines by manufacturer.');
  }
}



export async function fetchCustomerPages(query) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*) FROM customers
      WHERE
      name ILIKE ${`%${query}%`} OR
      phone_no ILIKE ${`%${query}%`} 
    `;
    const totalPages = Math.ceil(Number(count.rows[0].count) / CUSTOMER_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
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
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
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
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * CUSTOMER_PER_PAGE;

  try {
    const data = await sql`
		SELECT
		  customers.id,
		  customers.name,
		  customers.phone_no,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.phone_no ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.phone_no
		ORDER BY customers.name ASC
    LIMIT ${CUSTOMER_PER_PAGE} OFFSET ${offset}
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: customer.total_pending / 100,
      total_paid: customer.total_paid / 100,
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}


// app/lib/data.js

export async function fetchInvoicesPages(query, customerId = null, status = null) {
  noStore();
  try {
    let whereConditions = [];
    let queryParams = [];

    if (customerId) {
      whereConditions.push(`invoices.customer_id = $${whereConditions.length + 1}`);
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

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const countQuery = {
      text: `
        SELECT COUNT(*)
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ${whereClause}
      `,
      values: queryParams
    };

    const count = await sql.query(countQuery);
    const totalPages = Math.ceil(Number(count.rows[0].count) / INVOICES_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchFilteredInvoices(query, currentPage, customerId = null, status = null) {
  noStore();
  const offset = (currentPage - 1) * INVOICES_PER_PAGE;

  try {
    let whereConditions = [];
    let queryParams = [];

    if (customerId) {
      whereConditions.push(`invoices.customer_id = $${whereConditions.length + 1}`);
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

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const invoicesQuery = {
      text: `
        SELECT
          invoices.id,
          invoices.amount,
          invoices.date,
          invoices.given_amount,
          invoices.status,
          customers.name,
          customers.phone_no
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ${whereClause}
        ORDER BY invoices.date DESC
        LIMIT ${INVOICES_PER_PAGE} OFFSET ${offset}
      `,
      values: queryParams
    };

    const invoices = await sql.query(invoicesQuery);

    return invoices.rows.map(invoice => ({
      ...invoice,
      amount: invoice.amount / 100,
      given_amount: invoice.given_amount / 100,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await sql`
      SELECT invoices.amount, invoices.date, customers.name, customers.phone_no, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount/100,
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid/100 ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending/100 ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
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
        invoices.given_amount,
        invoices.discounted_amount
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100, // convert from cents to taka
      given_amount: invoice.given_amount / 100, // convert from cents to taka
      discounted_amount: invoice.discounted_amount / 100, // convert from cents to taka
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
        invoices.time
      FROM invoices;
    `;

    const invoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: invoice.amount / 100, // convert from cents to taka
    }));

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
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
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer by id.');
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

    const medicinelist = data.rows.map(med => ({
      ...med,
      price_per_unit: med.price_per_unit / 100, // convert from cents to taka
    }));
    
    return medicinelist;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch medicines by invoice id.');
  }
}