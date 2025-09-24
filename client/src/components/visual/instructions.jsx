import { useContext, useEffect, useRef, useState } from "react";
import LanguageContext from "../../context/language.js";

function Instructions() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(currentSlide);
  const i18n = useContext(LanguageContext);
  const howToPlaySteps = [
    i18n.translate("goalOfTheGame"),
    i18n.translate("firstStep"),
    i18n.translate("secondStep"),
    i18n.translate("thirdStep"),
    i18n.translate("fourthStep"),
    i18n.translate("fifthStep"),
    i18n.translate("sixthStep"),
  ];
  useEffect(() => {
    slideRef.current = currentSlide;
  }, [currentSlide]);

  // Automatic sliding
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (slideRef.current + 1) % howToPlaySteps.length;
      setCurrentSlide(nextSlide);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center text-center px-2 sm:px-4">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4">
        {i18n.translate("howToPlay")}
      </h3>
      <div className="bg-blue-950/50 p-4 sm:p-6 rounded-xl w-full h-64 sm:h-140 flex items-center justify-center text-sm sm:text-lg font-medium transition-all duration-300 shadow-lg text-white">
        {howToPlaySteps[currentSlide]}
      </div>
      <div className="flex gap-2 sm:gap-3 mt-6 flex-wrap justify-center">
        {howToPlaySteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-gradient-to-r from-gray-400 to-cyan-400 shadow-md scale-110"
                : "!bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Instructions;
