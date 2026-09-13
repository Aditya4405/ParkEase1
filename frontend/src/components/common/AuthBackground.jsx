import { useEffect, useRef } from "react";

export default function AuthBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            t += 0.005;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background gradient
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, "#080810");
            grad.addColorStop(0.5, "#0d0d1a");
            grad.addColorStop(1, "#0a0818");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Animated grid
            ctx.strokeStyle = "rgba(79, 209, 197, 0.04)";
            ctx.lineWidth = 1;
            const spacing = 60;
            for (let x = 0; x < canvas.width; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Pulsing intersection dots
            for (let x = spacing; x < canvas.width; x += spacing) {
                for (let y = spacing; y < canvas.height; y += spacing) {
                    const pulse = (Math.sin(t * 2 + x * 0.01 + y * 0.01) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(79, 209, 197, ${pulse * 0.15})`;
                    ctx.fill();
                }
            }

            // Animated glowing blobs
            const blobs = [
                { bx: 0.15, by: 0.3, r: 280, c: [79, 209, 197], speed: 0.6 },
                { bx: 0.85, by: 0.65, r: 320, c: [139, 92, 246], speed: 0.4 },
                { bx: 0.5, by: 0.9, r: 220, c: [59, 130, 246], speed: 0.8 },
                { bx: 0.7, by: 0.15, r: 180, c: [168, 85, 247], speed: 0.5 },
            ];
            blobs.forEach(({ bx, by, r, c, speed }) => {
                const x = canvas.width * bx + Math.sin(t * speed) * 40;
                const y = canvas.height * by + Math.cos(t * speed * 0.7) * 30;
                const alpha = 0.05 + Math.sin(t * speed + 1) * 0.025;
                const bg = ctx.createRadialGradient(x, y, 0, x, y, r);
                bg.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`);
                bg.addColorStop(1, "transparent");
                ctx.fillStyle = bg;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    // Floating parking icons (SVG paths rendered as HTML elements with CSS animation)
    const floatingIcons = [
        { emoji: "🚗", top: "8%", left: "6%", size: 28, delay: "0s", dur: "6s" },
        { emoji: "🅿️", top: "20%", left: "88%", size: 32, delay: "1.2s", dur: "7s" },
        { emoji: "🔒", top: "72%", left: "7%", size: 22, delay: "0.5s", dur: "5.5s" },
        { emoji: "📍", top: "12%", left: "74%", size: 26, delay: "2s", dur: "8s" },
        { emoji: "🛡️", top: "82%", left: "82%", size: 24, delay: "0.8s", dur: "6.5s" },
        { emoji: "📱", top: "55%", left: "3%", size: 20, delay: "1.5s", dur: "7.5s" },
        { emoji: "🚘", top: "88%", left: "42%", size: 22, delay: "3s", dur: "5s" },
        { emoji: "⚡", top: "38%", left: "92%", size: 26, delay: "2.5s", dur: "9s" },
        { emoji: "🏢", top: "48%", left: "5%", size: 18, delay: "1.8s", dur: "6s" },
        { emoji: "💳", top: "30%", left: "80%", size: 20, delay: "0.3s", dur: "7s" },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* CSS animated floating icons */}
            <style>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.08; }
          50%       { transform: translateY(-20px) rotate(5deg); opacity: 0.18; }
        }
        @keyframes floatSide {
          0%, 100% { transform: translateX(0px) rotate(-3deg); opacity: 0.06; }
          50%       { transform: translateX(12px) rotate(3deg); opacity: 0.16; }
        }
        .float-icon { animation: floatUpDown linear infinite; }
        .float-icon:nth-child(odd) { animation-name: floatSide; }
      `}</style>

            {floatingIcons.map((icon, i) => (
                <div
                    key={i}
                    className="float-icon absolute select-none"
                    style={{
                        top: icon.top,
                        left: icon.left,
                        fontSize: icon.size,
                        animationDelay: icon.delay,
                        animationDuration: icon.dur,
                        filter: "blur(0.3px)",
                    }}
                >
                    {icon.emoji}
                </div>
            ))}
        </div>
    );
}
