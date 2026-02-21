import { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiCalendar, FiUpload, FiPlus, FiFilter } from 'react-icons/fi';
import PoiModal from '../components/PoiModal'; // Import the new modal

// ====== ICÔNES PERSONNALISÉES ======
const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -10],
    });
};

const statusConfig = {
    conforme: { color: '#22c55e', bg: '#dcfce7', label: 'Arrêt conforme', icon: createIcon('#22c55e') },
    non_conforme: { color: '#ef4444', bg: '#fee2e2', label: 'Arrêt non conforme', icon: createIcon('#ef4444') },
    warning: { color: '#f97316', bg: '#ffedd5', label: 'Arrêt C', icon: createIcon('#f97316') },
};

// ====== COMPOSANT MAP FLY ======
const MapController = ({ position, zoom, resizeTrigger }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom || 11, { duration: 1.0 });
        }
    }, [position, zoom, map]);

    useEffect(() => {
        map.invalidateSize();
    }, [resizeTrigger, map]);

    return null;
};

const Arrets = () => {
    // === ETATS ===
    const [arrets, setArrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArretId, setSelectedArretId] = useState(null);
    const [flyTo, setFlyTo] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchArrets = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/arrets');
                const result = await response.json();
                if (result.success) {
                    setArrets(result.data);
                }
            } catch (error) {
                console.error('Error fetching arrets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArrets();
    }, []);

    // Layout Resizable
    const [leftPanelWidth, setLeftPanelWidth] = useState(55); // Pourcentage
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    // Filtres
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState('Tous');

    // Modal
    const [showPoiModal, setShowPoiModal] = useState(false);
    const [poiModalData, setPoiModalData] = useState(null);

    // === FILTRAGE ET STATS DYNAMIQUES ===
    const filteredData = useMemo(() => {
        return arrets.filter(arret => {
            const matchesDate = filterDate ? arret.date.includes(filterDate) : true;
            const matchesType =
                filterType === 'Tous' ? true :
                    filterType === 'Conforme' ? arret.status === 'conforme' :
                        filterType === 'Non conforme' ? arret.status === 'non_conforme' : true;
            return matchesDate && matchesType;
        });
    }, [arrets, filterDate, filterType]);

    const stats = useMemo(() => {
        return {
            total: filteredData.length,
            nc: filteredData.filter(a => a.status === 'non_conforme').length,
            c: filteredData.filter(a => a.status === 'conforme').length
        };
    }, [filteredData]);

    // === HANDLERS ===
    const handleSelectArret = (arret) => {
        setSelectedArretId(arret.id);
        setFlyTo([arret.lat, arret.lng]);
    };

    const handleOpenPoiModal = (e, arret) => {
        e.stopPropagation(); // Éviter de sélectionner la ligne quand on clique sur le bouton
        setPoiModalData(arret);
        setShowPoiModal(true);
    };

    // Gestion du redimensionnement
    const startResizing = () => setIsResizing(true);
    const stopResizing = () => setIsResizing(false);

    const resize = (e) => {
        if (isResizing && containerRef.current) {
            const newWidth = (e.clientX / containerRef.current.clientWidth) * 100;
            if (newWidth > 20 && newWidth < 80) { // Limites min/max
                setLeftPanelWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);

    return (
        <Layout withMap={false}>
            {/* Conteneur principal pour le layout resizable */}
            <div
                ref={containerRef}
                className={`flex h-screen -mt-0 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
            >
                {/* ====== PANNEAU GAUCHE - LISTE & KPI ====== */}
                <div
                    className="bg-white flex flex-col overflow-hidden relative"
                    style={{ width: `${leftPanelWidth}%` }}
                >

                    {/* Header & Statistiques */}
                    <div className="p-6 pb-2">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Rapport arrêts</h1>

                        {/* Filtres + KPIs */}
                        <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
                            {/* Inputs Filtres */}
                            <div className="flex gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCalendar className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="aaaa-mm-jj"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        <option>Tous</option>
                                        <option>Conforme</option>
                                        <option>Non conforme</option>
                                    </select>
                                    <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Cartes KPI */}
                            <div className="flex gap-4">
                                <div className="bg-orange-500 text-white px-5 py-2 rounded-xl text-center shadow-lg shadow-orange-200">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">NOMBRE D'ARRÊTS</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="text-center px-2 py-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">ARRÊTS NC</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.nc}</p>
                                </div>
                                <div className="text-center px-2 py-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">ARRÊTS C</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.c}</p>
                                </div>
                            </div>
                        </div>

                        {/* Barre d'action secondaire */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-center"></div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                <FiUpload />
                                Importer POI
                            </button>
                        </div>
                    </div>

                    {/* Table des arrêts */}
                    <div className="flex-1 overflow-auto px-6 pb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Camion</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Durée</th>
                                    <th className="px-4 py-3 font-semibold">POI GPS</th>
                                    <th className="px-4 py-3 font-semibold">POI Planning</th>
                                    <th className="px-4 py-3 font-semibold">N° Voyage</th>
                                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((arret) => (
                                    <tr
                                        key={arret.id}
                                        onClick={() => handleSelectArret(arret)}
                                        className={`cursor-pointer transition-colors border-b border-white border-4 ${selectedArretId === arret.id ? 'ring-2 ring-orange-400' : ''}`}
                                        style={{ backgroundColor: statusConfig[arret.status].bg }}
                                    >
                                        <td className="px-4 py-4 font-bold text-gray-700">
                                            {arret.camion.split(' ').map((chunk, i) => (
                                                <span key={i} className="block">{chunk}</span>
                                            ))}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {arret.date.split(' ').map((chunk, i) => (
                                                <span key={i} className="block text-gray-600">{chunk}</span>
                                            ))}
                                        </td>
                                        <td className="px-4 py-4 font-medium">{arret.duree}</td>
                                        <td className="px-4 py-4 text-gray-600">{arret.poiGps}</td>
                                        <td className="px-4 py-4 text-gray-600">{arret.poiPlanning}</td>
                                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap">{arret.nVoyage}</td>
                                        <td className="px-4 py-4">
                                            {/* Bouton visible UNIQUEMENT si statut Non Conforme */}
                                            {arret.status === 'non_conforme' && (
                                                <button
                                                    onClick={(e) => handleOpenPoiModal(e, arret)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap z-20 relative"
                                                >
                                                    <FiPlus /> Ajouter POI
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                Aucun arrêt ne correspond aux filtres.
                            </div>
                        )}
                    </div>
                </div>

                {/* ====== SPLITTER (POIGNÉE DE REDIMENSIONNEMENT) ====== */}
                <div
                    onMouseDown={startResizing}
                    className="w-1 bg-gray-200 hover:bg-orange-400 cursor-col-resize hover:w-1.5 transition-all z-50 flex items-center justify-center"
                >
                    <div className="h-8 w-1 bg-gray-400 rounded-full"></div>
                </div>

                {/* ====== PANNEAU DROIT - CARTE ====== */}
                <div
                    className="flex-grow relative h-full bg-gray-100"
                    style={{ width: `${100 - leftPanelWidth}%` }}
                >
                    <MapContainer
                        center={[36.5, 10.2]}
                        zoom={8}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Controlleur pour FlyTo et Resize */}
                        <MapController position={flyTo} zoom={13} resizeTrigger={leftPanelWidth} />

                        {/* Marqueurs */}
                        {filteredData.map((arret) => (
                            <Marker
                                key={arret.id}
                                position={[arret.lat, arret.lng]}
                                icon={statusConfig[arret.status].icon}
                                eventHandlers={{
                                    click: () => handleSelectArret(arret),
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>{arret.camion}</strong>
                                        <br />
                                        {arret.date}
                                        <br />
                                        <span style={{ color: statusConfig[arret.status].color, fontWeight: 'bold' }}>
                                            {statusConfig[arret.status].label}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Légende flottante */}
                    <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 z-[1000] text-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-2">Légende</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></span>
                                <span className="text-gray-600">Arrêt conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></span>
                                <span className="text-gray-600">Arrêt non conforme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm"></span>
                                <span className="text-gray-600">Arrêt C</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== POI MODAL ====== */}
            <PoiModal
                isOpen={showPoiModal}
                onClose={() => setShowPoiModal(false)}
                initialData={poiModalData}
            />
        </Layout>
    );
};

export default Arrets;
