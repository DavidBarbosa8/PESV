const { verifyToken } = require('../config/jwt.config');
const db = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verificar el token
        const decoded = verifyToken(token);
        
        // Verificar si el token está en la tabla de sesiones
        const [sessions] = await db.query(
            'SELECT * FROM sesiones WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (!sessions.length) {
            return res.status(401).json({ error: 'Token expired or invalid' });
        }
        
        // Agregar el usuario decodificado al request
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        next();
    };
};

const checkPermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            const [permissions] = await db.query(`
                SELECT 1 FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                JOIN rol_permisos rp ON r.id = rp.rol_id
                JOIN permisos p ON rp.permiso_id = p.id
                WHERE u.id = ? AND p.codigo = ?
            `, [req.user.id, permissionCode]);

            if (!permissions.length) {
                return res.status(403).json({ error: 'Permission denied' });
            }
            next();
        } catch (error) {
            res.status(500).json({ error: 'Error checking permissions' });
        }
    };
};

module.exports = {
    authenticate,
    checkRole,
    checkPermission
}; 