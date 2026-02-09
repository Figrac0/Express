exports.get404Page = function (req, res, next) {
  res.status(404).render('404', {
    pageTitle: "Page Not Found",
    path: req.url
  });
};