import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";

function ModalWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center !bg-gray-700/50 z-40">
      {isMobile ? (
        children
      ) : (
        <Rnd
          default={{
            x: 100,
            y: 100,
            width: "auto",
            height: "auto",
          }}
          bounds="window"
          disableDragging
          enableResizing={false}
          style={{ pointerEvents: "auto" }}
        >
          {children}
        </Rnd>
      )}
    </div>
  );
}

export default ModalWrapper;
