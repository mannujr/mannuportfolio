"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState({ foods: [], furniture: [] });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:3001/items");
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems(); // initial fetch
    const interval = setInterval(fetchItems, 1000); // fetch every 1s

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>Foods</h1>
      <ul>
        {items.foods.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h1>Furniture</h1>
      <ul>
        {items.furniture.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
