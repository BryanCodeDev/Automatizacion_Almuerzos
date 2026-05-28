const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tiene permiso para realizar esta acción' });
    }
    
    next();
  };
};

module.exports = { authorizeRole };