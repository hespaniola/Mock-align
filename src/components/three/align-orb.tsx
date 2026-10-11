"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The ALIGN centerpiece: a living core encircled by three orbits that start
 * out of phase and gradually come into alignment — the product's idea made
 * visible. Alignment is driven by an idle breath plus the page scroll.
 *
 * Kept deliberately light: ~4 meshes, one sparkle field, a procedural
 * environment (no HDR download), capped DPR, and rendering pauses whenever
 * the canvas is off-screen or the tab is hidden.
 */

interface OrbProps {
  /** 0 → scattered orbits, 1 → fully aligned. */
  align?: MotionValue<number>;
  /** Accent colour for orbits / glow. */
  accent?: string;
  className?: string;
  onReady?: () => void;
  onContextLost?: () => void;
}

const RINGS = [
  { radius: 1.55, tube: 0.012, tilt: new THREE.Euler(1.1, 0.4, 0.2), speed: 0.12 },
  { radius: 1.9, tube: 0.009, tilt: new THREE.Euler(-0.6, 1.0, -0.4), speed: -0.08 },
  { radius: 2.3, tube: 0.007, tilt: new THREE.Euler(0.3, -0.9, 0.9), speed: 0.05 },
];
/** Shared aligned pose: a gentle, cinematic tilt toward the camera. */
const ALIGNED = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.28, 0, 0.08));

function Rings({ align, accent }: { align?: MotionValue<number>; accent: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const start = useMemo(() => RINGS.map((r) => new THREE.Quaternion().setFromEuler(r.tilt)), []);
  const tmp = useMemo(() => new THREE.Quaternion(), []);
  const spin = useMemo(() => new THREE.Quaternion(), []);
  const axis = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const smoothed = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // A slow breath toward alignment, nudged fully home by scroll.
    const idle = 0.35 + 0.25 * Math.sin(t * 0.25);
    const target = Math.min(1, Math.max(idle, align?.get() ?? 0));
    smoothed.current = THREE.MathUtils.damp(smoothed.current, target, 2.2, delta);
    const k = smoothed.current;

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      tmp.copy(start[i]).slerp(ALIGNED, k);
      spin.setFromAxisAngle(axis, t * RINGS[i].speed);
      mesh.quaternion.copy(tmp).multiply(spin);
    });
  });

  return (
    <>
      {RINGS.map((r, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)}>
          <torusGeometry args={[r.radius, r.tube, 16, 220]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.4 - i * 0.3}
            metalness={0.6}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

function Core({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    // Soft pointer parallax.
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.35, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.25, 3, delta);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <MeshDistortMaterial
          color="#1d1812"
          metalness={0.95}
          roughness={0.18}
          distort={0.22}
          speed={1.1}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Inner glow halo */}
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Scene({ align, accent }: { align?: MotionValue<number>; accent: string }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff3df" />
      <pointLight position={[-4, -2, -3]} intensity={6} color={accent} distance={12} />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
        <Core accent={accent} />
        <Rings align={align} accent={accent} />
      </Float>

      <Sparkles count={50} scale={[7, 5, 4]} size={1.6} speed={0.25} opacity={0.5} color={accent} />

      {/* Procedural studio lighting for reflections — no network fetch. */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} position={[0, 4, 2]} scale={[8, 1.5, 1]} color="#fff1d6" />
        <Lightformer intensity={1.2} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color={accent} />
        <Lightformer intensity={0.6} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#8f9bb0" />
      </Environment>
    </>
  );
}

export default function AlignOrb({ align, accent = "#dcc08a", className, onReady, onContextLost }: OrbProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause rendering when off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          requestAnimationFrame(() => onReady?.());
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onContextLost?.();
          });
        }}
        aria-hidden
      >
        <Scene align={align} accent={accent} />
      </Canvas>
    </div>
  );
}
