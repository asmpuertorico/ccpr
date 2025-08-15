import React from "react";

export default function GradientDivider() {
  return (
    <div className="relative w-full">
      <div
        className="animated-gradient-border"
        style={{ backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)" }}
      />
    </div>
  );
}


