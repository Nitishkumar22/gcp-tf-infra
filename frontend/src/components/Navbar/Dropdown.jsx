import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dropdown = React.memo(({ title, items, currentPath }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = useMemo(() => items.some(item => currentPath === item.link), [items, currentPath]);

  return (
    <li
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-haspopup="true"
      aria-expanded={isHovered}
    >
      <div className={`flex items-center ${isActive ? 'font-semibold text-primary' : ''}`}>
        {title}
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 ml-1" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bg-white text-black mt-2 font-light border border-slate-300 rounded-sm shadow-lg whitespace-nowrap z-30"
          >
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.link}
                  className={`block p-2 hover:bg-gray-100 rounded-sm px-6 ${
                    currentPath === item.link ? 'bg-gray-100 font-semibold' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
});

export default Dropdown;