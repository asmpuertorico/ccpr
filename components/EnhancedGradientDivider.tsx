import React from "react";

export default function EnhancedGradientDivider() {
  return (
    <div className="relative w-full py-8">
      <div className="relative mx-auto max-w-7xl">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
            backgroundSize: "400% 100%",
            animation: "gradient-move 8s linear infinite",
            height: "12px",
            top: "-5.5px"
          }}
        />
        <div
          className="absolute inset-0 blur-lg opacity-20"
          style={{ 
            backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
            backgroundSize: "400% 100%",
            animation: "gradient-move 8s linear infinite",
            height: "16px",
            top: "-7.5px"
          }}
        />
      </div>
    </div>
  );
}
