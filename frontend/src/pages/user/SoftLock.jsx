import { useEffect, useState } from "react";

function SoftLock({ slot, onCancel }) {
  const [time, setTime] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (time <= 0) onCancel();
  }, [time, onCancel]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Slot {slot} Locked</h2>

      <h3>
        Time Remaining: {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
      </h3>

      <button onClick={onCancel} style={{ marginRight: "10px" }}>
        Cancel
      </button>

      <button onClick={() => alert("Arrival Confirmed!")}>
        Confirm Arrival
      </button>
    </div>
  );
}

export default SoftLock;
