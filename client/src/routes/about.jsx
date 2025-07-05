import React from "react";
import BusPattern from "../components/bus-pattern.jsx";
import { FaLinkedin } from "react-icons/fa";

function About() {
  return (
    <section className="bg-gray-900 text-white min-h-screen flex items-center justify-center overflow-hidden">
      <BusPattern />
      <div className="mx-auto max-w-3xl relative z-10">
        <div className="relative w-full p-6 sm:p-8 md:p-10 rounded-2xl bg-gray-950/90 backdrop-blur-md shadow-[0_0_40px_rgba(3,7,18,0.9)] hover:shadow-[0_0_50px_rgba(31,41,55,0.5)] transition-all duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            O projektu
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-4">
            Tento sebevzdělávací projekt vznikl jako cvičení programování,
            inspirovaný láskou ke karetním hrám a vzpomínkami na babičku. Cílem
            bylo nahlédnout mimo svět korporátních technologií – prostě zjistit,
            jak se věci dají dělat jinak – a vytvořit interaktivní aplikaci,
            která propojuje moderní technologie se zábavou. A hlavně: hodí se
            skvěle na večerní session na Discordu, kdy se nemůžeme dohodnout, co
            si zahrát, a chceme si jen v klidu odpočinout u sklenky něčeho
            dobrého.
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-4">
            Nejsem frontend specialista, proto prosím omluvte případné vizuální
            nedokonalosti. Děkuji za pochopení.
          </p>
          <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Použité technologie
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>React (včetně knihoven jako React Router a React DnD)</li>
            <li>TailwindCSS pro stylování</li>
            <li>Socket.IO pro real-time komunikaci</li>
            <li>Express.js pro backend</li>
            <li>MongoDB pro databázi</li>
            <li>Passport.js pro autentizaci</li>
            <li>Axios pro HTTP požadavky</li>
            <li>Jest pro testování backendu</li>
          </ul>
          <hr className="h-px my-6 bg-cyan-400/50 border-cyan-400/50" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-center text-gray-400 text-sm">
            <p>Poprvé spatřilo světlo světa: 3. července 2025</p>
            <a
              href="https://www.linkedin.com/in/jana-kotrbat%C3%A1-b51329141/"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-blue-500 hover:!text-cyan-400"
            >
              <FaLinkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
