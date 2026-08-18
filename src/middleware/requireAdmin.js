// Garde d'authentification admin — partagée par toutes les routes protégées
module.exports = function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Non autorisé' });
};
