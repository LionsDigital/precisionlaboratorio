const cloudinary = require('./cloudinary');

const Gallery = require('../models/Gallery');

const preTitle = 'Precision - ';

exports.getGalleries = (req, res) => {
  Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
    if(err) {
      req.flash('errors', { msg: 'Erro ao buscar galeria' });
      return res.redirect('back');
    }
    res.render('viewsdash/pages/gallery', {
      title: preTitle+ 'Galerias',
      pageName: 'gallery',
      gallery,
    });

  });
};

exports.getNewMidia = (req, res) => {
  res.render('viewsdash/pages/midia', {
    title: preTitle + 'Arquivo de midia',
    pageName: 'gallery',
    newMidia: true,
    config: req.config,
  });
}

exports.getMidia = (req, res) => {
  Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
    if (err) {
      req.flash('errors', { msg: 'Não encontramos a galeria.' })
      return res.redirect('/midia');
    }
    if (!gallery) {
      req.flash('errors', { msg: 'Não encontramos a galeria.' })
      return res.redirect('/midia');
    }

    var file = gallery.files.filter((file) => {
      if (file._id == req.params.id) {
        return file;
      }
    });

    res.render('viewsdash/pages/midia', {
      title: preTitle + 'Arquivo de midia',
      pageName: 'gallery',
      newMidia: false,
      config: req.config,
      midia: file[0],
    });
  });
}

exports.postNewMidia = (req, res) => {

  cloudinary.v2.uploader.upload(req.files.fileUpdate.path,
    {
      resource_type: "auto"
    },
    function(err, returnFileUpdate) {
      if (err) {
        req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' })
        return res.redirect('/midia');
      }
      Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
        if (err) {
          req.flash('errors', { msg: 'Não encontramos a galeria.' })
          return res.redirect('/midia');
        }
        if (!gallery) {
          req.flash('errors', { msg: 'Não encontramos a galeria.' })
          return res.redirect('/midia');
        }

        gallery.files.push({
          url: returnFileUpdate.secure_url,
          type: returnFileUpdate.resource_type,
          name: req.body.name,
          format: returnFileUpdate.format,
          description: req.body.description,
          public_id: returnFileUpdate.public_id,
          _role: req.body.role,
        });

        gallery.save((err, saveGallery) => {
          req.flash('success', { msg: 'Novo arquivo adicionado a galeria.' })
          return res.redirect('/galleries');
        })
      });
    }
  );


}

exports.postMidia = (req, res) => {
  if (req.files.fileUpdate.originalFilename != '') {
    cloudinary.v2.uploader.upload(req.files.fileUpdate.path,
      {
        resource_type: "auto"
      },
      function(err, returnFileUpdate) {
        if (err) {
          req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' })
          return res.redirect('/midia');
        }
        Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
          if (err) {
            req.flash('errors', { msg: 'Não encontramos a galeria.' })
            return res.redirect('/midia');
          }
          if (!gallery) {
            req.flash('errors', { msg: 'Não encontramos a galeria.' })
            return res.redirect('/midia');
          }

          gallery.files = gallery.files.map((file) => {
            if (file._id == req.params.id) {
              file.url = returnFileUpdate.secure_url;
              file.type = returnFileUpdate.resource_type;
              file.name = req.body.name;
              file.format = returnFileUpdate.format;
              file.description = req.body.description;
              file.public_id = returnFileUpdate.public_id;
              file._role = req.body.role;
            }
            return file;
          });

          gallery.save((err, saveGallery) => {
            req.flash('success', { msg: 'Novo arquivo adicionado a galeria.' })
            return res.redirect('/galleries');
          });
        });
      }
    );
  } else {
    Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
      if (err) {
        req.flash('errors', { msg: 'Não encontramos a galeria.' })
        return res.redirect('/midia');
      }
      if (!gallery) {
        req.flash('errors', { msg: 'Não encontramos a galeria.' })
        return res.redirect('/midia');
      }

      gallery.files = gallery.files.map((file) => {
        if (file._id == req.params.id) {
          file.name = req.body.name;
          file.description = req.body.description;
          file._role = req.body.role;
        }
        return file;
      });

      gallery.save((err, saveGallery) => {
        req.flash('success', { msg: 'Novo arquivo adicionado a galeria.' })
        return res.redirect('/galleries');
      });
    });
  }

}

exports.deleteMidia = (req, res) => {
  Gallery.findOne({ name: 'Principal'}).populate('files._role').exec((err, gallery) => {
    if (err) {
      req.flash('errors', { msg: 'Não encontramos a galeria.' })
      return res.redirect('/midia');
    }
    if (!gallery) {
      req.flash('errors', { msg: 'Não encontramos a galeria.' })
      return res.redirect('/midia');
    }

    gallery.files = gallery.files.filter((file) => {
      if (file._id != req.params.id) {
        return file;
      }
    });

    gallery.save((err, saveGallery) => {
      req.flash('success', { msg: 'Novo arquivo adicionado a galeria.' })
      return res.redirect('/galleries');
    })
  });
}
