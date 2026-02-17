import { useState, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiSearch, FiMapPin } from 'react-icons/fi';

// ====== DONNÉES SIMULÉES ======
const camionsData = [
    {
        id: 1,
        plaque: '120 TDS 4578',
        chauffeur: 'Mohamed Ben Ali',
        localisation: 'Tunis',
        vitesse: 72,
        statut: 'en_route',
        lat: 36.8065,
        lng: 10.1815,
    },
    {
        id: 2,
        plaque: '185 TDS 9321',
        chauffeur: 'Ahmed Trabelsi',
        localisation: 'Manouba',
        vitesse: 0,
        statut: 'arrete',
        lat: 36.8101,
        lng: 10.0863,
    },
    {
        id: 3,
        plaque: '210 NGI 1234',
        chauffeur: 'Slim Rouazini',
        localisation: 'Ariana',
        vitesse: 85,
        statut: 'en_route',
        lat: 36.8625,
        lng: 10.1956,
    },
    {
        id: 4,
        plaque: '95 TDS 6543',
        chauffeur: 'Karim Hamdi',
        localisation: 'Nabeul',
        vitesse: 0,
        statut: 'arrete_nc',
        lat: 36.4513,
        lng: 10.7357,
    },
    {
        id: 5,
        plaque: '142 TDS 8877',
        chauffeur: 'Youssef Gharbi',
        localisation: 'Sousse',
        vitesse: 63,
        statut: 'en_route',
        lat: 35.8256,
        lng: 10.6369,
    },
    {
        id: 6,
        plaque: '78 NGI 5544',
        chauffeur: 'Nabil Jaziri',
        localisation: 'Zaghouan',
        vitesse: 0,
        statut: 'arrete',
        lat: 36.4029,
        lng: 10.1429,
    },
    {
        id: 7,
        plaque: '163 TDS 3211',
        chauffeur: 'Hedi Mansour',
        localisation: 'Bizerte',
        vitesse: 55,
        statut: 'en_route',
        lat: 37.2744,
        lng: 9.8739,
    },
    {
        id: 8,
        plaque: '91 NGI 7788',
        chauffeur: 'Omar Saidi',
        localisation: 'Sfax',
        vitesse: 0,
        statut: 'arrete',
        lat: 34.7406,
        lng: 10.7603,
    },
    {
        id: 9,
        plaque: '55 TDS 4422',
        chauffeur: 'Amine Bouzid',
        localisation: 'Hammamet',
        vitesse: 40,
        statut: 'en_route',
        lat: 36.4000,
        lng: 10.6167,
    },
    {
        id: 10,
        plaque: '200 NGI 6655',
        chauffeur: 'Walid Khelifi',
        localisation: 'Kairouan',
        vitesse: 0,
        statut: 'arrete_nc',
        lat: 35.6781,
        lng: 10.0963,
    },
    {
        id: 11,
        plaque: '88 TDS 1199',
        chauffeur: 'Sami Bouazizi',
        localisation: 'Gabès',
        vitesse: 78,
        statut: 'en_route',
        lat: 33.8814,
        lng: 10.0982,
    },
    {
        id: 12,
        plaque: '134 NGI 3344',
        chauffeur: 'Fathi Meddeb',
        localisation: 'Monastir',
        vitesse: 0,
        statut: 'arrete',
        lat: 35.7643,
        lng: 10.8113,
    },
];

// ====== ICÔNES PERSONNALISÉES ======
const createIcon = (color, letter) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${letter}</div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
    });
};

const statusConfig = {
    en_route: { label: 'En route', color: '#1249d3ff', bgClass: 'bg-orange-500', textClass: 'text-white', icon: createIcon('#f97316', 'C') },
    arrete: { label: 'Arrêté', color: '#22c55e', bgClass: 'bg-orange-400', textClass: 'text-white', icon: createIcon('#22c55e', 'C') },
    arrete_nc: { label: 'Arrêté NC', color: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-white', icon: createIcon('#ef4444', 'C') },
};

// ====== COMPOSANT MAP FLY ======
const FlyToMarker = ({ position, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom || 12, { duration: 1.2 });
        }
    }, [position, zoom, map]);
    return null;
};

// ====== COMPOSANT PRINCIPAL ======
const Camions = () => {
    const [search, setSearch] = useState('');
    const [selectedCamion, setSelectedCamion] = useState(null);
    const [flyTo, setFlyTo] = useState(null);

    const filteredCamions = camionsData.filter(
        (c) =>
            c.plaque.toLowerCase().includes(search.toLowerCase()) ||
            c.chauffeur.toLowerCase().includes(search.toLowerCase()) ||
            c.localisation.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectCamion = (camion) => {
        setSelectedCamion(camion.id);
        setFlyTo([camion.lat, camion.lng]);
    };

    return (
        <Layout>
            <div className="flex h-screen -mt-0">
                {/* ====== PANNEAU GAUCHE - LISTE ====== */}
                <div className="w-[350px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Camions</h2>
                        {/* Barre de recherche */}
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{filteredCamions.length} camions</p>
                    </div>

                    {/* Liste des camions */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredCamions.map((camion) => {
                            const config = statusConfig[camion.statut];
                            const isSelected = selectedCamion === camion.id;
                            return (
                                <div
                                    key={camion.id}
                                    onClick={() => handleSelectCamion(camion)}
                                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-orange-50
                    ${isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{camion.plaque}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgClass} ${config.textClass}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-orange-500">{camion.chauffeur}</span>
                                        <span className="text-sm text-gray-400">{camion.vitesse} km/h</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <FiMapPin className="text-gray-400 text-xs" />
                                        <span className="text-xs text-gray-400">{camion.localisation}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ====== PANNEAU DROIT - CARTE ====== */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={[35.8, 10.2]}
                        zoom={7}
                        className="h-full w-full"
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Fly to selected marker */}
                        {flyTo && <FlyToMarker position={flyTo} zoom={12} />}

                        {/* Markers for each truck */}
                        {camionsData.map((camion) => {
                            const config = statusConfig[camion.statut];
                            return (
                                <Marker
                                    key={camion.id}
                                    position={[camion.lat, camion.lng]}
                                    icon={config.icon}
                                >
                                    <Popup>
                                        <div className="text-sm min-w-[180px]">
                                            <p className="font-bold text-gray-800">{camion.plaque}</p>
                                            <p className="text-orange-500">{camion.chauffeur}</p>
                                            <p className="text-gray-500 mt-1">
                                                📍 {camion.localisation} · {camion.vitesse} km/h
                                            </p>
                                            <span
                                                className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                                style={{ background: config.color }}
                                            >
                                                {config.label}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>

                    {/* ====== LÉGENDE ====== */}
                    <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 z-[1000] text-sm">
                        <h4 className="font-bold text-gray-800 mb-3">Légende</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-200"></span>
                                <span className="text-gray-600">En route</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200"></span>
                                <span className="text-gray-600">Arrêt conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 text-xs font-bold">Non conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-600 border-2 border-green-200"></span>
                                <span className="text-gray-600">Arrêt conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200"></span>
                                <span className="text-gray-600">Arrêt non conforme</span>
                            </div>
                            <hr className="my-1" />
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-0.5 bg-blue-500"></span>
                                <span className="text-gray-600">Trajet</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-blue-500"></span>
                                <span className="text-gray-600">Dépôt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                                <span className="text-gray-600">Client Interne</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                                <span className="text-gray-600">Client Externe</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400 border-2 border-blue-200"></span>
                                <span className="text-gray-600">Station</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Camions;
