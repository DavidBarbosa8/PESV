const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt.config');
const db = require('../config/database');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const [users] = await db.query(
            'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ?',
            [email]
        );

        if (!users.length) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generar token
        const token = generateToken({
            id: user.id,
            email: user.email,
            rol: user.rol_nombre,
            empresa_id: user.empresa_id
        });

        // Registrar inicio de sesión
        await db.query(
            'INSERT INTO sesiones (usuario_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
            [user.id, token, req.ip, req.headers['user-agent']]
        );

        // Actualizar último acceso
        await db.query(
            'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
            [user.id]
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol_nombre,
                empresa_id: user.empresa_id
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // Invalidar sesión
            await db.query(
                'UPDATE sesiones SET expires_at = NOW() WHERE token = ?',
                [token]
            );
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
            [req.user.id]
        );

        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol_nombre,
            empresa_id: user.empresa_id
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser
}; 