import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Medicine App",
  description: "Pharmacy Solution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "custom-toast",
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
            },
            success: {
              className: "success-toast",
              iconTheme: {
                primary: "#fff",
                secondary: "#10b981",
              },
              style: {
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              },
            },
            error: {
              className: "error-toast",
              iconTheme: {
                primary: "#fff",
                secondary: "#ef4444",
              },
              style: {
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              },
            },
            loading: {
              className: "loading-toast",
              style: {
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
