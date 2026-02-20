import { useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { useMapContext } from '../context/MapContext';
import { camionsAPI } from '../services/api';
import { reverseGeocodeBatch } from '../services/geocoding';
import L from 'leaflet';
import { FiTruck, FiUsers, FiNavigation, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const createIcon = (color, letter) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:bold;font-size:13px;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ">${letter}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -20],
    });
};

const statusIcons = {
    en_route: { color: '#22c55e', label: 'En route', icon: createIcon('#22c55e', 'C') },
    arrete: { color: '#f97316', label: 'Arrêté', icon: createIcon('#f97316', 'C') },
    arrete_nc: { color: '#ef4444', label: 'Arrêté NC', icon: createIcon('#ef4444', 'C') },
};

const Dashboard = () => {
    const { setMapData } = useMapContext();

    useEffect(() => {
        const loadCamions = async () => {
            try {
                const { data } = await camionsAPI.getCamions();
                const camionsData = data.data || [];
                
                // Charger les adresses pour tous les camions avec GPS
                const coordsWithGPS = camionsData
                    .filter((c) => c.lat != null && c.lng != null)
                    .map((c) => ({ lat: c.lat, lng: c.lng }));
                
                const addresses = await reverseGeocodeBatch(coordsWithGPS);
                
                // Créer les marqueurs avec les adresses
                const markers = camionsData
                    .filter((c) => c.lat != null && c.lng != null)
                    .map((camion) => {
                        const cfg = statusIcons[camion.statut] || statusIcons.arrete;
                        const addressKey = `${camion.lat},${camion.lng}`;
                        const address = addresses.get(addressKey) || camion.localisation || '—';
                        
                        return {
                            id: camion.plaque,
                            lat: camion.lat,
                            lng: camion.lng,
                            icon: cfg.icon,
                            label: camion.plaque,
                            sublabel: camion.chauffeur || '—',
                            info: `📍 ${address} · ${camion.vitesse ?? 0} km/h`,
                            badgeLabel: cfg.label,
                            badgeColor: cfg.color,
                        };
                    });
                
                setMapData({ markers, polylines: [], flyTo: null, selectedMarkerId: null });
            } catch (error) {
                console.error('Erreur chargement camions Dashboard:', error);
                setMapData({ markers: [], polylines: [], flyTo: null, selectedMarkerId: null });
            }
        };
        
        loadCamions();
    }, [setMapData]);

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Total Camions</p>
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <FiTruck className="text-orange-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">12</p>
                        <div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
                            <FiArrowUp /> <span>8 en route</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Chauffeurs Actifs</p>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FiUsers className="text-blue-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">10</p>
                        <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                            <span>sur 12 total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Distance Totale</p>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FiNavigation className="text-green-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">1,245 <span className="text-sm text-gray-400">km</span></p>
                        <div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
                            <FiArrowUp /> <span>+12% aujourd'hui</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Alertes</p>
                            <div className="bg-red-100 p-2 rounded-lg">
                                <FiActivity className="text-red-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">3</p>
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                            <FiArrowDown /> <span>2 non conformes</span>
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                    <h2 className="text-base font-bold text-gray-800 mb-3">Activité récente</h2>
                    <div className="space-y-2.5">
                        {[
                            { time: '14:32', text: '120 TDS 4578 - Départ de Tunis', color: 'bg-orange-500' },
                            { time: '14:15', text: '95 TDS 6543 - Arrêt non conforme à Nabeul', color: 'bg-red-500' },
                            { time: '13:48', text: '142 TDS 8877 - En route vers Sousse', color: 'bg-orange-500' },
                            { time: '13:20', text: '78 NGI 5544 - Arrêt à Zaghouan', color: 'bg-green-500' },
                            { time: '12:55', text: '185 TDS 9321 - Arrêt à Manouba', color: 'bg-green-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className={`w-2 h-2 rounded-full mt-1.5 ${item.color}`}></span>
                                <div>
                                    <p className="text-sm text-gray-700">{item.text}</p>
                                    <p className="text-xs text-gray-400">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statut flotte */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-base font-bold text-gray-800 mb-3">Statut de la flotte</h2>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">En route</span>
                                <span className="font-semibold text-gray-800">6 camions</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Arrêt conforme</span>
                                <span className="font-semibold text-gray-800">4 camions</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Arrêt non conforme</span>
                                <span className="font-semibold text-gray-800">2 camions</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
