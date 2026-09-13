import { motion } from "framer-motion";
import { FaCar } from "react-icons/fa";

export default function ParkingGrid({ slots }) {
    return (
        <div className="bg-dark-card/60 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-neon-blue"></span>
                Live Parking Status
            </h3>

            <div className="grid grid-cols-5 gap-4">
                {slots.map((slot) => (
                    <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.05 }}
                        className={`
              relative h-24 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer
              ${slot.occupied
                                ? "bg-neon-red/10 border-neon-red/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                : "bg-neon-green/10 border-neon-green/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                            }
            `}
                    >
                        <span className="absolute top-2 left-2 text-xs font-mono text-gray-400">#{slot.id}</span>

                        {slot.occupied ? (
                            <FaCar className="text-3xl text-neon-red drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        ) : (
                            <div className="text-neon-green font-bold text-sm">OPEN</div>
                        )}

                        <div className={`absolute bottom-0 w-full h-1 ${slot.occupied ? "bg-neon-red" : "bg-neon-green"}`}></div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
