import { useState, useRef, useEffect, Suspense, Component } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows, OrbitControls } from "@react-three/drei";
import { store } from "../../store.config.js";
// Factory always writes the niche model to this exact path:
import heroModel from "../../assets/hero-model.glb";

useGLTF.preload(heroModel);

/* ── read brand colors from CSS vars so 3D lighting matches the theme ── */
function useThemeColors() {
  const [c, setC] = useState({ primary: "#8B5CF6", secondary: "#8B5CF6", accent: "#22D3EE" });
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const trip = (n) => { const v = root.getPropertyValue(n).trim(); return v ? `rgb(${v})` : null; };
    const solid = (n) => { const v = root.getPropertyValue(n).trim(); return v || null; };
    setC({
      primary:   trip("--primary-rgb")   || solid("--primary")   || "#8B5CF6",
      secondary: trip("--secondary-rgb") || solid("--secondary") || "#8B5CF6",
      accent:    solid("--accent")       || trip("--accent-rgb") || "#22D3EE",
    });
  }, []);
  return c;
}

/* ── error boundary + fallback (unchanged behavior) ── */
class ModelErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("3D hero model failed to load:", error, info);
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function ModelFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 text-slate-400 font-['JetBrains_Mono'] text-xs text-center p-5">
      <div className="w-16 h-16 rounded-[14px] border border-white/[0.12] bg-white/[0.04]" />
      <span>3D preview unavailable</span>
    </div>
  );
}

/* ── the model: niche-agnostic, transform comes from store.config ── */
function HeroModel({ isInteracting }) {
  const { scene } = useGLTF(heroModel);
  const ref = useRef();

  const scale    = store.hero?.modelScale    ?? 2.4;
  const position = store.hero?.modelPosition  ?? [0, 0, 0];
  const rotation = store.hero?.modelRotation  ?? [-0.08, 0, 0];
  const spin     = store.hero?.autoRotate     ?? 0.35; // set 0 to disable idle spin

  useFrame((state) => {
    if (!ref.current || isInteracting.current) return;
    const t = state.clock.getElapsedTime();
    if (spin) ref.current.rotation.y = rotation[1] + t * spin;
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.08;
  });

  return <primitive ref={ref} object={scene} scale={scale} position={position} rotation={rotation} />;
}

function HeroCanvas() {
  const isInteracting = useRef(false);
  const { primary, secondary, accent } = useThemeColors();

  return (
    <ModelErrorBoundary fallback={<ModelFallback />}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        className="w-full h-full touch-none"
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            // eslint-disable-next-line no-console
            console.error("WebGL context lost for hero canvas");
          }, false);
        }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={0.8} color={secondary} />
        <directionalLight position={[0, -3, 3]} intensity={0.5} color="#ffffff" />
        <pointLight position={[0, -2, 2]} intensity={0.6} color={accent} />
        <Suspense fallback={null}>
          <HeroModel isInteracting={isInteracting} />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.45} scale={4} blur={2.5} color={primary} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2}
          maxDistance={7}
          onStart={() => { isInteracting.current = true; }}
          onEnd={() => { isInteracting.current = false; }}
        />
      </Canvas>
    </ModelErrorBoundary>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative max-w-[1280px] mx-auto px-5 sm:px-[26px]">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10 min-h-[88vh] pt-16 pb-12 md:pt-[90px] md:pb-[60px] [animation:fadeIn_.5s]">

        {/* Left – text */}
        <div className="flex-[1.05] flex flex-col items-center text-center md:items-start md:text-left [animation:fadeUp_.8s_both]">
          <div className="inline-flex items-center gap-[9px] px-[15px] py-[7px] rounded-full bg-[rgb(var(--secondary-rgb)_/_.12)] border border-[rgb(var(--secondary-rgb)_/_.35)] mb-6">
            <span className="w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--accent)] [animation:glowPulse_2s_infinite] block shrink-0" />
            <span className="font-['JetBrains_Mono'] text-[11px] sm:text-xs tracking-[.06em] text-[#d7c9ff]">{store.brand.name}</span>
          </div>

          <h1 className="font-['Space_Grotesk'] font-bold text-[clamp(34px,7vw,76px)] leading-[1.02] tracking-[-0.03em] m-0 mb-5">
            {store.brand.name}
            <span className="text-accent">.</span>
          </h1>

          <p className="max-w-[480px] text-base sm:text-[18.5px] leading-[1.6] text-slate-400 mt-0 mb-7">
            {store.brand.tagline}
          </p>

          <div className="flex gap-3 flex-wrap justify-center md:justify-start w-full">
            <button
              onClick={() => navigate("/products")}
              className="nv-mag-btn inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 border-none rounded-[15px] bg-gradient-to-br from-secondary to-primary text-white font-['Space_Grotesk'] font-bold text-base sm:text-[16.5px] cursor-pointer shadow-[0_20px_46px_-14px_rgb(var(--primary-rgb)_/_.95)]"
            >
              Shop {store.niche.productNounPlural} <span className="text-lg">→</span>
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 sm:px-7 py-3.5 sm:py-4 border border-white/[0.16] rounded-[15px] bg-white/[0.04] text-white font-['Space_Grotesk'] font-bold text-base sm:text-[16.5px] cursor-pointer backdrop-blur-sm transition-all duration-[250ms] hover:bg-white/[0.1] hover:border-white/[0.3]"
            >
              Contact us
            </button>
          </div>
        </div>

        {/* Right – 3D model */}
        <div className="flex-1 relative flex justify-center items-center [animation:scaleIn_.9s_both]">
          {/* glow + orbit rings */}
          <div className="absolute w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] rounded-full bg-[radial-gradient(circle,rgb(var(--primary-rgb)_/_.55),transparent_65%)] blur-[22px] [animation:glowPulse_5s_infinite] pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] md:w-[560px] md:h-[560px] border border-[rgb(var(--secondary-rgb)_/_.22)] rounded-full [animation:spinSlow_40s_linear_infinite] pointer-events-none" />
          <div className="absolute w-[220px] h-[220px] sm:w-[340px] sm:h-[340px] md:w-[440px] md:h-[440px] border border-[color-mix(in_srgb,var(--accent)_16%,transparent)] rounded-full [animation:spinSlow_28s_linear_infinite_reverse] pointer-events-none" />

          {/* 3D canvas */}
          <div className="relative z-[3] w-[280px] h-[420px] sm:w-[380px] sm:h-[560px] md:w-[500px] md:h-[780px] max-w-[90vw]">
            <HeroCanvas />
          </div>

          {/* floating badges */}
          <div className="hidden sm:block absolute top-[8%] left-[2%] z-[4] [animation:floatySlow_5s_ease-in-out_infinite] bg-[rgba(15,23,42,.7)] backdrop-blur-[14px] border border-white/[0.08] rounded-2xl px-4 py-[13px] shadow-[0_20px_40px_-16px_rgba(0,0,0,.6)]">
            <p className="font-['JetBrains_Mono'] text-[11px] text-accent m-0">★ 4.9 RATING</p>
            <p className="text-[13px] mt-1 mb-0 text-white font-semibold">Loved by customers</p>
          </div>
          <div className="hidden sm:block absolute bottom-[10%] right-0 z-[4] [animation:floatySlow_6s_ease-in-out_infinite_.6s] bg-[rgba(15,23,42,.7)] backdrop-blur-[14px] border border-white/[0.08] rounded-2xl px-4 py-[13px] shadow-[0_20px_40px_-16px_rgba(0,0,0,.6)]">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#86efac] m-0">✓ IN STOCK</p>
            <p className="text-[13px] mt-1 mb-0 text-white font-semibold">Fast delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}