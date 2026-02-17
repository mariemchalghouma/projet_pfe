import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { FiTruck, FiUsers, FiNavigation, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const Dashboard = () => {
    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">Total Camions</p>
                            <div className="bg-orange-100 p-2.5 rounded-lg">
                                <FiTruck className="text-orange-500 text-lg" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">12</p>
                        <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                            <FiArrowUp /> <span>8 en route</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">Chauffeurs Actifs</p>
                            <div className="bg-blue-100 p-2.5 rounded-lg">
                                <FiUsers className="text-blue-500 text-lg" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">10</p>
                        <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                            <span>sur 12 total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">Distance Totale</p>
                            <div className="bg-green-100 p-2.5 rounded-lg">
                                <FiNavigation className="text-green-500 text-lg" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">1,245 <span className="text-lg text-gray-400">km</span></p>
                        <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                            <FiArrowUp /> <span>+12% aujourd'hui</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">Alertes</p>
                            <div className="bg-red-100 p-2.5 rounded-lg">
                                <FiActivity className="text-red-500 text-lg" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">3</p>
                        <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                            <FiArrowDown /> <span>2 non conformes</span>
                        </div>
                    </div>
                </div>

                {/* Quick Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Activité récente</h2>
                        <div className="space-y-3">
                            {[
                                { time: '14:32', text: '120 TDS 4578 - Départ de Tunis', color: 'bg-orange-500' },
                                { time: '14:15', text: '95 TDS 6543 - Arrêt non conforme à Nabeul', color: 'bg-red-500' },
                                { time: '13:48', text: '142 TDS 8877 - En route vers Sousse', color: 'bg-orange-500' },
                                { time: '13:20', text: '78 NGI 5544 - Arrêt à Zaghouan', color: 'bg-green-500' },
                                { time: '12:55', text: '185 TDS 9321 - Arrêt à Manouba', color: 'bg-green-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className={`w-2 h-2 rounded-full mt-2 ${item.color}`}></span>
                                    <div>
                                        <p className="text-sm text-gray-700">{item.text}</p>
                                        <p className="text-xs text-gray-400">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Statut de la flotte</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">En route</span>
                                    <span className="font-semibold text-gray-800">6 camions</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Arrêt conforme</span>
                                    <span className="font-semibold text-gray-800">4 camions</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '33%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Arrêt non conforme</span>
                                    <span className="font-semibold text-gray-800">2 camions</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '17%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
