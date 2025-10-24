'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <CartProvider>{children}</CartProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}