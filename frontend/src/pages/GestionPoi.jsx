import { useState, useMemo, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiClock, FiGrid, FiList } from 'react-icons/fi';
import PoiModal from '../components/PoiModal';
import GroupModal from '../components/GroupModal';
import { poiAPI } from '../services/api';

const initialPois = [];

const initialGroups = [
    { id: 'g1', nom: 'Dépôt', description: 'Sites principaux', couleur: '#fbbf24', bg: '#fffbeb', border: '#f59e0b' },
    { id: 'g2', nom: 'Client Interne', description: 'Clients groupe', couleur: '#f97316', bg: '#fff7ed', border: '#ea580c' },
    { id: 'g3', nom: 'Client Externe', description: 'Clients tiers', couleur: '#ef4444', bg: '#fef2f2', border: '#dc2626' },
    { id: 'g4', nom: 'Station', description: 'Stations service', couleur: '#a855f7', bg: '#faf5ff', border: '#9333ea' },
    { id: 'g5', nom: 'Zone Industrielle', description: 'Zones logistiques', couleur: '#06b6d4', bg: '#ecfeff', border: '#0891b2' }
];

const createCustomIcon = (groupName, groups) => {
    const group = groups.find(g => g.nom === groupName) || { couleur: '#6b7280' };
    return L.divIcon({
        className: 'custom-poi-marker',
        html: `
            <div style="
                background-color: ${group.couleur};
                width: 24px; height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
                color: white; font-size: 10px;
            ">
                
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const MapController = ({ position, zoom, resizeTrigger }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, zoom || 12, { duration: 1.2 });
    }, [position, zoom, map]);

    useEffect(() => {
        map.invalidateSize();
    }, [resizeTrigger, map]);

    return null;
};

const GestionPoi = () => {
    // === STATES ===
    const [pois, setPois] = useState(initialPois);
    const [groups, setGroups] = useState(initialGroups);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterGroup, setFilterGroup] = useState('Tous');
    const [activeTab, setActiveTab] = useState('liste'); // liste, groupes, historique
    const [selectedPoiId, setSelectedPoiId] = useState(null);
    const [flyTo, setFlyTo] = useState(null);

    // Modals
    const [showPoiModal, setShowPoiModal] = useState(false);
    const [editingPoi, setEditingPoi] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    // Fetch POIs
    const fetchPois = async () => {
        setLoading(true);
        try {
            const { data } = await poiAPI.getPOIs();
            setPois(data.data || []);
        } catch (error) {
            console.error('Failed to fetch POIs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPois();
    }, []);

    // Filter Logic
    const filteredPois = useMemo(() => {
        return pois.filter(poi => {
            const matchesSearch = poi.nom.toLowerCase().includes(search.toLowerCase());
            const matchesGroup = filterGroup === 'Tous' || poi.groupe === filterGroup;
            return matchesSearch && matchesGroup;
        });
    }, [search, filterGroup, pois]);

    // Handlers
    const handleSelectPoi = (poi) => {
        setSelectedPoiId(poi.id);
        const lat = parseFloat(poi.lat);
        const lng = parseFloat(poi.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
            setFlyTo([lat, lng]);
        }
    };

    const handleSavePoi = async (poiData) => {
        try {
            if (editingPoi) {
                await poiAPI.updatePOI(editingPoi.id, poiData);
            } else {
                await poiAPI.createPOI(poiData);
            }
            setShowPoiModal(false);
            setEditingPoi(null);
            fetchPois();
        } catch (error) {
            console.error('Failed to save POI:', error);
        }
    };

    const handleDeletePoi = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce POI ?')) {
            try {
                await poiAPI.deletePOI(id);
                fetchPois();
            } catch (error) {
                console.error('Failed to delete POI:', error);
            }
        }
    };

    const handleSaveGroup = (groupData) => {
        if (editingGroup) {
            // Edit existing
            setGroups(groups.map(g => g.id === editingGroup.id ? { ...g, ...groupData } : g));
        } else {
            // Create new
            const newGroup = {
                id: `g${Date.now()}`,
                ...groupData,
                bg: '#f9fafb', // default light bg
                border: groupData.couleur // border same as main color for simplicity
            };
            setGroups([...groups, newGroup]);
        }
        setEditingGroup(null);
    };

    const handleEditGroupClick = (group) => {
        setEditingGroup(group);
        setShowGroupModal(true);
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce groupe ?')) {
            setGroups(groups.filter(g => g.id !== groupId));
        }
    };

    // Resizable Layout
    const [leftPanelWidth, setLeftPanelWidth] = useState(40); // %
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const startResizing = () => setIsResizing(true);
    const stopResizing = () => setIsResizing(false);
    const resize = (e) => {
        if (isResizing && containerRef.current) {
            const newWidth = (e.clientX / containerRef.current.clientWidth) * 100;
            if (newWidth > 20 && newWidth < 70) setLeftPanelWidth(newWidth);
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
            <div ref={containerRef} className={`flex h-screen -mt-0 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>

                {/* === LEFT PANEL === */}
                <div className="bg-white flex flex-col border-r border-gray-200 z-10" style={{ width: `${leftPanelWidth}%` }}>

                    {/* Header Tabs */}
                    <div className="pt-6 px-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestion des POI</h1>
                        <div className="flex gap-6 border-b border-gray-100 text-sm font-medium text-gray-500">
                            <button
                                onClick={() => setActiveTab('liste')}
                                className={`pb-3 transition-colors flex items-center gap-2 ${activeTab === 'liste' ? 'text-orange-500 border-b-2 border-orange-500' : 'hover:text-gray-700'}`}
                            >
                                <FiList /> Liste des POI
                            </button>
                            <button
                                onClick={() => setActiveTab('groupes')}
                                className={`pb-3 transition-colors flex items-center gap-2 ${activeTab === 'groupes' ? 'text-orange-500 border-b-2 border-orange-500' : 'hover:text-gray-700'}`}
                            >
                                <FiGrid /> Groupes
                            </button>
                            <button
                                onClick={() => setActiveTab('historique')}
                                className={`pb-3 transition-colors flex items-center gap-2 ${activeTab === 'historique' ? 'text-orange-500 border-b-2 border-orange-500' : 'hover:text-gray-700'}`}
                            >
                                <FiClock /> Historique
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="bg-orange-50 p-2 rounded-lg">
                                <span className="text-orange-600 font-bold text-sm">{filteredPois.length} POI</span>
                            </div>
                            <button
                                onClick={() => setShowPoiModal(true)}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-orange-100 transition-all"
                            >
                                <FiPlus className="text-lg" /> Nouveau POI
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                                />
                            </div>
                            <div className="relative w-1/3">
                                <select
                                    value={filterGroup}
                                    onChange={e => setFilterGroup(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer font-medium text-gray-700"
                                >
                                    <option value="Tous">Tous</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.nom}>{g.nom}</option>
                                    ))}
                                </select>
                                <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar bg-gray-50 pt-4">

                        {activeTab === 'liste' && (
                            <>
                                {filteredPois.map(poi => {
                                    const group = groups.find(g => g.nom === poi.groupe) || groups[0];
                                    return (
                                        <div
                                            key={poi.id}
                                            onClick={() => handleSelectPoi(poi)}
                                            className={`p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer bg-white ${selectedPoiId === poi.id ? 'border-orange-400 ring-1 ring-orange-200' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800">{poi.nom}</h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingPoi(poi); setShowPoiModal(true); }}
                                                        className="text-gray-400 hover:text-orange-500 transition-colors bg-gray-50 p-1.5 rounded-md"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePoi(poi.id); }}
                                                        className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-1.5 rounded-md"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mb-2">
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                                                    style={{ backgroundColor: group.bg, color: group.couleur, borderColor: group.border }}
                                                >
                                                    {poi.groupe}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
                                                    {poi.type}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <span className="text-gray-400">{poi.lat}, {poi.lng}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="truncate">{poi.adresse}</span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {activeTab === 'groupes' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-bold text-gray-800">Gérer les groupes</h2>
                                    <button
                                        onClick={() => {
                                            setEditingGroup(null);
                                            setShowGroupModal(true);
                                        }}
                                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
                                    >
                                        <FiPlus /> Nouveau groupe
                                    </button>
                                </div>
                                {groups.map((group) => {
                                    const count = pois.filter(p => p.groupe === group.nom).length;
                                    return (
                                        <div key={group.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group-item">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: group.couleur }}
                                                ></div>
                                                <div>
                                                    <span className="font-bold text-gray-700 block">{group.nom}</span>
                                                    {group.description && <span className="text-xs text-gray-400 block">{group.description}</span>}
                                                </div>
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 ml-2">
                                                    {count} POI
                                                </span>
                                            </div>
                                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:group-item:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditGroupClick(group)}
                                                    className="text-gray-400 hover:text-orange-500 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {activeTab === 'historique' && (
                            <div className="text-center py-10 text-gray-400">
                                <FiClock className="mx-auto text-4xl mb-3 opacity-20" />
                                <p>Historique des modifications</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* === SPLITTER === */}
                <div
                    onMouseDown={startResizing}
                    className="w-1 bg-gray-100 hover:bg-orange-400 cursor-col-resize hover:w-1.5 transition-all z-20 flex items-center justify-center"
                ></div>

                {/* === RIGHT PANEL (MAP) === */}
                <div className="flex-grow h-full relative" style={{ width: `${100 - leftPanelWidth}%` }}>
                    <MapContainer
                        center={[36.5, 10.2]}
                        zoom={8}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController position={flyTo} zoom={14} resizeTrigger={leftPanelWidth} />

                        {filteredPois.map(poi => (
                            <Marker
                                key={poi.id}
                                position={[parseFloat(poi.lat), parseFloat(poi.lng)]}
                                icon={createCustomIcon(poi.groupe, groups)}
                                eventHandlers={{
                                    click: () => handleSelectPoi(poi)
                                }}
                            >
                                <Popup offset={[0, -10]}>
                                    <div className="text-sm">
                                        <h4 className="font-bold text-gray-800">{poi.nom}</h4>
                                        <span
                                            style={{ color: (groups.find(g => g.nom === poi.groupe) || {}).couleur }}
                                            className="text-xs font-semibold"
                                        >
                                            {poi.groupe}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Legend Overlay */}
                    <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-[1000] text-sm">
                        <h4 className="font-bold text-gray-800 mb-3">Légende</h4>
                        <div className="space-y-2">
                            {groups.map((group) => (
                                <div key={group.id} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: group.couleur, borderColor: group.border }}
                                    ></span>
                                    <span className="text-gray-600">{group.nom}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <PoiModal
                isOpen={showPoiModal}
                onClose={() => { setShowPoiModal(false); setEditingPoi(null); }}
                groups={groups}
                initialData={editingPoi}
                onSubmit={handleSavePoi}
            />

            <GroupModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                initialData={editingGroup}
                onSubmit={handleSaveGroup}
            />

        </Layout>
    );
};

export default GestionPoi;
