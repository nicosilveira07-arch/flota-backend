const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    
    if (!req.user || !req.user.rol) {
      return res.status(403).json({
        message: "Usuario sin rol o no autenticado"
      });
    }

    const rolUsuario = req.user.rol.toLowerCase();

    const rolesNormalizados = rolesPermitidos.map(r =>
      r.toLowerCase()
    );

    if (!rolesNormalizados.includes(rolUsuario)) {
      return res.status(403).json({
        message: "No tienes permisos"
      });
    }

    next();
  };
};

module.exports = checkRole;