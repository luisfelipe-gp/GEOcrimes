'use client';

import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { pointerMove } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { testReports } from './data';
import {useSearchAPI} from "../_store/store";
import { useModalSidebar } from '../_store/store';
import { getCenter } from 'ol/extent';
import { toLonLat } from 'ol/proj';
import { useDenunciaData } from '../_store/store';
import {fromExtent} from 'ol/geom/Polygon.js';
import { Circle as CircleStyle } from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint'
import { useCrimeBar } from '../_store/store';

export default function MapComponent() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const paisesLayerRef = useRef(null);
  /* const reportLayerRef = useRef(null); */
  const reportLayerNewPinsRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const{currentSearch, setCurrentDataCountry}=useSearchAPI()
  const{collapsedBar}=useModalSidebar()
  const{ setCurrentDenuncia }=useDenunciaData()
  const{ collapsedCrimeBar, setCollapsedCrimeBar}=useCrimeBar()

  //Convertir lat/lng a EPSG:3857
  const features = testReports.map((denuncia) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([denuncia?.lon, denuncia?.lat])),
      name: denuncia.title
    });

    feature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      })
    );

    return feature;
  });

  /* ZOOM */

  const getTargetZoomStrategy = (currentZoom: any, locationType: any) => {
    const zoomLevels = {
      country: 5,
      state: 8,
      city: 12
    };
  
    const targetZoom = (zoomLevels as any)[locationType];
  
    // Caso 1: Estamos en una ciudad (zoom alto) y vamos a país/estado (zoom bajo)
    if (currentZoom >= zoomLevels.city && targetZoom < zoomLevels.city) {
      return {
        steps: [
          { zoom: zoomLevels.state, center: null }, // Paso 1: Alejar a nivel estado
          { zoom: targetZoom, center: true }        // Paso 2: Mover y ajustar zoom final
        ]
      };
    }
    // Caso 2: De ciudad a ciudad (zoom alto a zoom alto)
    else if (currentZoom >= zoomLevels.city && targetZoom >= zoomLevels.city) {
      return {
        steps: [
          { zoom: zoomLevels.state, center: null }, // Paso 1: Alejar a nivel estado
          { zoom: targetZoom, center: true }        // Paso 2: Mover y acercar
        ]
      };
    }
    // Caso 3: De país/estado a ciudad (zoom bajo a zoom alto)
    else if (currentZoom < zoomLevels.city && targetZoom >= zoomLevels.city) {
      return {
        steps: [
          { zoom: targetZoom, center: true } // Movimiento directo + zoom in
        ]
      };
    }
    // Caso 4: De país a país o estado a estado (zoom similar)
    else {
      return {
        steps: [
          { zoom: targetZoom, center: true } // Movimiento directo sin cambio de zoom
        ]
      };
    }
  };

  const flyToLocation = (coordinates: any, locationType: any, time: any, done: any) => {
    if (!mapInstanceRef.current) return;
  
    const view = (mapInstanceRef as any).current.getView();
    const currentZoom = view.getZoom();
    const location = fromLonLat(coordinates);
    const strategy = getTargetZoomStrategy(currentZoom, locationType);
    const duration = time;
  
    let completedSteps = 0;
    const totalSteps = strategy.steps.length;
  
    const executeStep = (index: any) => {
      if (index >= totalSteps) {
        done && done(true);
        return;
      }
  
      const step = strategy.steps[index];
      const animationOptions = {
        zoom: step.zoom,
        duration: duration / totalSteps,
      };
  
      if (step.center) {
        (animationOptions as any).center = location; // Mover solo si `center: true`
      }
  
      view.animate(animationOptions, () => {
        completedSteps++;
        executeStep(index + 1);
      });
    };
  
    executeStep(0); // Iniciar animación
  };


  // Función para procesar las zonas y convertirlas en features de OpenLayers
  const processZonesToFeatures = (cities: any[]) => {
    const features: Feature[] = [];
    
    cities.forEach(city => {
      if (city.zones && city.zones.length > 0) {
        city.zones.forEach((zone: any) => {
          // Feature para el punto
          if (zone.gis?.type === "Point" && zone.gis.coordinates) {
            const pointFeature = new Feature({
              geometry: new Point(fromLonLat(zone.gis.coordinates)),
              type: 'zone',
              name: zone.zone,
              data: zone
            });
            features.push(pointFeature);
          }
          
          // Feature para el polígono (bounding box)
          if (zone.boundingbox && zone.boundingbox.length === 4) {
            const [minLat, maxLat, minLon, maxLon] = zone.boundingbox;
            
            // Convertir a EPSG:3857
            const minCoord = fromLonLat([parseFloat(minLon), parseFloat(minLat)]);
            const maxCoord = fromLonLat([parseFloat(maxLon), parseFloat(maxLat)]);
            
            // Crear polígono desde extent
            const polygon = fromExtent([
              Math.min(minCoord[0], maxCoord[0]),
              Math.min(minCoord[1], maxCoord[1]),
              Math.max(minCoord[0], maxCoord[0]),
              Math.max(minCoord[1], maxCoord[1])
            ]);
            
            const polygonFeature = new Feature({
              geometry: polygon,
              type: 'zone_area',
              name: zone.zone,
              data: zone
            });
            
            features.push(polygonFeature);
          }
        });
      }
    });
    
    return features;
  };

  // Añadir features al mapa
  const addFeaturesToMap = (features: Feature[]) => {
    if (!reportLayerNewPinsRef.current) return;
    
    const source = (reportLayerNewPinsRef as any).current.getSource();
    source?.clear();
    source?.addFeatures(features);
  };

  /* Handle getLocation */
  const handleSearch = (countryName: any) => {
    
    if (!countryName) return;
    /* fetch(`https://mv960jtm-3000.use2.devtunnels.ms/api/geo/getLocation?country=${countryName}`) */
    fetch(`https://geocrimes.onrender.com/api/geo/getLocation?country=${countryName}`)
      .then(response => response.json())
      .then(data => {
        // Manejar los resultados
        console.log("dataSearch", data)
        setCurrentDataCountry(data)
        setCollapsedCrimeBar(!collapsedCrimeBar)
        // Procesar las zonas para mostrar en el mapa
        if (data.country?.cities) {
          const features = processZonesToFeatures(data.country.cities);
          console.log("features", features)
          addFeaturesToMap(features);
        }
      })
      .catch(error => {
        console.log('Error:', error)
      });
  };

  // Estilo base para capas vectoriales (áreas)
  const defaultAreaStyle = new Style({
    stroke: new Stroke({
      color: '#94a3b8', // Tailwind slate-400 (gris azulado neutro)
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(241, 245, 249, 0.4)', // Tailwind slate-50 con transparencia
    }),
  });

  const highlightStyle = new Style({
    stroke: new Stroke({
      color: '#3b82f6', // Tailwind blue-500 (azul vibrante pero profesional)
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(59, 130, 246, 0.2)', // Mismo azul con baja opacidad
    }),
  });


  // Estilo para los pines de denuncia
  const reportPinStyle = new Style({
    image: new Icon({
      src: 'https://cdn.mapmarker.io/api/v1/pin?text=P&size=50&hoffset=1',
      scale: 0.5,
      anchor: [0.5, 1],
    }),
  });

  const zonePinStyle = new Style({
    image: new Icon({
      src: 'https://cdn.mapmarker.io/api/v1/pin?text=Z&size=50&hoffset=1',
      scale: 0.5,
      anchor: [0.5, 1],
    }),
  });

  // Estilo para el pin temporal al seleccionar ubicación
  const tempPinStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.05,
    }),
  });


  const zoneAreaStyles = [
    new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',
      }),
    }),
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: 'orange',
        }),
      }),
      geometry: function (feature) {
        const coordinates = (feature as any).getGeometry().getCoordinates()[0];
        return new MultiPoint(coordinates);
      },
    })
  ];



  /* useEffect(() => {
    // Despierta el servidor de Render
    fetch('https://geocrimes.onrender.com/api/geo/awake')
      .then(() => console.log('Servidor Render activado'))
      .catch((err) => console.log('Error al activar servidor:', err));
  }, []); */

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pingServer = async () => {
      try {
        const res = await fetch('https://geocrimes.onrender.com/api/geo/awake');
        if (res.status === 200) {
          console.log('Servidor despertado correctamente');

          // Luego despiértalo cada 5 minutos (300000 ms)
          intervalId = setInterval(() => {
            fetch('https://geocrimes.onrender.com/api/geo/awake');
          }, 300000); // 5 minutos
        } else {
          console.log('Servidor respondió, pero no con 200');
        }
      } catch (err) {
        console.log('Error al despertar el servidor:', err);
      }
    };

    pingServer();

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    if (!mapRef.current) return;

    // Capa base
    const baseLayer = new TileLayer({ source: new OSM() });

    // Capa de pines y polígonos
    const reportLayerNewPins = new VectorLayer({
      source: new VectorSource(),
      style: function(feature) {
        const type = feature.get('type');
        if (type === 'temporary') return tempPinStyle;
        if (type === 'zone') return zonePinStyle;
        if (type === 'zone_area') return zoneAreaStyles;
        return reportPinStyle;
      }
    });

    // Capa de pines
    const reportLayer = new VectorLayer({
      source: new VectorSource({ features }),
    });
    
    // Capa de países

    const paisesLayer = new VectorLayer({
      source: new VectorSource({
        url: 'https://openlayersbook.github.io/openlayers_book_samples/assets/data/countries.geojson',
        format: new GeoJSON(),
      }),
      visible: true,
      style: defaultAreaStyle,
    });


    // Guardar referencias para controlar visibilidad más tarde
    (paisesLayerRef as any).current = paisesLayer;
    (reportLayerNewPinsRef as any).current = reportLayerNewPins;
    /* reportLayerRef.current = reportLayerSecond; */


    // Configurar control de posición del mouse
    /* const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(6),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position-container'),
    }); */

    // Inicializar mapa
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, paisesLayer, reportLayerNewPins],
      view: new View({
        center: fromLonLat([-74.08175, 4.60971]), // Bogotá
        zoom: 6,
      }),
      /* controls: defaultControls().extend([mousePositionControl]), */
    });
    
    // Interacción dinámica: resaltar con cursor
    const selectInteraction = new Select({
      condition: pointerMove,
      layers: [paisesLayer],
      style: highlightStyle,
    });

    map.addInteraction(selectInteraction);
    

    // Configurar el evento de clic
    map.on('click', function(evt) {
      console.log(" click")
      const zoom = map.getView().getZoom();
      console.log(" zoom", zoom)
      // Si estamos en modo selección de ubicación y el zoom es suficiente
      console.log(" collapsedBar", collapsedBar)
      if (collapsedBar || (zoom as any) >= 10) {
        console.log("isModalOpen zoom2", {collapsedBar,zoom})
        const coordinates = evt.coordinate;
        const lonLat = toLonLat(coordinates);
        console.log("lonLat", lonLat)
        
        // Actualizar el estado con la ubicación seleccionada
        setCurrentDenuncia({ lat: lonLat[0], lng: lonLat[1] });
        
        // Agregar marcador temporal
        /* addTempMarker(coordinates); */
        
        
        return
      }

      if((zoom as any) < 6){
        console.log("entre zoom <6")
        // Buscar el país en el que se hizo clic
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
          return feature;
        });
        console.log("click feature", feature)

        if (feature && (paisesLayer as any)?.getSource().getFeatures().includes(feature)) {
          // Obtener el polígono del país
          const geometry = feature?.getGeometry();
          // Calcular el centroide del polígono
          const extent = geometry?.getExtent();
          const center = getCenter((extent as any));
          // Convertir a coordenadas lon/lat (EPSG:4326)
          const lonLat = toLonLat(center);
          // Ejecutar la animación hacia el país
          flyToLocation(lonLat, 'country', 2000, () => {
            console.log('Animación completada hacia el país');
          });
          // Opcional: mostrar información del país
          console.log('País seleccionado:', feature.get('name'));
          handleSearch(feature.get('name'))
        }
      }
    });


    // Guardar mapa
    (mapInstanceRef as any).current = map;

    // Manejar visibilidad según zoom
    const handleZoomChange = () => {
      const zoom = map.getView().getZoom();
      // Ajustar visibilidad según zoom
      if ((zoom as any) < 6) {
        paisesLayer.setVisible(true);
      } else if ((zoom as any) >= 6 && (zoom as any) < 10) {
        paisesLayer.setVisible(false); 
      } else if ((zoom as any) >= 10) {
        paisesLayer.setVisible(false);
      }
    };

    // Suscribirse al cambio de zoom
    map.getView().on('change:resolution', handleZoomChange);

    // Cleanup
    return () => map.setTarget(undefined);
  }, []);


  
  // Uso en tu componente
  useEffect(() => {
    if (!currentSearch) return;
    console.log("currentSearch",currentSearch)

    flyToLocation([(currentSearch as any)[0]?.lon, (currentSearch as any)[0]?.lat], "country",3000, () => {
      console.log('Animación completada');
    });

    /* const { country, state, city, lon, lat } = currentSearch;
    
    if (lon && lat) {
      const locationType = determineLocationType(country?.name, state?.name, city?.name);
      flyToLocation([lon, lat], locationType, () => {
        console.log('Animación completada');
      });
    } */
  }, [currentSearch]);
  


  // Añadir un punto al mapa (se llamará desde el modal)
  const addPointToMap = (lon: any, lat: any) => {
    if (!vectorLayerRef.current) return;
    const point = new Point(fromLonLat([lon, lat]));
    const feature = new Feature({ geometry: point });
    (vectorLayerRef as any).current.getSource().addFeature(feature);
  };


  

  return (
    <>
      <div 
        ref={mapRef}
        className="w-full h-[500px] rounded-lg shadow-md -z-10"
      />
      {/* Agrega esto en tu componente principal, fuera de la sidebar */}
      <div id="mouse-position-container" className="fixed bottom-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded text-sm shadow z-40"></div>
    </>
  );
}