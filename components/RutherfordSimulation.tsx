
import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, PerspectiveCamera, Sparkles, Box, Line, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Topic } from '../types';
import { Play, Pause, RefreshCw, Info, Eye, EyeOff, Zap, Activity, Target, List, Layout, Microscope } from 'lucide-react';

const MAX_PARTICLES = 120;

const ParticlesLayer: React.FC<{ 
  speed: number;
  isPaused: boolean;
  showDataLog: boolean;
  onStatsUpdate: (type: 'fired' | 'deflected' | 'rebounded') => void;
}> = ({ speed, isPaused, showDataLog, onStatsUpdate }) => {
  const meshRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<any[]>([]);
  
  const nuclei = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const spacing = 4.5; // Slightly increased spacing to emphasize empty space
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        positions.push(new THREE.Vector3(0, x * spacing, y * spacing));
      }
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (isPaused || !meshRef.current) return;

    const frameSpeed = delta * 60 * speed;

    if (Math.random() < 0.15 * speed && particlesRef.current.length < MAX_PARTICLES) {
      const typeRoll = Math.random();
      let fate: 'passed' | 'deflected' | 'rebounded' = 'passed';
      
      // Boosted probabilities for educational visibility
      if (typeRoll > 0.96) fate = 'rebounded'; 
      else if (typeRoll > 0.85) fate = 'deflected'; 

      let startY = (Math.random() - 0.5) * 10;
      let startZ = (Math.random() - 0.5) * 10;

      if (fate === 'rebounded') {
        const targetNucleus = nuclei[Math.floor(Math.random() * nuclei.length)];
        startY = targetNucleus.y + (Math.random() - 0.5) * 0.05; 
        startZ = targetNucleus.z + (Math.random() - 0.5) * 0.05;
      } else if (fate === 'deflected') {
        const targetNucleus = nuclei[Math.floor(Math.random() * nuclei.length)];
        const angle = Math.random() * Math.PI * 2;
        const offset = 0.5;
        startY = targetNucleus.y + Math.cos(angle) * offset;
        startZ = targetNucleus.z + Math.sin(angle) * offset;
      }

      const p = {
        pos: new THREE.Vector3(-18.5, startY, startZ),
        vel: new THREE.Vector3(0.38, 0, 0), 
        status: 'passed', 
        fate: fate,
        active: true,
        life: 0,
        hasInteracted: false,
        labelTimer: 0,
        trail: [] as THREE.Vector3[]
      };
      particlesRef.current.push(p);
      onStatsUpdate('fired');
    }

    particlesRef.current.forEach((p) => {
      if (!p.active) return;
      
      p.pos.add(p.vel.clone().multiplyScalar(frameSpeed));
      p.life += frameSpeed;
      
      if (p.life % 3 < 1) {
        p.trail.push(p.pos.clone());
        if (p.trail.length > 12) p.trail.shift();
      }

      // Proximity interaction with nuclei
      if (!p.hasInteracted && p.pos.x >= -0.3 && p.pos.x <= 0.3) {
        for (const nucleus of nuclei) {
          const dist = p.pos.distanceTo(nucleus);
          
          if (p.fate === 'rebounded' && dist < 0.55) {
            p.vel.set(-0.38, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05);
            p.status = 'rebounded';
            p.hasInteracted = true;
            p.labelTimer = 40;
            onStatsUpdate('rebounded');
            break;
          } 
          else if (p.fate === 'deflected' && dist < 1.8) {
            const repulsionDir = p.pos.clone().sub(nucleus).normalize();
            p.vel.add(repulsionDir.multiplyScalar(0.35));
            p.status = 'deflected';
            p.hasInteracted = true;
            p.labelTimer = 40;
            onStatsUpdate('deflected');
            break;
          }
        }
      }

      if (p.labelTimer > 0) p.labelTimer -= frameSpeed;

      if (p.hasInteracted && p.status === 'deflected' && Math.abs(p.pos.x) < 6) {
         p.vel.y *= (1 + 0.015 * frameSpeed); 
         p.vel.z *= (1 + 0.015 * frameSpeed);
      }

      if (Math.abs(p.pos.x) > 30 || p.life > 900) {
        p.active = false;
      }
    });

    particlesRef.current = particlesRef.current.filter(p => p.active);
  });

  return (
    <group ref={meshRef}>
      {particlesRef.current.map((p, i) => (
        <group key={i}>
          <mesh position={p.pos}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshBasicMaterial color={p.status === 'rebounded' ? '#ff3333' : p.status === 'deflected' ? '#ffff33' : '#33ff33'} />
          </mesh>
          {p.trail.length > 1 && (
            <Line
              points={p.trail}
              color={p.status === 'rebounded' ? '#ff3333' : p.status === 'deflected' ? '#ffff33' : '#33ff33'}
              lineWidth={1}
              transparent
              opacity={0.08}
            />
          )}
          {p.hasInteracted && p.labelTimer > 0 && showDataLog && (
            <Html position={p.pos} center distanceFactor={10} pointerEvents="none">
              <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter shadow-xl whitespace-nowrap animate-pulse ${p.status === 'rebounded' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'}`}>
                {p.status === 'rebounded' ? 'REBOUNDED' : 'DEFLECTED'}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
};

const CollimatorSource: React.FC = () => {
  return (
    <group position={[-21, 0, 0]}>
      <Box args={[3.5, 4.5, 4.5]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </Box>
      <group position={[1.75, 0, 0]}>
        <Cylinder args={[0.4, 0.6, 1, 16]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#2a2a2a" />
        </Cylinder>
        <Box args={[0.1, 12, 12]} position={[2.5, 0, 0]}>
          <meshStandardMaterial color="#111" transparent opacity={0.8} />
        </Box>
        <Box args={[0.15, 9, 9]} position={[2.5, 0, 0]}>
           <meshBasicMaterial color="#00ff00" transparent opacity={0.05} />
        </Box>
      </group>
      <Text position={[0, 3.5, 0]} fontSize={0.4} color="white" fontWeight="bold">ALPHA EMITTER</Text>
    </group>
  );
};

const GoldFoilWall: React.FC<{ showCloud: boolean }> = ({ showCloud }) => {
  return (
    <group>
      {/* 
          SCIENTIFIC CORRECTION: 
          Representing the gold foil as an extremely thin sheet (1000 atoms thick).
          Using a near-transparent plane with a subtle metallic glint.
      */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial 
          color="#ffd700" 
          transparent 
          opacity={0.08} 
          metalness={1} 
          roughness={0.05} 
          emissive="#ffd700"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Surface Sparkles to suggest thin metallic foil texture without making it opaque */}
      <Sparkles count={100} scale={[0.05, 16, 16]} size={4} color="#ffd700" opacity={0.5} />

      {/* Frame for physical context */}
      <group>
        <Box args={[0.2, 16.5, 0.2]} position={[0, 0, 8.25]}>
          <meshStandardMaterial color="#111" />
        </Box>
        <Box args={[0.2, 16.5, 0.2]} position={[0, 0, -8.25]}>
          <meshStandardMaterial color="#111" />
        </Box>
        <Box args={[0.2, 0.2, 16.5]} position={[0, 8.25, 0]}>
          <meshStandardMaterial color="#111" />
        </Box>
        <Box args={[0.2, 0.2, 16.5]} position={[0, -8.25, 0]}>
          <meshStandardMaterial color="#111" />
        </Box>
      </group>

      <Text position={[0, 9.8, 0]} fontSize={0.6} color="#ffd700" fontWeight="black" tracking={0.1}>ULTRA-THIN GOLD LEAF</Text>
      
      {/* Nuclei Inside the Foil - Spaced out to show empty space */}
      {[-1, 0, 1].map(x => [-1, 0, 1].map(y => (
        <group key={`${x}-${y}`} position={[0, x * 4.5, y * 4.5]}>
          {showCloud && (
            <mesh>
              <sphereGeometry args={[2.1, 16, 16]} />
              <meshStandardMaterial color="#ffd700" transparent opacity={0.02} />
            </mesh>
          )}
          <mesh>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )))}
      <Text position={[0, 1, 0.8]} fontSize={0.3} color="#ffff00" fontWeight="bold">NUCLEUS (POSITIVE)</Text>
    </group>
  );
};

const RutherfordSimulation: React.FC<{ topic: Topic }> = ({ topic }) => {
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showCloud, setShowCloud] = useState(true);
  const [showDataLog, setShowDataLog] = useState(true);
  const [stats, setStats] = useState({ fired: 0, deflected: 0, rebounded: 0 });

  const updateStats = (type: 'fired' | 'deflected' | 'rebounded') => {
    setStats(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const resetSimulation = () => {
    setStats({ fired: 0, deflected: 0, rebounded: 0 });
  };

  const passPercentage = stats.fired > 0 
    ? (((stats.fired - stats.deflected - stats.rebounded) / stats.fired) * 100).toFixed(1) 
    : "0.0";
  const deflectPercentage = stats.fired > 0 
    ? ((stats.deflected / stats.fired) * 100).toFixed(1) 
    : "0.0";
  const reboundPercentage = stats.fired > 0 
    ? ((stats.rebounded / stats.fired) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] bg-[#000000] rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-2xl">
      
      <div className="relative flex-grow h-full w-full bg-black">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-yellow-500 font-bold uppercase tracking-widest animate-pulse">Positioning Foil Layers...</div>}>
          <Canvas gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%' }}>
            <PerspectiveCamera makeDefault position={[-38, 18, 28]} fov={30} />
            <OrbitControls enableDamping dampingFactor={0.1} minDistance={15} maxDistance={75} />
            
            <color attach="background" args={['#000000']} />
            <Stars radius={120} depth={60} count={500} factor={4} saturation={0} fade speed={0.4} />
            
            <ambientLight intensity={2.0} />
            <pointLight position={[10, 20, 10]} intensity={1.2} color="#ffffff" />
            <spotLight position={[-25, 0, 0]} angle={0.25} intensity={35} color="#33ff33" penumbra={1} />

            <CollimatorSource />
            
            <GoldFoilWall showCloud={showCloud} />
            
            <ParticlesLayer 
              speed={speed} 
              isPaused={isPaused} 
              showDataLog={showDataLog}
              onStatsUpdate={updateStats} 
            />

            <gridHelper args={[100, 30, 0x111111, 0x060606]} position={[0, -14, 0]} />
          </Canvas>
        </Suspense>

        {showDataLog && (
          <div className="absolute top-6 left-6 space-y-4 pointer-events-none transition-all duration-500 animate-fadeIn">
            <div className="bg-black/90 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl min-w-[280px] shadow-2xl">
               <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-yellow-500" />
                    <span className="text-[11px] text-gray-400 uppercase font-black tracking-widest">Scientific Analysis</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-yellow-500 text-[9px] font-black text-black uppercase">LIVE</div>
               </div>
               <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                      <span className="text-green-500">Un-deflected (Empty Space)</span>
                      <span className="text-white">{passPercentage}%</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-green-500 transition-all duration-700 shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: `${passPercentage}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                      <span className="text-yellow-500">Deflected (Repulsion)</span>
                      <span className="text-white">{deflectPercentage}%</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-yellow-500 transition-all duration-700 shadow-[0_0_10px_rgba(234,179,8,0.4)]" style={{ width: `${deflectPercentage}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                      <span className="text-red-500">Rebounded (Head-on)</span>
                      <span className="text-white">{reboundPercentage}%</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-red-500 transition-all duration-700 shadow-[0_0_10px_rgba(239,68,68,0.4)]" style={{ width: `${reboundPercentage}%` }} />
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-yellow-500/10 backdrop-blur-xl p-5 rounded-2xl border-l-4 border-yellow-500 max-w-[340px] shadow-2xl border border-white/5">
               <h4 className="text-[10px] font-black text-yellow-500 uppercase mb-2 flex items-center gap-1.5 tracking-widest"><Target size={14}/> Simulation Note</h4>
               <p className="text-[12px] text-gray-300 leading-relaxed font-medium">
                 The gold foil used was extremely thin—about a thousand atoms thick—allowing most alpha particles to pass straight through the <span className="text-white font-bold">vast empty space</span> of the atom.
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-80 bg-neutral-950 border-l border-white/10 p-8 flex flex-col gap-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Zap size={28} className="text-yellow-500" /> VIRTUAL LAB
          </h2>
          <p className="text-[10px] text-gray-500 tracking-[0.4em] font-black uppercase pl-1">Alpha Scattering Lab</p>
        </div>

        <div className="space-y-8 flex-grow">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.07] transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-xl group-hover:scale-110 transition-transform">
               <Microscope size={32} />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-widest text-white">Nuclear Model</h3>
              <p className="text-[11px] text-gray-500 uppercase font-black tracking-tighter opacity-70 mt-1">Experimental Simulation</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
            >
              {isPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={resetSimulation} className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group hover:scale-[1.02] active:scale-95">
              <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] text-gray-500 uppercase font-black tracking-widest">Beam Velocity</label>
              <span className="text-[11px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 tracking-tighter">v {speed.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.5" max="3.0" step="0.1" value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-yellow-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowCloud(!showCloud)}
              className={`py-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showCloud ? 'bg-white/10 text-white shadow-inner' : 'bg-transparent text-gray-700'}`}
            >
              {showCloud ? <Eye size={18} /> : <EyeOff size={18} />}
              Orbitals
            </button>
            <button 
              onClick={() => setShowDataLog(!showDataLog)}
              className={`py-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showDataLog ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-gray-400'}`}
            >
              {showDataLog ? <Layout size={18} /> : <List size={18} />}
              Stats Log
            </button>
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Info size={40} className="text-green-500" />
          </div>
          <h3 className="text-xs font-black text-green-400 mb-2 uppercase flex items-center gap-2">
             Key Discovery
          </h3>
          <p className="text-[12px] text-gray-400 leading-relaxed font-medium relative z-10">
            "Since most particles pass through without deflection, Rutherford concluded that the atom is <span className="text-white font-bold underline decoration-yellow-500 underline-offset-4">mostly empty space</span>."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RutherfordSimulation;
