import pool from '../config/database.js';

/**
 * Récupérer tous les arrêts de la table voyage_tracking_stops
 */
export const getStops = async (req, res) => {
    try {
        const query = `
            SELECT 
                camion, 
                beginstoptime, 
                endstoptime, 
                stopduration, 
                latitude as lat, 
                longitude as lng, 
                systemgps, 
                address,
                created_date
            FROM voyage_tracking_stops 
            ORDER BY beginstoptime DESC
        `;
        const result = await pool.query(query);

        // Formater les données pour le frontend si nécessaire
        const formattedData = result.rows.map((row, index) => ({
            id: index + 1,
            camion: row.camion || 'Inconnu',
            date: row.beginstoptime ? new Date(row.beginstoptime).toISOString().replace('T', ' ').substring(0, 16) : '-',
            duree: row.stopduration ? `${row.stopduration.hours || 0}h ${row.stopduration.minutes || 0}min` : '-',
            poiGps: row.address || '-',
            poiPlanning: '-',
            nVoyage: '-', // Non présent dans la table
            status: row.systemgps ? 'conforme' : 'non_conforme',
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            action: row.systemgps ? null : 'ajouter_poi'
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error('Error getStops:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des arrêts' });
    }
};
