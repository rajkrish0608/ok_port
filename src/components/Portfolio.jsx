import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Cpu, Server, Zap, Database, Code, Send } from 'lucide-react';
import * as THREE from 'three';
import _ from 'lodash';

// Custom Neural Network Background Component
const NeuralNetworkBackground = () => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create neural network nodes and connections
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);

    // Lines connecting nodes
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2
    });

    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    // Create connections between nearby points
    const connectNearbyPoints = () => {
      linesGroup.clear();

      const positions = particlesGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x1 = positions[i];
        const y1 = positions[i + 1];
        const z1 = positions[i + 2];

        for (let j = i + 3; j < positions.length; j += 3) {
          const x2 = positions[j];
          const y2 = positions[j + 1];
          const z2 = positions[j + 2];

          const distance = Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2) +
            Math.pow(z2 - z1, 2)
          );

          if (distance < 3) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y1, z1),
              new THREE.Vector3(x2, y2, z2)
            ]);

            const line = new THREE.Line(lineGeometry, linesMaterial);
            linesGroup.add(line);
          }
        }
      }
    };

    connectNearbyPoints();

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      particleSystem.rotation.x += 0.0005;
      particleSystem.rotation.y += 0.0005;
      linesGroup.rotation.x += 0.0005;
      linesGroup.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    setMounted(true);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />
  );
};

// ScrambleText Hook (top-level, outside all components)
const useScramble = (finalText, { delay = 0, speed = 40, chars = '01ABCDEF<>[]{}#@!' } = {}) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let frame = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay(
          finalText.split('').map((char, i) =>
            frame > i ? char : chars[Math.floor(Math.random() * chars.length)]
          ).join('')
        );
        frame++;
        if (frame > finalText.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => { clearTimeout(timeout); };
  }, [finalText, delay, speed]);
  return display || finalText.split('').map(() => ' ').join('');
};

// Hero 3D Wireframe Scene (top-level component)
const HeroScene = () => {
  const mountRef = useRef(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);

    const geo = new THREE.IcosahedronGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.25
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const innerGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff, transparent: true, opacity: 0.03
    });
    scene.add(new THREE.Mesh(innerGeo, innerMat));

    let mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    let t = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.01;
      mesh.rotation.y += 0.003;
      mesh.rotation.x += (mouse.y * 0.08 - mesh.rotation.x) * 0.05;
      mesh.rotation.z += (mouse.x * 0.04 - mesh.rotation.z) * 0.05;
      mat.opacity = 0.18 + Math.sin(t * 1.5) * 0.07;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      if (el && el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

// Hero Heading with character scramble animation
const HeroHeading = () => {
  const line1 = useScramble('ENGINEERING', { delay: 300, speed: 45 });
  const line2 = useScramble('INTELLIGENCE', { delay: 700, speed: 40 });
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-300 via-cyan-400 to-purple-400 text-transparent bg-clip-text tracking-tighter font-mono">
        {line1}
      </h2>
      <h2 className="text-6xl sm:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-400 via-cyan-400 to-cyan-300 text-transparent bg-clip-text tracking-tighter font-mono">
        {line2}
      </h2>
    </motion.div>
  );
};

// HUD Circle Component
const HudCircle = ({ size = 'md', pulseColor = 'cyan', className = '', children }) => {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
    '2xl': 'h-48 w-48',
  };

  const pulseColorClasses = {
    cyan: 'before:from-cyan-500/20 before:to-cyan-500/0',
    purple: 'before:from-purple-500/20 before:to-purple-500/0',
    red: 'before:from-red-500/20 before:to-red-500/0',
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center
      border border-cyan-500/50 backdrop-blur-sm 
      before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r
      ${pulseColorClasses[pulseColor]} before:animate-pulse before:z-0 ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Tech Skill Card Component
const TechSkillCard = ({ icon, name, level = 90, color = 'cyan' }) => {
  const colorClasses = {
    cyan: 'from-cyan-400 to-cyan-600',
    purple: 'from-purple-400 to-purple-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
  };

  return (
    <motion.div
      className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-cyan-400">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{name}</h3>
      </div>

      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

// Main Portfolio Component
export default function Portfolio() {
  const [section, setSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Simulate system boot
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Section navigation variants
  const navVariants = {
    inactive: { opacity: 0.7, scale: 1 },
    active: {
      opacity: 1,
      scale: 1.05,
      textShadow: '0 0 8px rgba(0, 255, 255, 0.7)',
    },
    hover: {
      scale: 1.1,
      textShadow: '0 0 12px rgba(0, 255, 255, 0.9)',
    }
  };

  const projects = [
    {
      id: 1,
      title: "Alzheimer’s Detection System",
      description: "An AI-powered healthcare solution designed to assist in the early detection of Alzheimer’s disease. The system analyzes cognitive patterns and medical indicators using machine learning models to identify early symptoms and risk factors.",
      tags: ["AI/ML pattern recognition", "Medical data analysis", "Risk prediction models", "Health data visualization"],
      color: "cyan",
      icon: <Cpu size={20} />,
      link: "#"
    },
    {
      id: 2,
      title: "AI Threat Detection System",
      description: "A cybersecurity-focused system that uses artificial intelligence to detect potential digital threats and suspicious activities in real time. It analyzes behavior patterns and network activity to identify anomalies and possible cyber attacks.",
      tags: ["ML anomaly detection", "Real-time monitoring", "Behavioral analysis", "Automated alerts"],
      color: "red",
      icon: <Zap size={20} />,
      link: "#"
    },
    {
      id: 3,
      title: "Smart Car Health Monitoring System",
      description: "An IoT-based system that continuously monitors a vehicle’s critical parameters such as engine condition, battery health, and system diagnostics. The platform helps detect faults early and prevents unexpected breakdowns.",
      tags: ["IoT telemetry", "Predictive maintenance", "Vehicle diagnostics", "Alert dashboards"],
      color: "blue",
      icon: <Database size={20} />,
      link: "#"
    },
    {
      id: 4,
      title: "Zenith OS",
      description: "A custom-built experimental operating system designed to explore low-level system architecture, process management, and kernel-level operations. The project focuses on understanding OS design and system programming fundamentals.",
      tags: ["Kernel architecture", "Memory & process management", "System programming", "Custom boot environment"],
      color: "purple",
      icon: <Server size={20} />,
      link: "#"
    },
    {
      id: 5,
      title: "Offline Survival Companion",
      description: "A mobile application designed to assist users during emergencies and disaster situations without requiring internet connectivity. It provides tools for navigation, emergency communication, and survival resources.",
      tags: ["Offline-first architecture", "GPS tracking", "Emergency SOS", "Local data storage"],
      color: "green",
      icon: <Zap size={20} />,
      link: "#"
    },
    {
      id: 6,
      title: "Jayram Jewellers Website",
      description: "A modern e-commerce and digital presence platform designed for a jewelry business to showcase products, manage inventory, and engage customers online.",
      tags: ["Responsive web design", "Inventory management", "Secure contact forms", "SEO architecture"],
      color: "cyan",
      icon: <Code size={20} />,
      link: "#"
    },
    {
      id: 7,
      title: "Autonomous Rover",
      description: "A robotics project involving the development of a rover capable of navigating environments autonomously. It integrates sensors and control algorithms to move through complex paths without human intervention.",
      tags: ["Autonomous navigation", "Microcontroller integration", "Obstacle detection", "Robotics control"],
      color: "purple",
      icon: <Cpu size={20} />,
      link: "#"
    },
    {
      id: 8,
      title: "IV Drip Monitoring System",
      description: "A smart healthcare device designed to monitor IV fluid levels and flow rates in hospitals, helping prevent empty drips and ensuring patient safety.",
      tags: ["IoT medical monitoring", "Real-time fluid detection", "Alert notifications", "Embedded hardware"],
      color: "blue",
      icon: <Database size={20} />,
      link: "#"
    },
    {
      id: 9,
      title: "Smart Health Monitoring System",
      description: "A wearable or IoT-based healthcare system designed to track vital signs such as heart rate, temperature, and other physiological parameters for continuous health monitoring.",
      tags: ["IoT health sensors", "Real-time biometrics", "Health analytics", "Remote dashboards"],
      color: "green",
      icon: <Cpu size={20} />,
      link: "#"
    },
    {
      id: 10,
      title: "OxiTech",
      description: "A technology solution focused on monitoring and optimizing oxygen usage in medical or industrial environments. The system ensures efficient oxygen management and safety compliance.",
      tags: ["Oxygen sensors", "IoT alerts", "Data visualization", "Safety tracking"],
      color: "cyan",
      icon: <Server size={20} />,
      link: "#"
    },
    {
      id: 11,
      title: "IoT Gas Leakage Detection System",
      description: "A safety-focused IoT device that detects gas leaks in residential or industrial environments and immediately triggers alerts to prevent accidents.",
      tags: ["Gas sensors", "Real-time alerts", "IoT connectivity", "Safety automation"],
      color: "red",
      icon: <Zap size={20} />,
      link: "#"
    },
    {
      id: 12,
      title: "HireFlow",
      description: "An AI-powered recruitment platform designed to streamline the hiring process by automating resume screening, candidate evaluation, and interview scheduling.",
      tags: ["AI resume analysis", "Automated scoring", "HR dashboard", "Interview scheduling"],
      color: "blue",
      icon: <Code size={20} />,
      link: "#"
    },
    {
      id: 13,
      title: "WorkProof",
      description: "A digital productivity and verification platform designed to track and validate work completion, ensuring transparency and accountability in professional tasks.",
      tags: ["Work verification", "Data logging", "Task dashboards", "Secure records"],
      color: "purple",
      icon: <Database size={20} />,
      link: "#"
    },
    {
      id: 14,
      title: "RentLedger",
      description: "A financial management platform designed to simplify rent tracking, payment records, and financial transparency between tenants and property owners.",
      tags: ["Digital rent tracking", "Payment records", "Financial analytics", "Secure storage"],
      color: "green",
      icon: <Server size={20} />,
      link: "#"
    }
  ];

  // System boot sequence
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-400 font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-8 tracking-wider">SYSTEM BOOT SEQUENCE</h1>

          <div className="space-y-4 text-left max-w-md mx-auto">
            {[
              "Initializing neural network interface...",
              "Loading quantum algorithms...",
              "Calibrating holographic display...",
              "Establishing secure connection...",
              "Activating user interface..."
            ].map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.4 }}
                className="flex items-center"
              >
                <ChevronRight size={16} className="mr-2 text-cyan-500" />
                <span>{text}</span>
                {index === 4 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-2"
                  >
                    _
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 2 }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mt-8 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden relative">
      {/* Neural network background */}
      <NeuralNetworkBackground />

      {/* Overlay patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-screen bg-[url('/grid.svg')] opacity-20"></div>
      </div>

      {/* Header with HUD elements */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md bg-black/30 border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <motion.h1
            className="text-2xl font-bold text-cyan-400 tracking-widest relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              textShadow: ['0 0 0px rgba(34, 211, 238, 0)', '0 0 10px rgba(34, 211, 238, 0.7)', '0 0 5px rgba(34, 211, 238, 0.5)']
            }}
            transition={{
              duration: 1,
              textShadow: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
            }}
          >
            RAJ_KRISH
            <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-500 to-transparent"></span>
          </motion.h1>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm">
            {['home', 'about', 'projects', 'skills', 'contact', 'awards'].map(s => (
              <motion.a
                key={s}
                href={`#${s}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }); setSection(s); }}
                variants={navVariants}
                initial="inactive"
                animate={section === s ? "active" : "inactive"}
                whileHover="hover"
                transition={{ duration: 0.2 }}
                className={`uppercase tracking-wider relative ${section === s ? 'text-cyan-300' : 'text-gray-300'}`}
              >
                {s}
                {section === s && (
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-500"
                    layoutId="navIndicator"
                  />
                )}
              </motion.a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">


          <motion.section
            id="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh] py-24 md:py-32 relative gap-8 scroll-mt-24"
          >
            {/* LEFT: text content */}
            <div className="flex-1 flex flex-col items-start lg:items-start text-left">
              {/* Status badge */}
              <motion.div
                className="flex items-center gap-2 mb-6 text-xs text-gray-400 font-mono"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                <span className="text-green-400">SYSTEM ONLINE</span>
                <span className="ml-4 text-cyan-600">[SYS: 98.7%]</span>
              </motion.div>

              {/* Main title with scramble */}
              <HeroHeading />

              {/* Stat counters */}
              <motion.div
                className="flex gap-8 mt-6 text-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[['2×', 'INTL AWARDS'], ['5×', 'NATIONAL'], ['200+', 'COMMUNITY'], ['14', 'PROJECTS']].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <div className="text-cyan-400 text-xl font-bold">{n}</div>
                    <div className="text-gray-500 text-xs">{l}</div>
                  </div>
                ))}
              </motion.div>

              {/* Bio */}
              <motion.p
                className="text-gray-400 max-w-md mt-6 text-sm font-mono"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <span className="text-cyan-400">// Bio:</span> Robotics & AI Engineer — ESP32 to neural networks, schematic to deployment.
              </motion.p>

              {/* Links and CTA */}
              <motion.div
                className="mt-8 flex flex-wrap gap-4 items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <a href="/Raj_Resume.pdf" target="_blank"
                  className="relative group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 overflow-hidden transition-all duration-300 hover:text-black hover:border-cyan-400"
                >
                  <span className="absolute inset-0 bg-cyan-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                  <span className="relative z-10">📄 DOSSIER</span>
                </a>
                <a href="https://www.linkedin.com/in/raj-krish-3a7a3b285/" target="_blank" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">LinkedIn</a>
                <a href="https://github.com/rajkrish0608" target="_blank" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">GitHub</a>
                <a href="mailto:rajkrish060804@gmail.com" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">Email</a>
              </motion.div>
            </div>

            {/* RIGHT: 3D wireframe scene */}
            <motion.div
              className="flex-1 w-full max-w-sm lg:max-w-md h-80 lg:h-[480px] relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            >
              {/* HUD corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500 z-10" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500 z-10" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500 z-10" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500 z-10" />
              <div className="absolute inset-0 z-0">
                <HeroScene />
              </div>
              {/* Profile photo overlay centered in sphere */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-400/60 overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                  <img src="/profile.jpg" alt="Profile" className="object-cover w-full h-full" />
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-cyan-600/70 font-mono tracking-widest">RAJ_KRISH.exe</div>
            </motion.div>

            {/* Decorative code comment */}
            <div className="absolute bottom-4 left-0 text-xs text-cyan-600/50 hidden lg:block font-mono">
              <pre>{`/* SYS: ONLINE · AI: ACTIVE · BUILD: READY */`}</pre>
            </div>
          </motion.section>


          <motion.section
            id="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto py-24 md:py-32 px-4 scroll-mt-24"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* About content */}
              <motion.div
                className="flex-1 space-y-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text">
                  SYSTEM ARCHITECT
                </h2>

                <div className="space-y-4 text-gray-300">
                  <p>
                    I'm Raj Krish — a Robotics & AI Engineer who builds systems that think, sense, and act.
                  </p>

                  <p>
                    Not prototypes. Not demos. Production-grade machines that solve problems people haven't fully articulated yet.
                  </p>

                  <p>
                    I operate at the intersection of hardware and intelligence — where an ESP32 talks to a neural network, where a sensor array feeds a real-time decision engine, where the gap between "concept" and "deployed" closes in weeks, not years.
                  </p>

                  <p>
                    Harvard Hackathon Winner. Microsoft × Stanford Finalist. 2× International & 5× National Tech Competition Winner. B.Tech Computer Engineering, Batch '27 — still building.
                  </p>

                  <p>
                    My work spans battlefield AI wearables, emergency health systems, smart mobility, and offline-first mobile platforms. Every project starts with one question:
                  </p>

                  <p className="italic text-cyan-400 font-semibold my-4">
                    "What breaks if this doesn't work?"
                  </p>

                  <p>
                    That question drives every circuit I design, every model I train, every line of code I ship.
                  </p>

                  <p>
                    I founded Pradyog — a 200+ member student tech chapter — because great builders need a community to sharpen against. I serve as Vice Chair of the IEEE Computer Society chapter because standards matter when lives are on the line.
                  </p>

                  <p className="mt-6 font-bold text-white text-lg">
                    I don't build for portfolios.<br />
                    I build for impact.
                  </p>
                </div>

              </motion.div>

              {/* Decorative visualization */}
              <motion.div
                className="relative w-full max-w-md aspect-square"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="w-full h-full rounded-xl border border-cyan-500/30 backdrop-blur-sm bg-black/30 overflow-hidden p-4 relative">
                  {/* Placeholder for a 3D model or visualization */}
                  <div className="absolute inset-0 flex items-center justify-center text-cyan-500/50">
                    <div className="text-center">
                      <div className="text-8xl mb-4 opacity-30">🤖</div>
                      <div className="text-xs text-cyan-400/70">NEURAL ARCHITECTURE VISUALIZATION</div>
                    </div>
                  </div>

                  {/* HUD corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
                </div>
              </motion.div>
            </div>
          </motion.section>


          <motion.section
            id="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="py-24 md:py-32 px-4 scroll-mt-24"
          >
            <motion.h2
              className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              PROJECT DATABASE
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden bg-black/40 backdrop-blur-sm border border-cyan-500/30 h-full flex flex-col group hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300">
                    <CardContent className="p-6 relative flex flex-col flex-grow">
                      {/* Top corner decoration */}
                      <div className="absolute top-0 right-0 w-12 h-12">
                        <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-cyan-500/50"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-cyan-500"></div>
                      </div>

                      {/* Project icon */}
                      <div className="mb-4 text-cyan-400">
                        {project.icon}
                      </div>

                      {/* Project title */}
                      <h3 className="text-xl font-bold text-cyan-300 mb-2 group-hover:text-cyan-200 transition-colors">
                        {project.title}
                      </h3>

                      {/* Project description */}
                      <p className="text-gray-400 text-sm mb-4">
                        {project.description}
                      </p>

                      {/* Project tags */}
                      <div className="flex flex-wrap gap-2 mt-auto mb-4">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs py-1 px-2 rounded-sm bg-cyan-900/30 text-cyan-300 border border-cyan-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* View Project Link/Button */}
                      <div className="mt-auto pt-4 text-right">
                        <a
                          href={project.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors py-1.5 px-3 border border-cyan-500/30 rounded-sm hover:bg-cyan-900/40"
                        >
                          View Project <ChevronRight size={14} className="ml-1" />
                        </a>
                      </div>

                      {/* Bottom scan line effect */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-cyan-500/50"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>


          <motion.section
            id="skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="py-24 md:py-32 px-4 scroll-mt-24"
          >
            <motion.h2
              className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              TECHNICAL CAPABILITIES
            </motion.h2>

            <motion.p
              className="text-center text-gray-300 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Core technologies and frameworks I use to build advanced AI and robotic systems.
            </motion.p>



            <div className="max-w-5xl mx-auto space-y-10">

              {/* ROBOTICS & EMBEDDED */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-cyan-400 tracking-widest mb-4 border-b border-cyan-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  [ ROBOTICS & EMBEDDED ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Server size={24} />} name="ROS" level={88} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="ESP32" level={95} color="cyan" />
                  <TechSkillCard icon={<Code size={24} />} name="Raspberry Pi" level={96} color="red" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Arduino" level={94} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="LIDAR" level={85} color="purple" />
                  <TechSkillCard icon={<Cpu size={24} />} name="IMU Sensors" level={88} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Thermal Cameras" level={82} color="red" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Sensor Fusion" level={90} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="PCB Design" level={80} color="purple" />
                  <TechSkillCard icon={<Zap size={24} />} name="Embedded C/C++" level={92} color="red" />
                  <TechSkillCard icon={<Zap size={24} />} name="Real-Time Systems" level={89} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Actuator Control" level={87} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Autonomous Navigation" level={91} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Servo & Motor Control" level={90} color="purple" />
                </div>
              </div>

              {/* ARTIFICIAL INTELLIGENCE */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-purple-400 tracking-widest mb-4 border-b border-purple-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  [ ARTIFICIAL INTELLIGENCE ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Cpu size={24} />} name="Python" level={98} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="TensorFlow" level={95} color="cyan" />
                  <TechSkillCard icon={<Database size={24} />} name="OpenCV" level={89} color="blue" />
                  <TechSkillCard icon={<Database size={24} />} name="Computer Vision" level={88} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Neural Networks" level={93} color="purple" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Edge AI" level={90} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="TinyML" level={85} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Embedded ML" level={88} color="red" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Facial Recognition" level={86} color="purple" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Spectral Analysis" level={80} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="YOLO" level={87} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Random Forest" level={84} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="CNN" level={91} color="purple" />
                </div>
              </div>

              {/* IoT & HARDWARE SYSTEMS */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-green-400 tracking-widest mb-4 border-b border-green-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  [ IoT & HARDWARE SYSTEMS ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Cpu size={24} />} name="ESP32 Microcontrollers" level={95} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="MQTT Protocol" level={88} color="green" />
                  <TechSkillCard icon={<Zap size={24} />} name="WiFi" level={92} color="blue" />
                  <TechSkillCard icon={<Zap size={24} />} name="Bluetooth" level={87} color="purple" />
                  <TechSkillCard icon={<Zap size={24} />} name="LoRa Communication" level={80} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Sensor Integration" level={93} color="green" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Edge Computing" level={91} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="HW-SW Bridge Design" level={88} color="red" />
                  <TechSkillCard icon={<Code size={24} />} name="Firmware Development" level={90} color="cyan" />
                </div>
              </div>

              {/* FULL-STACK DEVELOPMENT */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-blue-400 tracking-widest mb-4 border-b border-blue-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  [ FULL-STACK DEVELOPMENT ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Code size={24} />} name="React.js" level={92} color="cyan" />
                  <TechSkillCard icon={<Server size={24} />} name="Node.js" level={94} color="green" />
                  <TechSkillCard icon={<Code size={24} />} name="Flutter" level={88} color="blue" />
                  <TechSkillCard icon={<Code size={24} />} name="BLoC" level={85} color="purple" />
                  <TechSkillCard icon={<Database size={24} />} name="PostgreSQL" level={86} color="blue" />
                  <TechSkillCard icon={<Database size={24} />} name="SQLite" level={90} color="cyan" />
                  <TechSkillCard icon={<Database size={24} />} name="Hive" level={83} color="green" />
                  <TechSkillCard icon={<Server size={24} />} name="REST APIs" level={93} color="cyan" />
                  <TechSkillCard icon={<Server size={24} />} name="Express.js" level={91} color="red" />
                  <TechSkillCard icon={<Code size={24} />} name="HTML5 · CSS3 · JS" level={96} color="blue" />
                  <TechSkillCard icon={<Code size={24} />} name="Offline-First Architecture" level={88} color="purple" />
                </div>
              </div>

              {/* SECURITY & RESILIENCE */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-red-400 tracking-widest mb-4 border-b border-red-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  [ SECURITY & RESILIENCE ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Zap size={24} />} name="AES-256 Encryption" level={88} color="red" />
                  <TechSkillCard icon={<Database size={24} />} name="Secure Local Storage" level={90} color="cyan" />
                  <TechSkillCard icon={<Server size={24} />} name="Fault-Tolerant Design" level={87} color="purple" />
                  <TechSkillCard icon={<Code size={24} />} name="Offline-First Data Arch" level={89} color="blue" />
                </div>
              </div>

              {/* TOOLS & WORKFLOW */}
              <div>
                <motion.h3
                  className="text-lg font-bold text-cyan-400 tracking-widest mb-4 border-b border-cyan-500/30 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  [ TOOLS & WORKFLOW ]
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TechSkillCard icon={<Server size={24} />} name="Git & GitHub" level={95} color="green" />
                  <TechSkillCard icon={<Code size={24} />} name="VS Code" level={96} color="blue" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Arduino IDE" level={94} color="cyan" />
                  <TechSkillCard icon={<Cpu size={24} />} name="Proteus" level={82} color="purple" />
                  <TechSkillCard icon={<Cpu size={24} />} name="KiCad" level={80} color="green" />
                  <TechSkillCard icon={<Code size={24} />} name="Figma" level={85} color="purple" />
                  <TechSkillCard icon={<Server size={24} />} name="Postman" level={90} color="red" />
                  <TechSkillCard icon={<Server size={24} />} name="Linux" level={91} color="cyan" />
                  <TechSkillCard icon={<Server size={24} />} name="Docker" level={83} color="blue" />
                  <TechSkillCard icon={<Database size={24} />} name="Firebase" level={93} color="red" />
                </div>
              </div>

            </div>
          </motion.section>





          <motion.section
            id="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="py-24 md:py-32 px-4 scroll-mt-24"
          >
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text">
              Contact Me
            </h2>

            {/* Added text from Home Menu */}
            <motion.p
              className="text-center text-gray-300 max-w-2xl mx-auto mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              🚀 Building something bold? Crafting battlefield bots, medtech wearables, or real-time AI systems?
              I love trading notes with fellow builders—send me what you’re making.
              Let’s collaborate on tech that doesn’t just work—it matters.
            </motion.p>

            {/* Contact Form */}
            <form
              className="max-w-xl mx-auto space-y-4"
              action="https://formspree.io/f/xjkwdrby"
              method="POST"
            >
              <div className="relative">
                <span className="absolute left-3 top-3 text-cyan-600 text-xs font-mono">NAME &gt;</span>
                <input type="text" name="name" placeholder="Raj Krish" required
                  className="w-full pl-20 pr-4 py-3 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors rounded-sm" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-cyan-600 text-xs font-mono">EMAIL &gt;</span>
                <input type="email" name="email" placeholder="you@domain.com" required
                  className="w-full pl-20 pr-4 py-3 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors rounded-sm" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-cyan-600 text-xs font-mono">SUBJ &gt;</span>
                <input type="text" name="subject" placeholder="Collaboration / Hire / Build"
                  className="w-full pl-20 pr-4 py-3 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors rounded-sm" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-cyan-600 text-xs font-mono">MSG &gt;</span>
                <textarea name="message" rows="5" placeholder="Your message..." required
                  className="w-full pl-20 pr-4 py-3 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors rounded-sm resize-none" />
              </div>
              <button
                type="submit"
                className="relative group w-full py-3 text-sm font-bold font-mono tracking-widest text-cyan-300 border border-cyan-500/50 bg-cyan-500/5 overflow-hidden transition-all hover:text-black"
              >
                <span className="absolute inset-0 bg-cyan-400 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10">⟩ TRANSMIT MESSAGE</span>
              </button>
            </form>

            {/* Contact Links */}
            <motion.div
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-cyan-400">Connect with me:</h3>
              <div className="flex justify-center gap-4">
                <a href="https://www.linkedin.com/in/raj-krish-3a7a3b285/" target="_blank" className="text-cyan-400 hover:underline">LinkedIn</a>
                <a href="https://github.com/rajkrish0608" target="_blank" className="text-cyan-400 hover:underline">GitHub</a>
                <a href="https://yourwebsite.com" target="_blank" className="text-cyan-400 hover:underline">Website</a>
                <a href="mailto:rajkrish060804@gmail.com" className="text-cyan-400 hover:underline">Email</a>
              </div>
            </motion.div>
          </motion.section>


          <motion.section
            id="awards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}

            transition={{ duration: 0.5 }}
            className="py-24 md:py-32 px-4 scroll-mt-24"
          >
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text">
              Awards & Achievements
            </h2>

            {/* Awards Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

              <Card className="bg-black/40 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm">
                <CardContent>
                  <h3 className="text-lg font-bold text-cyan-300 mb-3">Pradyog Student Chapter</h3>
                  <p className="text-gray-300">
                    Founded a student-led initiative, mentoring "200+ students" in IoT, Robotics, and AI/ML through hands-on sessions and tech challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
                <CardContent>
                  <h3 className="text-lg font-bold text-purple-300 mb-3">Acehack 4.0 & HackUEM</h3>
                  <p className="text-gray-300">
                    Organized large-scale hackathons ("1000+ participants, 100+ sponsors") to cultivate innovation on campus.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 backdrop-blur-sm">
                <CardContent>
                  <h3 className="text-lg font-bold text-yellow-300 mb-3">Hackathon Highlights</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>🥇 Harvard Business School Hackathon</li>
                    <li>🥇 IIIT Delhi Esya-23</li>
                    <li>🥈 Microsoft × Stanford Hackathon</li>
                    <li>🥉 SKIT Startup Expo</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Research Paper Card */}
              <Card className="bg-black/40 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
                <CardContent>
                  <h3 className="text-lg font-bold text-blue-300 mb-3">📘 Research Paper</h3>
                  <p className="text-gray-300">
                    Published a paper on "Real-Time Gas Detection System using AI-enhanced Sensors" in the International Journal of Emerging Tech Research.
                  </p>
                </CardContent>
              </Card>

            </div>
          </motion.section>




          {/* close AnimatePresence */}

        </div>
        {/* close max-w-7xl container */}

      </main>
      {/* close main */}

    </div>
  );
}

