import React, { useState } from 'react';
import { FaMapMarkerAlt, FaExclamationTriangle, FaCity, FaTimes } from 'react-icons/fa';
import { useSearchAPI, useCrimeBar} from "../_store/store";

const CrimeSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('cities');
  /* const{collapsedBar, setCollapsedBar}=useModalSidebar() */
  const{currentDataCountry}=useSearchAPI()
  const{collapsedCrimeBar, setCollapsedCrimeBar}=useCrimeBar()
  console.log("currentDataCountry",currentDataCountry)

  
  // Si no hay datos o el país es null, no renderizar nada
  if (!currentDataCountry) {
    return (
        <>
        <div className="fixed top-0 left-0 w-96 h-full bg-blue-50 shadow-xl z-50 flex flex-col justify-center items-center text-center px-4">
        <p className="text-blue-700 text-lg font-semibold">
            🔍 Busca por país o haz clic en alguno de los países del mapa para ver sus estadísticas.
        </p>
        </div>
        <div className="fixed top-0 left-0 w-96 h-full bg-white shadow-xl z-50 flex flex-col justify-center items-center text-center px-4">
            <p className="text-gray-700 text-lg font-medium">
            Busca por país o haz clic en alguno de los países del mapa para ver sus estadísticas.
            </p>
         </div>
        </>
    );
  }
  
   /*  if(currentDataCountry?.country?.cities.length > 0){
        // Calcular estadísticas
        const citiesWithStats = currentDataCountry?.country?.cities?.map((city:any) => {
        const totalCrimes = city.zones.reduce((sum:any, zone:any) => sum + zone.locations.length, 0);
        const sortedZones = [...city.zones].sort((a, b) => b.locations.length - a.locations.length);

        return {
            ...city,
            totalCrimes,
            sortedZones
        };
        }).sort((a, b) => b.totalCrimes - a.totalCrimes);
    }
 */
    // Calcular estadísticas (maneja tanto el caso con datos como sin datos)
const citiesWithStats = (currentDataCountry as any).country?.cities?.length > 0 
? (currentDataCountry as any).country?.cities.map((city: any) => {
    const totalCrimes = city.zones.reduce((sum: any, zone: any) => sum + zone.locations.length, 0);
    const sortedZones = [...city.zones].sort((a, b) => b.locations.length - a.locations.length);
    
    return {
      ...city,
      totalCrimes,
      sortedZones
    };
  }).sort((a: any, b: any) => b.totalCrimes - a.totalCrimes)
: []; // Array vacío si no hay ciudades

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setCollapsedCrimeBar(!collapsedCrimeBar);
  };


  return (
    <div className="fixed top-0 left-0 w-96 h-full bg-white shadow-xl z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="flex items-center text-lg font-semibold text-gray-800">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          {(currentDataCountry as any)?.country?.country}
        </h3>
        <button 
          onClick={()=>{
            setCollapsedCrimeBar(!collapsedCrimeBar);
            setCollapsed(!collapsed)}}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'cities' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('cities')}
        >
          Ciudades
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'cities' ? (
          <CityList cities={citiesWithStats} />
        ) : (
          <CrimeStats cities={citiesWithStats} />
        )}
      </div>
    </div>
  );
};

const CityList = ({ cities }: any) => {
  if (cities?.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No hay denuncias registradas en este país
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cities?.map((city: any) => (
        <div key={city.id} className="border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="flex items-center font-medium text-gray-800">
              <FaCity className="mr-2 text-blue-500" />
              {city.city.split(',')[0]}
            </h4>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {city.totalCrimes} denuncias
            </span>
          </div>
          
          <div className="space-y-3 ml-4">
            {city.sortedZones.map((zone: any) => (
              <div key={zone.id} className="border-l-2 border-gray-200 pl-3">
                <div className="flex justify-between items-center mb-1">
                  <h5 className="text-sm font-medium text-gray-700">
                    {zone.zone.split(',')[0]}
                  </h5>
                  <span className="bg-red-400 text-white text-xs px-2 py-0.5 rounded-full">
                    {zone.locations.length} denuncias
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {groupCrimesByType(zone.locations).map((crimeType, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      <FaExclamationTriangle className="mr-1 text-yellow-500" />
                      {crimeType?.type} ({(crimeType as any).count})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const CrimeStats = ({ cities }:any) => {
  const totalCrimes = cities.reduce((sum: any, city: any) => sum + city.totalCrimes, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Resumen de Denuncias</h4>
        <p className="text-gray-700">
          Total denuncias en el país: <span className="font-bold">{totalCrimes}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Ciudades con más denuncias</h5>
        <div className="space-y-3">
          {cities.slice(0, 5).map((city: any) => (
            <div key={city?.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {city?.city.split(',')[0]}
                </span>
                <span className="text-gray-600">
                  {city?.totalCrimes} ({Math.round((city?.totalCrimes / totalCrimes) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(city?.totalCrimes / totalCrimes) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {cities.length > 0 && (
        <div className="space-y-4">
          <h5 className="font-medium text-gray-800">
            Zonas más peligrosas en {cities[0]?.city?.split(',')[0]}
          </h5>
          <div className="space-y-3">
            {cities[0]?.sortedZones?.slice(0, 3).map((zone:any) => (
              <div key={zone.id} className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                <div className="font-medium text-gray-800 text-sm">
                  {zone?.zone?.split(',')[0]}
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-red-600 font-medium">
                    {zone?.locations?.length} denuncias
                  </span>
                  <span className="text-gray-600 truncate max-w-xs">
                    {groupCrimesByType(zone?.locations)
                      .map(crime => crime?.type)
                      .join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para agrupar crímenes por tipo
const groupCrimesByType = (locations:any) => {
  const crimeMap = {};
  
  locations.forEach((location:any) => {
    if (!(crimeMap as any)[location?.typeCrime]) {
      (crimeMap as any)[location?.typeCrime] = 0;
    }
    (crimeMap as any)[location?.typeCrime]++;
  });
  
  return Object.entries(crimeMap).map(([type, count]) => ({
    type,
    count
  })).sort((a:any, b:any) => b.count - a.count);
};

export default CrimeSidebar;