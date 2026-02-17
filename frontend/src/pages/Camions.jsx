import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiSearch, FiMapPin, FiArrowLeft, FiPhone, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { FaGasPump, FaTachometerAlt, FaThermometerHalf, FaRoad } from 'react-icons/fa';

// ====== DONNÉES SIMULÉES ======
const camionsData = [
    {
        id: 1,
        plaque: '120 TDS 4578',
        chauffeur: 'Mohamed Ben Ali',
        telephone: '+216 98 123 456',
        localisation: 'Tunis',
        vitesse: 72,
        statut: 'en_route',
        lat: 36.8065,
        lng: 10.1815,
        kilometrage: 145230,
        carburant: 68,
        tempMoteur: 88,
        derniereMaj: '2026-02-16 14:30',
        trajet: [
            [36.82, 10.16], [36.815, 10.17], [36.81, 10.175],
            [36.8065, 10.1815], [36.80, 10.19], [36.795, 10.20]
        ],
    },
    {
        id: 2,
        plaque: '185 TDS 9321',
        chauffeur: 'Ahmed Trabelsi',
        telephone: '+216 97 456 789',
        localisation: 'Manouba',
        vitesse: 0,
        statut: 'arrete',
        lat: 36.8101,
        lng: 10.0863,
        kilometrage: 98450,
        carburant: 42,
        tempMoteur: 45,
        derniereMaj: '2026-02-16 13:15',
        trajet: [
            [36.82, 10.07], [36.815, 10.08], [36.8101, 10.0863]
        ],
    },
    {
        id: 3,
        plaque: '210 NGI 1234',
        chauffeur: 'Slim Bouazizi',
        telephone: '+216 55 321 654',
        localisation: 'Ariana',
        vitesse: 85,
        statut: 'en_route',
        lat: 36.8625,
        lng: 10.1956,
        kilometrage: 210340,
        carburant: 55,
        tempMoteur: 92,
        derniereMaj: '2026-02-16 14:28',
        trajet: [
            [36.88, 10.17], [36.875, 10.18], [36.87, 10.19],
            [36.8625, 10.1956], [36.855, 10.20]
        ],
    },
    {
        id: 4,
        plaque: '95 TDS 6543',
        chauffeur: 'Karim Hamdi',
        telephone: '+216 22 654 987',
        localisation: 'Nabeul',
        vitesse: 0,
        statut: 'arrete_nc',
        lat: 36.4513,
        lng: 10.7357,
        kilometrage: 176890,
        carburant: 12,
        tempMoteur: 38,
        derniereMaj: '2026-02-16 10:45',
        trajet: [
            [36.47, 10.71], [36.46, 10.72], [36.4513, 10.7357]
        ],
    },
    {
        id: 5,
        plaque: '142 TDS 8877',
        chauffeur: 'Youssef Gharbi',
        telephone: '+216 26 789 123',
        localisation: 'Sousse',
        vitesse: 63,
        statut: 'en_route',
        lat: 35.8256,
        lng: 10.6369,
        kilometrage: 134560,
        carburant: 74,
        tempMoteur: 85,
        derniereMaj: '2026-02-16 14:25',
        trajet: [
            [35.85, 10.61], [35.84, 10.62], [35.835, 10.63],
            [35.8256, 10.6369], [35.82, 10.64]
        ],
    },
    {
        id: 6,
        plaque: '78 NGI 5544',
        chauffeur: 'Nabil Jaziri',
        telephone: '+216 50 147 258',
        localisation: 'Zaghouan',
        vitesse: 0,
        statut: 'arrete',
        lat: 36.4029,
        lng: 10.1429,
        kilometrage: 89320,
        carburant: 31,
        tempMoteur: 40,
        derniereMaj: '2026-02-16 12:00',
        trajet: [
            [36.42, 10.13], [36.41, 10.14], [36.4029, 10.1429]
        ],
    },
    {
        id: 7,
        plaque: '163 TDS 3211',
        chauffeur: 'Hedi Mansour',
        telephone: '+216 29 963 852',
        localisation: 'Bizerte',
        vitesse: 55,
        statut: 'en_route',
        lat: 37.2744,
        lng: 9.8739,
        kilometrage: 201780,
        carburant: 60,
        tempMoteur: 82,
        derniereMaj: '2026-02-16 14:20',
        trajet: [
            [37.30, 9.85], [37.29, 9.86], [37.28, 9.87],
            [37.2744, 9.8739]
        ],
    },
    {
        id: 8,
        plaque: '91 NGI 7788',
        chauffeur: 'Omar Saidi',
        telephone: '+216 54 741 852',
        localisation: 'Sfax',
        vitesse: 0,
        statut: 'arrete',
        lat: 34.7406,
        lng: 10.7603,
        kilometrage: 310200,
        carburant: 25,
        tempMoteur: 35,
        derniereMaj: '2026-02-16 09:30',
        trajet: [
            [34.76, 10.74], [34.75, 10.75], [34.7406, 10.7603]
        ],
    },
    {
        id: 9,
        plaque: '55 TDS 4422',
        chauffeur: 'Amine Bouzid',
        telephone: '+216 23 369 147',
        localisation: 'Hammamet',
        vitesse: 40,
        statut: 'en_route',
        lat: 36.4000,
        lng: 10.6167,
        kilometrage: 67890,
        carburant: 82,
        tempMoteur: 78,
        derniereMaj: '2026-02-16 14:10',
        trajet: [
            [36.42, 10.60], [36.41, 10.61], [36.4000, 10.6167],
            [36.39, 10.62]
        ],
    },
    {
        id: 10,
        plaque: '200 NGI 6655',
        chauffeur: 'Walid Khelifi',
        telephone: '+216 58 987 321',
        localisation: 'Kairouan',
        vitesse: 0,
        statut: 'arrete_nc',
        lat: 35.6781,
        lng: 10.0963,
        kilometrage: 256100,
        carburant: 8,
        tempMoteur: 42,
        derniereMaj: '2026-02-16 08:00',
        trajet: [
            [35.70, 10.08], [35.69, 10.09], [35.6781, 10.0963]
        ],
    },
    {
        id: 11,
        plaque: '88 TDS 1199',
        chauffeur: 'Sami Bouazizi',
        telephone: '+216 21 654 321',
        localisation: 'Gabès',
        vitesse: 78,
        statut: 'en_route',
        lat: 33.8814,
        lng: 10.0982,
        kilometrage: 189500,
        carburant: 45,
        tempMoteur: 90,
        derniereMaj: '2026-02-16 14:15',
        trajet: [
            [33.90, 10.08], [33.895, 10.09], [33.89, 10.095],
            [33.8814, 10.0982]
        ],
    },
    {
        id: 12,
        plaque: '134 NGI 3344',
        chauffeur: 'Fathi Meddeb',
        telephone: '+216 52 258 147',
        localisation: 'Monastir',
        vitesse: 0,
        statut: 'arrete',
        lat: 35.7643,
        lng: 10.8113,
        kilometrage: 145670,
        carburant: 53,
        tempMoteur: 44,
        derniereMaj: '2026-02-16 11:45',
        trajet: [
            [35.78, 10.79], [35.775, 10.80], [35.7643, 10.8113]
        ],
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
    en_route: { label: 'En route', color: '#22c55e', badgeBg: '#dcfce7', badgeText: '#16a34a', icon: createIcon('#22c55e', 'C') },
    arrete: { label: 'Arrêté', color: '#f97316', badgeBg: '#fff7ed', badgeText: '#ea580c', icon: createIcon('#f97316', 'C') },
    arrete_nc: { label: 'Arrêté NC', color: '#ef4444', badgeBg: '#fef2f2', badgeText: '#dc2626', icon: createIcon('#ef4444', 'C') },
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
    const [selectedCamionId, setSelectedCamionId] = useState(null);
    const [flyTo, setFlyTo] = useState(null);

    const filteredCamions = camionsData.filter(
        (c) =>
            c.plaque.toLowerCase().includes(search.toLowerCase()) ||
            c.chauffeur.toLowerCase().includes(search.toLowerCase()) ||
            c.localisation.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCamion = camionsData.find(c => c.id === selectedCamionId);

    const handleSelectCamion = (camion) => {
        setSelectedCamionId(camion.id);
        setFlyTo([camion.lat, camion.lng]);
    };

    const handleBackToList = () => {
        setSelectedCamionId(null);
        setFlyTo(null);
    };

    return (
        <Layout withMap={false}>
            <div className="flex h-screen -mt-0">
                {/* ====== PANNEAU GAUCHE ====== */}
                <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">

                    {/* === VUE DÉTAILLÉE === */}
                    {selectedCamion ? (
                        <div className="flex-1 overflow-y-auto">
                            {/* Retour */}
                            <div className="px-4 pt-4 pb-2">
                                <button
                                    onClick={handleBackToList}
                                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors cursor-pointer"
                                >
                                    <FiArrowLeft className="text-base" />
                                    Retour à la liste
                                </button>
                            </div>

                            {/* Header : matricule + badge */}
                            <div className="px-5 pb-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800">{selectedCamion.plaque}</h2>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            background: statusConfig[selectedCamion.statut].badgeBg,
                                            color: statusConfig[selectedCamion.statut].badgeText,
                                            border: `1.5px solid ${statusConfig[selectedCamion.statut].color}`
                                        }}
                                    >
                                        {statusConfig[selectedCamion.statut].label}
                                    </span>
                                </div>
                            </div>

                            {/* Infos chauffeur */}
                            <div className="mx-5 mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 text-gray-500 font-medium">Chauffeur</td>
                                            <td className="py-2 text-right text-gray-800 font-semibold">{selectedCamion.chauffeur}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 text-gray-500 font-medium">Téléphone</td>
                                            <td className="py-2 text-right text-gray-800 font-semibold">{selectedCamion.telephone}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 text-gray-500 font-medium">Position</td>
                                            <td className="py-2 text-right text-gray-800 font-semibold">{selectedCamion.localisation}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-gray-500 font-medium">Dernière MAJ</td>
                                            <td className="py-2 text-right text-gray-800 font-semibold">{selectedCamion.derniereMaj}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 4 cartes métriques */}
                            <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
                                {/* Vitesse */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                    <FaTachometerAlt className="mx-auto text-2xl text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">Vitesse</p>
                                    <p className="text-xl font-bold text-gray-800">{selectedCamion.vitesse} <span className="text-sm font-normal text-gray-500">km/h</span></p>
                                </div>
                                {/* Kilométrage */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                    <FaRoad className="mx-auto text-2xl text-orange-400 mb-2" />
                                    <p className="text-xs text-orange-500 mb-1">Kilométrage</p>
                                    <p className="text-xl font-bold text-orange-500">{selectedCamion.kilometrage.toLocaleString()} <span className="text-sm font-normal text-gray-500">km</span></p>
                                </div>
                                {/* Carburant */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                    <FaGasPump className="mx-auto text-2xl text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">Carburant</p>
                                    <p className="text-xl font-bold text-gray-800">{selectedCamion.carburant}<span className="text-sm font-normal text-gray-500">%</span></p>
                                </div>
                                {/* Temp. moteur */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                    <FaThermometerHalf className="mx-auto text-2xl text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">Temp. moteur</p>
                                    <p className="text-xl font-bold text-gray-800">{selectedCamion.tempMoteur}<span className="text-sm font-normal text-gray-500">°C</span></p>
                                </div>
                            </div>

                            {/* Diagnostics */}
                            <div className="mx-5 mb-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Diagnostics</h3>
                                <div className="space-y-3 text-sm">
                                    {/* Odomètre */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Odomètre</span>
                                        <span className="font-semibold text-gray-800">{selectedCamion.kilometrage.toLocaleString()} km</span>
                                    </div>
                                    {/* Niveau carburant avec barre */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-500">Niveau carburant</span>
                                            <span className="font-semibold text-gray-800">{selectedCamion.carburant}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${selectedCamion.carburant}%`,
                                                    background: selectedCamion.carburant > 50 ? '#22c55e' :
                                                        selectedCamion.carburant > 20 ? '#f97316' : '#ef4444'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    {/* GPS */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">GPS</span>
                                        <span className="font-semibold text-gray-800">{selectedCamion.lat}, {selectedCamion.lng}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    ) : (
                        /* === VUE LISTE === */
                        <>
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
                                    return (
                                        <div
                                            key={camion.id}
                                            onClick={() => handleSelectCamion(camion)}
                                            className="px-4 py-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-orange-50"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-gray-800 text-sm">{camion.plaque}</span>
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                    style={{
                                                        background: config.badgeBg,
                                                        color: config.badgeText,
                                                        border: `1px solid ${config.color}`
                                                    }}
                                                >
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
                        </>
                    )}
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

                        {/* Route polyline for selected camion */}
                        {selectedCamion && selectedCamion.trajet && (
                            <Polyline
                                positions={selectedCamion.trajet}
                                pathOptions={{
                                    color: '#3b82f6',
                                    weight: 4,
                                    opacity: 0.8,
                                    dashArray: null,
                                }}
                            />
                        )}

                        {/* Markers for each truck */}
                        {camionsData.map((camion) => {
                            const config = statusConfig[camion.statut];
                            const isSelected = selectedCamionId === camion.id;
                            return (
                                <Marker
                                    key={camion.id}
                                    position={[camion.lat, camion.lng]}
                                    icon={config.icon}
                                    eventHandlers={{
                                        click: () => handleSelectCamion(camion),
                                    }}
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
                                <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200"></span>
                                <span className="text-gray-600">En route</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-200"></span>
                                <span className="text-gray-600">Arrêté</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200"></span>
                                <span className="text-gray-600">Arrêté non conforme</span>
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
