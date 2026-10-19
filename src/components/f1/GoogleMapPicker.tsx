import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RotateCcw, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

interface GoogleMapPickerProps {
  onPinSelect: (lat: number, lng: number) => void;
  selectedPin: { lat: number; lng: number } | null;
  actualLocation: { lat: number; lng: number; name: string } | null;
  isRevealed: boolean;
  disabled?: boolean;
  className?: string;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onPinSelect,
  selectedPin,
  actualLocation,
  isRevealed,
  disabled = false,
  className,
  onToggleExpand,
  isExpanded: externalExpanded,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const actualMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Clean Google Streets / Roadmap tile configuration
  const getLayerConfig = () => {
    return {
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
        maxZoom: 20,
      },
    };
  };

  // Pixel-perfect Pin Icon: (16, 46) is exactly at the needle tip without internal translation offsets
  const createPinIcon = (color: string, label: string, isActual = false) => {
    const pulseStyle = !isActual ? 'filter: drop-shadow(0 0 8px rgba(254, 209, 0, 0.7));' : 'filter: drop-shadow(0 0 10px rgba(225, 6, 0, 0.8));';
    const flagSvg = isActual ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M4 2v20h2V2H4z"/><path d="M6 3h3.5v3.5H6z"/><path d="M13 3h3.5v3.5H13z"/><path d="M9.5 6.5H13V10H9.5z"/><path d="M16.5 6.5H20V10h-3.5z"/><path d="M6 10h3.5v3.5H6z"/><path d="M13 10h3.5v3.5H13z"/></svg>' : '';

    return L.divIcon({
      className: 'f1-map-pin',
      iconSize: [32, 46],
      iconAnchor: [16, 46],
      popupAnchor: [0, -46],
      html: `
        <div style="width: 32px; height: 46px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; user-select: none; pointer-events: auto;">
          <div style="background-color: ${color}; color: #000; font-family: monospace; font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 2px; box-shadow: 0 4px 14px rgba(0,0,0,0.9); border: 1px solid #ffffff; white-space: nowrap; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center;">
            ${flagSvg}${label}
          </div>
          <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style="${pulseStyle}">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 19.5 10.5 27.2 11.2 27.7C11.45 27.9 11.72 28 12 28C12.28 28 12.55 27.9 12.8 27.7C13.5 27.2 24 19.5 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="12" cy="11" r="4.5" fill="#000000" />
            <circle cx="12" cy="11" r="2.5" fill="${color}" />
          </svg>
        </div>
      `,
    });
  };

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25, 10], // Central world coordinates
        zoom: 2,
        minZoom: 1,
        maxZoom: 19,
        worldCopyJump: true,
        zoomControl: false,
      });

      // Initial Layer: Google Streets / Roadmap
      const cfg = getLayerConfig();
      const tileLayer = L.tileLayer(cfg.url, cfg.options).addTo(map);
      tileLayerRef.current = tileLayer;

      // Handle map clicks with exact lat/lng
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (disabled || isRevealed) return;
        const { lat, lng } = e.latlng;
        onPinSelect(lat, lng);
      });

      mapInstanceRef.current = map;

      // Invalidate size once DOM has fully settled to prevent gray tile glitches
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }

    // ResizeObserver to automatically resize map whenever parent layout shifts
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. User Guess Marker (Click & Drag support)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedPin) {
      if (!guessMarkerRef.current) {
        const marker = L.marker([selectedPin.lat, selectedPin.lng], {
          icon: createPinIcon('#fed100', 'TU PREDICCIÓN'),
          draggable: !disabled && !isRevealed,
        }).addTo(map);

        // Allow dragging the pin to adjust position
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onPinSelect(pos.lat, pos.lng);
        });

        guessMarkerRef.current = marker;
      } else {
        guessMarkerRef.current.setLatLng([selectedPin.lat, selectedPin.lng]);
        guessMarkerRef.current.dragging?.enable();
      }
    } else {
      if (guessMarkerRef.current) {
        guessMarkerRef.current.remove();
        guessMarkerRef.current = null;
      }
    }
  }, [selectedPin, disabled, isRevealed]);

  // 4. Result Revelation Animation & Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isRevealed && actualLocation && selectedPin) {
      // Disable dragging on guess marker
      guessMarkerRef.current?.dragging?.disable();

      // Actual Circuit Location Marker
      if (!actualMarkerRef.current) {
        const marker = L.marker([actualLocation.lat, actualLocation.lng], {
          icon: createPinIcon('#e10600', actualLocation.name, true),
        }).addTo(map);

        actualMarkerRef.current = marker;
      } else {
        actualMarkerRef.current.setLatLng([actualLocation.lat, actualLocation.lng]);
      }

      // Geodesic dashed line connecting prediction to reality
      if (!lineRef.current) {
        lineRef.current = L.polyline(
          [
            [selectedPin.lat, selectedPin.lng],
            [actualLocation.lat, actualLocation.lng],
          ],
          {
            color: '#fed100',
            weight: 3.5,
            dashArray: '8, 8',
            opacity: 0.95,
          }
        ).addTo(map);
      } else {
        lineRef.current.setLatLngs([
          [selectedPin.lat, selectedPin.lng],
          [actualLocation.lat, actualLocation.lng],
        ]);
      }

      // Smooth zoom to fit both points on screen
      const bounds = L.latLngBounds([
        [selectedPin.lat, selectedPin.lng],
        [actualLocation.lat, actualLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 11, animate: true });
    } else {
      // Clean up for next round
      if (actualMarkerRef.current) {
        actualMarkerRef.current.remove();
        actualMarkerRef.current = null;
      }
      if (lineRef.current) {
        lineRef.current.remove();
        lineRef.current = null;
      }
    }
  }, [isRevealed, actualLocation, selectedPin]);

  // Expand / minimize trigger
  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setIsExpanded(!isExpanded);
    }
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  const effectiveExpanded = externalExpanded !== undefined ? externalExpanded : isExpanded;

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([25, 10], 2, { animate: true });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={className || `relative w-full bg-[#080808] border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${
        effectiveExpanded ? 'h-[580px] sm:h-[640px]' : 'h-[380px] sm:h-[460px]'
      }`}
    >
      {/* Interactive Map DOM Container with crosshair cursor */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-10 cursor-crosshair"
        style={{ cursor: !isRevealed && !disabled ? 'crosshair' : 'grab' }}
      />

      {/* Clean minimal controls: Reset & Expand on top-left, Zoom on top-right */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleResetView}
          className="p-1.5 bg-black/85 hover:bg-black text-white/80 hover:text-white rounded border border-white/20 backdrop-blur-md shadow-md transition-all active:scale-95"
          title="Centrar vista mundial"
        >
          <RotateCcw size={14} />
        </button>
        <button
          type="button"
          onClick={toggleExpand}
          className="p-1.5 bg-black/85 hover:bg-black text-[#fed100] rounded border border-white/20 backdrop-blur-md shadow-md transition-all active:scale-95"
          title={effectiveExpanded ? 'Reducir mapa' : 'Expandir mapa'}
        >
          {effectiveExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Top Right Minimal Zoom Controls */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-7 h-7 bg-black/85 hover:bg-black text-white rounded border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-95"
          title="Acercar (+)"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-7 h-7 bg-black/85 hover:bg-black text-white rounded border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-all active:scale-95"
          title="Alejar (-)"
        >
          <ZoomOut size={14} />
        </button>
      </div>
    </div>
  );
};
