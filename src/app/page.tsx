"use client"

import { useState } from 'react';
import MapComponent from './_components/MapComponent';
import ReportModal from './_components/ReportModal';
import { CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import {useSearchAPI, useCrimeBar, useModalSidebar} from "./_store/store";
import CrimeSidebar from "./_components/CrimeSidebar";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState(null);
  /* const [currentState, setCurrentState] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [searchResult, setSearchResult] = useState(); */
  const{setCurrentSearch}=useSearchAPI()
  const{collapsedBar, setCollapsedBar}=useModalSidebar()
  const{collapsedCrimeBar, setCollapsedCrimeBar}=useCrimeBar()

  const handleSearch = () => {
    console.log("country", country)
    if (!(country as any)?.name) return;
    
    fetch(`https://geocrimes.onrender.com/api/geo/getLocation?country=${country?.name}`)
      .then(response => response.json())
      .then(data => {
        // Manejar los resultados
        console.log("dataSearch", data)
        setCurrentSearch(data)
      })
      .catch(error => {
        console.log('Error:', error)
      });
  };

  return (
    <div>
      <main className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-indigo-300 text-gray-800 p-6 shadow-md border-b border-gray-200">
        <div className="mb-6 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-800">Mapa de Denuncias</h1>
            <p className="text-gray-700">Reporta incidentes en tu comunidad</p>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true)
              setCollapsedBar(!collapsedBar)
            }}
            className="bg-rose-400 hover:bg-rose-500 text-white px-5 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
            /* className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow-md whitespace-nowrap" */
          >
            Agregar Denuncia
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-stretch justify-between border border-gray-200">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative"> {/* Añadido z-50 para el select */}
              <CountrySelect
                containerClassName="form-group"
                inputClassName=" w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                onChange={(_country) => {
                  console.log("_country",_country)
                  setCountry((_country as any))
                }}
                onTextChange={(text) => {
                  console.log("_country text",text)
                  if (text?.target.value === " " || text?.target?.value === "") {
                    setCountry(null)
                    /* setCurrentState(null)
                    setCurrentCity(null) */
                  }
                }}
                placeHolder="Selecciona un País"
              />
            </div>
            
            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={!country}
            >
              Buscar Denuncias
            </button>
          </div>
          
          <button
            onClick={() => {
              console.log("click")
              setCollapsedCrimeBar(!collapsedCrimeBar)
            }}
            className="bg-white hover:bg-gray-100 text-indigo-700 px-6 py-3 rounded-md font-medium transition-colors border border-indigo-300 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            Ver estadísticas
          </button>
        </div>
      </header>

      {/* Tu mapa y otros componentes */}
      {collapsedCrimeBar && (
        <CrimeSidebar/>  
      )}       
      {/* Mapa */}
      <div className="p-4 z-10 relative">
        <MapComponent/>
      </div>

      {/* Modal */}
      {collapsedBar && (
        <ReportModal onClose={() => setIsModalOpen(false)} isModalOpen={isModalOpen} />
      )}
      </main>
    </div>
  );
}
