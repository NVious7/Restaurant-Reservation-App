function hasValidProperites(...properties) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    next();
  };
}

module.exports = hasValidProperites;
