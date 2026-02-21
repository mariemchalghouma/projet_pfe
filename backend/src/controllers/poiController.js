import pool from '../config/database.js';

/**
 * Récupérer tous les POI
 */
export const getPOIs = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM poi ORDER BY nom ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error getPOIs:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des POI' });
    }
};

/**
 * Créer un nouveau POI
 */
export const createPOI = async (req, res) => {
    try {
        const { nom, groupe, type, lat, lng, adresse } = req.body;
        const result = await pool.query(
            'INSERT INTO poi (nom, groupe, type, lat, lng, adresse) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nom, groupe, type || 'Point', lat, lng, adresse]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error createPOI:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création du POI' });
    }
};

/**
 * Mettre à jour un POI existant
 */
export const updatePOI = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, groupe, type, lat, lng, adresse } = req.body;
        const result = await pool.query(
            'UPDATE poi SET nom = $1, groupe = $2, type = $3, lat = $4, lng = $5, adresse = $6 WHERE id = $7 RETURNING *',
            [nom, groupe, type, lat, lng, adresse, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'POI non trouvé' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updatePOI:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du POI' });
    }
};

/**
 * Supprimer un POI
 */
export const deletePOI = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM poi WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'POI non trouvé' });
        }

        res.json({ success: true, message: 'POI supprimé avec succès' });
    } catch (error) {
        console.error('Error deletePOI:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression du POI' });
    }
};
