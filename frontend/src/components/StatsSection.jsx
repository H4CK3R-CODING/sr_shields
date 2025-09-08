import React, { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useInView } from "react-intersection-observer";
import axios from "axios";

/** AnimatedNumber: animates from 0 -> value when the element comes into view */
const AnimatedNumber = ({ value = 0, duration = 1500 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.6,
    rootMargin: "0px 0px -100px 0px",
  });

  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView) return;

    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const val = Math.floor(eased * value);
      setCurrent(val);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, value, duration]);

  return <span ref={ref}>{current}</span>;
};

const StatsSection = () => {
  const [stats, setStats] = useState([
    { label: "Users", value: 0 },
    { label: "Announcements", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/stats`
        );
        setStats([
          { label: "Users", value: data.users },
          { label: "Announcements", value: data.announcements },
        ]);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-3xl mx-auto my-16 px-6">
      <h2
        className="text-5xl font-bold text-center mb-10 text-blue-600 dark:text-blue-400"
        data-aos="fade-down"
      >
        Our Community in Numbers
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {stats.map((item, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl shadow-lg bg-gradient-to-r 
                       from-indigo-500 via-blue-500 to-purple-500
                       dark:from-indigo-700 dark:via-blue-700 dark:to-purple-700
                       text-white"
            data-aos="zoom-in"
            data-aos-delay={index * 150}
          >
            <h3 className="text-4xl font-extrabold mb-2">
              {loading ? (
                <span className="animate-pulse">0</span>
              ) : (
                <AnimatedNumber value={item.value} duration={1400} />
              )}
              +
            </h3>
            <p className="text-lg font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
