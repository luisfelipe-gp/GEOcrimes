'use client';

import { useState, useEffect } from 'react';
import { CountrySelect, StateSelect, CitySelect   } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
/* import {ToastProvider } from "@heroui/toast";
import {addToast, Alert} from "@heroui/react"; */
import { useModalSidebar } from '../_store/store';
import { useDenunciaData } from '../_store/store';

export default function ReportModal({ onClose }:any) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    sector: '',
    crimeTime: null,
    crimeType: '',
    location: {
      lat:"",
      lng:""
    }
  });
  const [country, setCountry] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    country: false,
    city: false,
    crimeTime: false,
    crimeType: false,
    location: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  // Nuevos estados para manejar las alertas
  const [alert, setAlert] = useState({
    show: false,
    type: '', // 'success' o 'warning'
    title: '',
    message: ''
  });
  // Estado para controlar el modo de selección de ubicación
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [clickListener, setClickListener] = useState(null);
  const{collapsedBar, setCollapsedBar}=useModalSidebar()
  const{ currentDenuncia, setCurrentDenuncia }=useDenunciaData()


  // Validar formulario cada vez que cambien los campos
  useEffect(() => {
    console.log("datos", {country, currentState, currentCity })
    const isValid = (
      country !== null && 
      currentCity !== null && 
      formData.crimeTime !== null &&
      formData.crimeType !== ''
    );
    setIsFormValid(isValid);
    
    // Limpiar errores cuando se completan los campos
    setErrors({
      country: country === null,
      city: currentCity === null,
      crimeTime: false,
      crimeType: formData.crimeType === '',
      location: false,
    });
  }, [country, currentState, currentCity, formData.crimeType, formData.sector]);

    // Ocultar la alerta después de 5 segundos
    useEffect(() => {
      if (alert.show) {
        const timer = setTimeout(() => {
          setAlert(prev => ({ ...prev, show: false }));
        }, 9000);
        return () => clearTimeout(timer);
      }
    }, [alert.show]);


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("entra submit")
    
    // Validación adicional antes de enviar
    if (!isFormValid) {
        /* addToast({
          title: "Campos incompletos",
          description: "Por favor completa todos los campos obligatorios",
          color: "warning",
        }); */
        setErrors({
          country: country === null,
          city: currentCity === null,
          crimeTime: true,
          crimeType: formData.crimeType === '',
          location: true
        });
        return;
      }
  
    setIsSubmitting(true);
    console.log("entra isFormValid", isFormValid)
    try {
      // Enviar denuncia al backend
     /*  const addLocationUrl = 'https://mv960jtm-3000.use2.devtunnels.ms/api/geo/addLocation/';
      const addResponse = await axios.post(addLocationUrl, {
        "country": country?.name,
        "city": currentCity?.name,
        "sector": formData?.sector,
        "crimeType": formData?.crimeType,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Solo si el backend lo permite
        },
      }
    ); */

      /* if (addResponse.status === 200) {
        setAlert({
          show: true,
          type: 'success',
          title: 'Éxito',
          message: 'Denuncia enviada correctamente'
        });
        // Limpiar formulario después de éxito
        setFormData({
          name: '',
          phone: '',
          sector: '',
          crimeType: '',
        });
        onClose();
      } */
        console.log("entra try")
        console.log("entra country?.name", (country as any)?.name)
        console.log("entra currentCity?", (currentCity as any)?.name)
        console.log("entra formData?.sector", formData?.sector)
        console.log("entra formData?.crimeTime", formData?.crimeTime)
        console.log("entra formData?.crimeType", formData?.crimeType)
        console.log("entra currentDenuncia", currentDenuncia)
      const addLocationUrlLocal = 'https://mv960jtm-3000.use2.devtunnels.ms/api/geo/addLocation';
      const addLocationUrl = 'https://geocrimes.onrender.com/api/geo/addLocation';
      const addResponse = await fetch(addLocationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: (country as any)?.name,
          city: (currentCity as any)?.name,
          zone: formData?.sector,
          lat: currentDenuncia?.lat,
          lon: currentDenuncia?.lng,
          crimeTime: formData?.crimeTime,
          typeCrime: formData?.crimeType,
        }),
      });

      if (addResponse.ok) {
        console.log("addResponse.ok", addResponse)
        setAlert({
          show: true,
          type: 'success',
          title: 'Éxito',
          message: 'Denuncia enviada correctamente'
        });
        setFormData({
          name: '',
          phone: '',
          sector: '',
          crimeTime: null,
          crimeType: '',
          location: {
            lat:"",
            lng:""
          }
        });
        setCurrentDenuncia({lat: 0, lng: 0})
        /* onClose(); */
        // Aquí podrías actualizar el mapa (necesitarías pasar una función desde el padre)
      }
    } catch (error) {
        console.log('Error:', error);
        setAlert({
          show: true,
          type: 'warning',
          title: 'Error',
          message: (error as any)?.response?.data?.message || (error as any)?.message || 'Error al enviar la denuncia'
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para formatear la fecha al formato que espera datetime-local (YYYY-MM-DDTHH:MM)
  function formatDateForInput(date: any) {
    if (!date) return "";
    
    const pad = (num:any) => num.toString().padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  




  return (
    
    <div className="fixed top-0 left-0 h-screen w-full max-w-80 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
      {/* <ToastProvider/> */}
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-800">Nueva Denuncia</h2>
          <button 
            onClick={()=>{
              onClose
              setCollapsedBar(!collapsedBar)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className='pt-4'>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País <span className="text-red-500">*</span>
                {errors.country && <span className="ml-2 text-sm text-red-600">Este campo es obligatorio</span>}
              </label>
              <CountrySelect
                containerClassName="w-full form-group"
                inputClassName={`w-full p-3 border rounded-lg ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(c: any) => {
                  setCountry(c);
                  setCurrentState(null);
                  setCurrentCity(null);
                }}
                placeHolder="Selecciona tu país"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado/Departamento <span className="text-red-500">*</span>
              </label>
              <StateSelect
                countryid={(country as any)?.id}
                containerClassName="form-group"
                inputClassName="w-full p-3 border border-gray-300 rounded-lg"
                onChange={(s: any)=>{setCurrentState(s)}}
                placeHolder="Selecciona tu estado"
                disabled={!country}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad <span className="text-red-500">*</span>
                {errors.city && <span className="ml-2 text-sm text-red-600">Este campo es obligatorio</span>}
              </label>
              <CitySelect
                countryid={country?.id}
                stateid={currentState?.id}
                containerClassName="form-group"
                inputClassName={`w-full p-3 border rounded-lg ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(c: any)=>{
                  console.log("c", c)
                  setCurrentCity(c)}}
                placeHolder="Selecciona tu ciudad"
                disabled={!currentState}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector {/* <span className="text-red-500">*</span> */}
              </label>
              <input
                type="text"
                placeholder="Ej: Candelaria, Cumbres de Curumo"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora del incidente <span className="text-red-500">*</span>
                {errors.crimeTime && <span className="ml-2 text-sm text-red-600">Este campo es obligatorio</span>}
              </label>
              <input
                type="datetime-local"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.crimeTime ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.crimeTime ? formatDateForInput(formData.crimeTime) : ""}
                onChange={(e: any) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  console.log("daate",date)
                  setFormData({ ...formData, crimeTime: date as any });
                }}
                required
              />
            </div>

            {/* Nueva sección para ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación del incidente <span className="text-red-500">*</span>
                {errors?.location && <span className="ml-2 text-sm text-red-600">Este campo es obligatorio</span>}
              </label>
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Coloca el cursor sobre el mapa y haz click donde ocurrió el incidente
                </p>
                {currentDenuncia && (
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Latitud</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={typeof currentDenuncia?.lat === 'object'
                            ? String((currentDenuncia as any)?.lat?.value || 0)
                            : String(currentDenuncia?.lat ?? 0)}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Longitud</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={typeof currentDenuncia?.lng === 'object'
                            ? String((currentDenuncia as any)?.lng?.value || 0)
                            : String(currentDenuncia?.lng ?? 0)}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Ubicación seleccionada
                    </div>
                  </div>
                )}
              </div>
            </div>
              {/* Fin seleccion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de crimen <span className="text-red-500">*</span>
                {errors.crimeType && <span className="ml-2 text-sm text-red-600">Este campo es obligatorio</span>}
              </label>
              <select
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.crimeType ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.crimeType}
                onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                required
              >
                <option value="">Selecciona un tipo de crimen</option>
                <option value="robo">Robo con arma de fuego</option>
                <option value="robo">Robo con arma blanca</option>
                <option value="asalto">Asalto</option>
                <option value="robo_de_auto">Robo de vehículo</option>
                <option value="violacion">Violacion</option>
                <option value="abuso">Abuso fisico, verbal, psicologico</option>
              </select>
            </div>
            {/* Mostrar alertas */}
            {alert.show && (
              <div>
                {alert.type === 'success' ? (
                  <div className="mb-4 rounded-md border-l-4 border-l-green-500">
                  <div className="p-4 bg-green-50 border-green-500 text-green-700">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{alert.title}</p>
                        <p className="mt-1 text-sm">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-md border-l-4 border-l-amber-500">
                    <div className="p-4 bg-yellow-50 border-yellow-500 text-yellow-700">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{alert.title}</p>
                          <p className="mt-1 text-sm">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={()=>{
                  onClose
                  setCollapsedBar(!collapsedBar)
                }}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 text-white rounded-lg transition-colors ${
                  isFormValid 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-indigo-400 cursor-not-allowed'
                }`}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Denuncia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}