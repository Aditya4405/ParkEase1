export default function AuthBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#FAFAFA] dark:bg-[#0B1120] transition-colors duration-200">
            {/* Subtle Ambient Gradients (matching landing page aesthetic) */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-100/60 dark:from-indigo-950/30 to-transparent rounded-full blur-3xl opacity-70" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-purple-100/50 dark:from-purple-950/20 to-transparent rounded-full blur-3xl opacity-60" />
            <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-100/40 dark:from-blue-950/20 to-transparent rounded-full blur-3xl opacity-50" />

            {/* Subtle Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
                style={{
                    backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
        </div>
    );
}
