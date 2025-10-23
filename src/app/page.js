"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 1. Define Stagger Container for a sequenced entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each child animation
    },
  },
};

// 2. Define Animation for Individual Elements (Fade in and slide up)
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// 3. Define Animation for the Large Title (Subtle fade in)
const titleVariants = {
  hidden: { opacity: 0.5 },
  visible: { opacity: 1, transition: { duration: 1.5 } },
};

// 4. Define Animation for the Image (Subtle zoom/scale)
const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.5 } },
};


export default function Home() {
  // const [items, setItems] = useState({ foods: [], furniture: [] });

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3001/items");
  //       if (!res.ok) throw new Error("Network response not ok");
  //       const data = await res.json();
  //       setItems(data);
  //     } catch (err) {
  //       console.error("Error fetching items:", err);
  //     }
  //   };

  //   fetchItems(); // initial fetch
  //   const interval = setInterval(fetchItems, 1000); // fetch every 1s

  //   return () => clearInterval(interval); // cleanup on unmount
  // }, []);

   const testimonials = [
    {
      logo: "/images/webflow-logo.svg",
      text: "The piece feels like it was designed just for me - pure magic.",
      img: "/images/client1.jpg",
      name: "Emma Rodriguez",
      role: "Creative director, design studio",
    },
    {
      logo: "/images/webflow-logo.svg",
      text: "I've never seen jewelry so uniquely personal yet universally beautiful.",
      img: "/images/client2.jpg",
      name: "Michael Chen",
      role: "Technology entrepreneur",
    },
    {
      logo: "/images/webflow-logo.svg",
      text: "Absolutely stunning how AI can create something so emotionally resonant.",
      img: "/images/client3.jpg",
      name: "Sarah Thompson",
      role: "Art curator, New York",
    },
  ];

  return (
    <div className="w-full mt-2 ">
      {/* <h1>Foods</h1>
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
      </ul> */}

     <div className="relative w-full h-[880px] flex justify-center items-center overflow-hidden rounded-3xl bg-zinc-100">
      {/* Centered Text - Use motion.h1 and titleVariants */}
      <motion.h1
        className="absolute top-2 text-[10rem] sm:text-[18rem] lg:text-[18rem] z-0 font-extrabold text-gray-900 tracking-tight break text-center leading-none"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        PRINCELY
      </motion.h1>

      {/* Menu List - Use motion.ul with containerVariants for staggering */}
      <motion.ul
        className="absolute z-[2] left-0 bottom-26 text-3xl text-zinc lg:text-black space-y-2 p-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {["Rings", "Earrings", "Lockets", "Bracelet"].map((item) => (
          // List Item - Use motion.li with itemVariants
          <motion.li
            key={item}
            variants={itemVariants}
            className="group cursor-pointer border-b-2 py-4 w-[50px]"
          >
            {/* ... span content remains the same ... */}
            <span className="flex items-center">
              <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-0">
                {item}
              </span>
              <span className="ml-4 text-3xl opacity-20 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-2">
                &rarr;
              </span>
            </span>
          </motion.li>
        ))}
      </motion.ul>

      {/* Info Box - Use motion.div with itemVariants */}
      <motion.div
        className="absolute right-16 bottom-60 z-[2] text-sm lg:block hidden lg:w-1/4 p-8 bg-zinc-50 bg-opacity-70 rounded-2xl backdrop-blur-md"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-semibold">COLLECTION 2025</h2>
        <p className="text-xl">
          Discover our exquisite jewelry collection, where timeless elegance meets modern design. Each piece is crafted to perfection, reflecting your unique style and sophistication.
        </p>
      </motion.div>

      {/* Centered Image - Use motion.div with imageVariants */}
      <motion.div
        className="absolute z-[1] flex items-center justify-center "
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/download.png"
          width={500}
          height={500}
          alt="Picture of the hand"
        />
      </motion.div>
    </div>




<div className="flex justify-center items-center w-full py-12 bg-gradient-to-r ">
      <div className="relative w-[75%] md:w-[1280px] h-[600px] rounded-xl shadow-lg">
        <Carousel>
          <CarouselContent>
            {[1, 2, 3, 4].map((i) => (
              <CarouselItem key={i}>
                <div className="relative w-full h-[600px]">
                  <Image
                    src={`/images/jwellery ${i}.png`}
                    alt={`Jewellery ${i}`}
                    fill
                    className="object-cover rounded-xl"
                    // overflorw="hidden"
                    radius="10px"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>


     <div className="max-w-[420px] text-center p-5 mb-5">
        {/* Section Header */}
        <p className="text-xl font-bold uppercase tracking-wide text-gray-500 mb-2">
          Process
        </p>

        <h2 className="text-2xl font-semibold mb-4 leading-snug text-gray-900">
          How we transform <br /> digital dreams into <br /> precious reality
        </h2>

        <p className="text-gray-600 text-base mb-12">
          Our innovative approach bridges artificial intelligence with
          traditional craftsmanship.
        </p>

        {/* Step 1 */}
        <div className="mb-12">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-gray-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 3 3 8.571 12 21l9-12.429L17.571 3H6.429zm0 0h11.142M3 8.571h18"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold mb-2">Generate unique design</h3>
          <p className="text-gray-600 text-sm">
            AI algorithms create intricate jewelry concepts beyond human
            imagination.
          </p>
        </div>

        {/* Step 2 */}
        <div className="mb-12">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-gray-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h-1.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-1.5m0 0V4.5a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 009.75 4.5v2.25m4.5 0h-4.5"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold mb-2">Craft with precision</h3>
          <p className="text-gray-600 text-sm">
            Master artisans transform digital blueprints into tangible, exquisite pieces.
          </p>
        </div>

        {/* Step 3 */}
        <div className="mb-12">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-gray-800"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5v9.75A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25V7.5m-18 0l9 6.75L21 7.5m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold mb-2">Deliver with care</h3>
          <p className="text-gray-600 text-sm">
            Handcrafted jewelry arrives within three weeks, carefully packaged
            and authenticated.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button className="border border-gray-800 px-5 py-2 rounded-md hover:bg-gray-900 hover:text-white transition">
            Learn more
          </button>
          <button className="flex items-center gap-2 text-gray-800 hover:underline">
            Watch process <span>→</span>
          </button>
        </div>
      </div>





 <div className="max-w-md bg-zinc-800 text-white mx-auto text-center p-5">
        <h2 className="text-2xl font-serif font-semibold  mb-3">
          What our clients say
        </h2>
        <p className="mb-10 text-sm">
          Authentic experiences from those who wear our AI-crafted jewelry
        </p>



        {testimonials.map((item, i) => (
          <div key={i} className="mb-16 last:mb-0 ">
            <img
              src={item.logo}
              alt="image"
              className="mx-auto mb-4 h-6"
            />
            <p className="text-gray-800 text-base mb-6 italic">{item.text}</p>
            <div className="flex flex-col items-center">
              <img
                src={item.img}
                alt={item.name}
                className="w-12 h-12 rounded-full mb-3 object-cover"
              />
              <p className="font-semibold text-zinc-400">{item.name}</p>
              <p className="text-sm text--600">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
         


 
    </div>
  );
}
