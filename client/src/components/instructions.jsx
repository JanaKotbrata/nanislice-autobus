import React, { useEffect, useRef, useState } from "react";

const howToPlaySteps = [
  "Cílem hry, je zbavit se všech karet v autobusu. Hráč, který jako první vyloží všechny karty z autobusu, vyhrává.",
  "1. Každý hráč dostane 5 karet do ruky a 10 karet do autobusu. Ještě má k dispozici 4 místa v zastávce pro odložení karet.",
  "2. Hráči se střídají a na začátku každého kola si hráč lízne kartu, dokud nemá v ruce 5 karet.",
  "3. Do hracího pole se může jako první karta dát Eso nebo Joker (ten může nahradit jakoukoliv kartu). Na tyto karty se pokračuje v pořadí 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K. Když sloupec končí Králem, tak se uzavírá a míchá se zpět do balíčku karet, ze kterého se líže.",
  "4. Pokud má hráč v ruce, v zastávce nebo na vrchu autobusu nějakou kartu, která se hodí na hrací pole, může ji zahrát.",
  "5. Pokud již hráč nemá žádnou kartu, co by mohl zahrát, tak odkládá kartu do zastávky (Do zastávky se mohou odkládat jakékoliv karty kromě Joker a Esa. Pokud již v zastávce není místo, hráč může odložit stejný rank karty, co je v zastávce. Pokud nemá stejný rank, musí kartu odložit dospod autobusu.), pokud mu došly karty v ruce, doplňuje 5 karet do ruky a pokračuje dále.",
  "6. Rady - 1) Když dvakrát klikneš na autobus, tak se podíváš, jaká je tvá poslední karta. 2) Když najedeš na jakýkoliv autobus myší, tak se ti zobrazí počet karet. 3) Když najedeš na jakýkoliv balíček v zastávce, tak se ti zobrazí počet karet.",
];

function Instructions() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(currentSlide);

  useEffect(() => {
    slideRef.current = currentSlide;
  }, [currentSlide]);

  // Automatické slidování
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
        Jak valit hru
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
