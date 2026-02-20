import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiX, FiCheck, FiMapPin, FiLayers } from 'react-icons/fi';

// Helper to update map view when coords change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

// Component to handle map clicks
const LocationPicker = ({ mode, onLocationSelect, currentPos, polygonPoints, setPolygonPoints }) => {
    useMapEvents({
        click(e) {
            if (mode === 'point') {
                onLocationSelect(e.latlng);
            } else {
                setPolygonPoints(prev => [...prev, e.latlng]);
            }
        },
    });

    return (
        <>
            {mode === 'point' && currentPos && (
                <Marker
                    position={currentPos}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => onLocationSelect(e.target.getLatLng()),
                    }}
                />
            )}
            {mode === 'zone' && polygonPoints.length > 0 && (
                <>
                    {polygonPoints.map((pt, idx) => (
                        <Marker key={idx} position={pt} icon={
                            L.divIcon({
                                className: 'bg-transparent',
                                html: `<div style="width: 10px; height: 10px; background: orange; border-radius: 50%; border: 2px solid white;"></div>`
                            })
                        } />
                    ))}
                    <Polygon positions={polygonPoints} color="orange" />
                </>
            )}
        </>
    );
};

const PoiModal = ({ isOpen, onClose, initialData }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        nom: '',
        type: 'Client Interne',
        groupe: 'Groupe 1',
        lat: '',
        lng: '',
    });

    const [mode, setMode] = useState('point'); // 'point' | 'zone'
    const [polygonPoints, setPolygonPoints] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                lat: initialData.lat || '',
                lng: initialData.lng || ''
            }));
        }
    }, [initialData]);

    const handleLocationSelect = (latlng) => {
        setFormData(prev => ({
            ...prev,
            lat: latlng.lat.toFixed(6),
            lng: latlng.lng.toFixed(6)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting POI:", { ...formData, mode, polygonPoints });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-[900px] h-[600px] rounded-2xl shadow-2xl flex overflow-hidden animate-fade-in-up">

                {/* === GAUCHE : FORMULAIRE === */}
                <div className="w-1/3 p-6 flex flex-col border-r border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Nouveau POI</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                value={formData.nom}
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="Ex: Entrepôt Nord"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option>Point</option>
                                <option>Polygone</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe *</label>
                            <select
                                value={formData.groupe}
                                onChange={e => setFormData({ ...formData, groupe: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Dépôt">🟡 Dépôt</option>
                                <option value="Client Interne">🟠 Client Interne</option>
                                <option value="Client Externe">🔴 Client Externe</option>
                                <option value="Station">🟣 Station</option>
                                <option value="Zone Industrielle">🔵 Zone Industrielle</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.lat}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.lng}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="mt-auto pt-4">
                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-md mb-4 border border-orange-100 flex items-center gap-2">
                                <FiMapPin />
                                {mode === 'point' ? "Cliquez sur la carte pour placer le point." : "Cliquez pour dessiner la zone."}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm shadow-lg shadow-orange-200 transition-all"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* === DROITE : CARTE === */}
                <div className="w-2/3 relative h-full">
                    {/* Controls Overlay */}
                    <div className="absolute top-4 right-4 z-[500] bg-white rounded-lg shadow-md p-1 flex items-center gap-1 border border-gray-100">
                        <button
                            onClick={() => setMode('point')}
                            className={`p-2 rounded-md transition-all ${mode === 'point' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            title="Mode Point"
                        >
                            <FiMapPin />
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button
                            onClick={() => setMode('zone')}
                            className={`p-2 rounded-md transition-all ${mode === 'zone' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            title="Mode Zone (Polygone)"
                        >
                            <FiLayers />
                        </button>
                    </div>

                    <MapContainer
                        center={[initialData?.lat || 36.8, initialData?.lng || 10.1]}
                        zoom={13}
                        className="h-full w-full"
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap lat={initialData?.lat} lng={initialData?.lng} />
                        <LocationPicker
                            mode={mode}
                            onLocationSelect={handleLocationSelect}
                            currentPos={formData.lat ? [formData.lat, formData.lng] : null}
                            polygonPoints={polygonPoints}
                            setPolygonPoints={setPolygonPoints}
                        />
                    </MapContainer>
                </div>

                {/* Close button top right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[2001] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                    <FiX className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default PoiModal;
