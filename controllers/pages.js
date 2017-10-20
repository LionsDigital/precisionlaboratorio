const cloudinary = require('cloudinary');

const moment = require('moment');
const Event = require('../models/Event');
const Page = require('../models/Page');

/**
 * GET /
 * Páginas institucionais
 */

exports.laboratorio = (req, res) => {
  res.render('pages/laboratorio', {
    title: 'Laboratório'
  });
};

exports.agenda = (req, res) => {
  Event.find({ $and: [
      { startDate: { $gt: Date.now() } },
      { featured: true }
    ]
  }).sort({startDate: 1}).exec((err, findEvents) => {
    res.render('pages/agenda', {
      title: 'Agenda',
      destaque: findEvents[0] || [],
    });
  });

};

exports.portifolio = (req, res) => {
  res.render('pages/portifolio', {
    title: 'Portifólio'
  });
};

exports.error404 = (req, res) => {
  res.render('pages/404', {
    title: 'Precision - Página não encontrada'
  });
}


/**
 * Edit Pages /
 * Páginas institucionais dashboard
 */

function createHome() {
  return new Promise((resolve, reject) => {
    const home = new Page({
      name: 'Home',
      customFields: {
        titleMesage: 'Laboratório de Excelência.',
        mesage: '“Perfeição depende dos conhecimentos adquiridos e da experiênciaaplicada entre os técnicos e cirurgiões dentistas comprometidos com o resultado.”',
      },
      seo: {
        title: 'Precision - Laboratório de excelência',
        descripton: 'Perfeição depende dos conhecimentos adquiridos e da experiênciaaplicada entre os técnicos e cirurgiões dentistas comprometidos com o resultado.',
        urlImage: '/images/capa-preview.png',
      }
    });

    home.save((err, pageInfo) => {
      return resolve(pageInfo);
    });
  });

}


exports.index = (req, res) => {
  Page.findOne({ name: 'Home' }).exec((err, pageInfo) => {
    if (err) {
      return res.redirect('/404');
    }
    res.render('pages/home', {
      title: 'Precision - Laboratório de execelência',
      pageInfo
    });
  });
};

exports.postHome = (req, res) => {
  Page.findOne({ name: 'Home' }).exec((err, pageInfo) => {
    if (err) {
      return res.redirect('/dashboard/pages');
    }

    pageInfo.customFields.titleMesage = req.body.titleMesage;
    pageInfo.customFields.mesage = req.body.mesage;
    pageInfo.seo.title = req.body.seoTitle;
    pageInfo.seo.descripton = req.body.seoDescription;

    pageInfo.save((err, pageSave) => {
      if (err) {
        req.flash('errors', { msg: 'Erro ao salvar Home' });
        return res.redirect('/page/home');
      }

      if (req.files.seoImage.originalFilename != '') {
        cloudinary.v2.uploader.upload(req.files.seoImage.path,
          {
            resource_type: "auto"
          },
          function(err, returnFileUpdate) {
            if (err) {
              req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' });
              return res.redirect('/events');
            }

            pageSave.seo.urlImage = returnFileUpdate.secure_url;

            pageSave.save((err, pageSave) => {
              if(err) {
                req.flash('error', { msg: 'Não foi possivel salvar a página' });
                return res.redirect('/page/home');
              }
              req.flash('success', { msg: 'Página alterada com sucesso!' });
              return res.redirect('/pages');
            })
          });
      } else {
        req.flash('success', { msg: 'Página alterada com sucesso!' });
        return res.redirect('/pages');
      }
    });
  });
}

exports.editHome = (req, res) => {
  Page.findOne({ name: 'Home' }).exec((err, pageInfo) => {
    if (err) {
      return res.redirect('/dashboard/pages');
    }

    if (!pageInfo) {
      createHome().then((pageCreated) => {
        res.render('viewsdash/pages/editPages/home', {
          title: 'Editar Página Inicial',
          user: req.user,
          pageInfo: pageCreated,
        });
      });
    }

    else {
      res.render('viewsdash/pages/editPages/home', {
        title: 'Editar Página Inicial',
        user: req.user,
        pageInfo,
      });
    }
  });
}

exports.editLaboratorio = (req, res) => {
  res.render('viewsdash/pages/editPages/laboratorio', {
    title: 'Editar Laboratóio',
    user: req.user,
  })
}

exports.postLaboratorio = (req, res) => {
  res.render('viewsdash/pages/editPages/laboratorio', {
    title: 'Editar Laboratóio',
    user: req.user,
  })
}

exports.editPortfolio = (req, res) => {
  res.render('viewsdash/pages/editPages/portfolio', {
    title: 'Editar Portfolio',
    user: req.user,
  })
}

exports.postPortfolio = (req, res) => {
  res.render('viewsdash/pages/editPages/portfolio', {
    title: 'Editar Portfolio',
    user: req.user,
  })
}


function createProdutos() {
  return new Promise((resolve, reject) => {
    const produtos = new Page({
      name: 'Produtos',
      customFields: {
        produtos: [
          {
            name: 'Enceramento diagnóstico por elemento',
            descripton: 'Projeto estético e funcional que será utilizado para o planejamento do plano de tratamento, posicionamento de futuros implantes e trocas de pinos (núcleos). A partir desse enceramento diagnóstico podemos obter as muralhas de silicone que serão utilizadas na confecção do mock up e servirão também como guia para preparos.  ',
            url_image: '',
          },

          {
            name: 'Protocolo cerâmico dento gengival completo (ZR + Emax + Aplicação de gengiva)',
            descripton: 'Prótese total parafusada que tem como objetivo reconstruir dentes e gengiva.',
            url_image: '',
          },
          {
            name: 'Coping ZR',
            descripton: 'Infraestrutura em zircônia opaca, aplicada internamente nas coroas, indicadas para dentes com remanescente dental em metal ou escurecidos funcionando como um bloqueio desse escurecimento.',
            url_image: '',
          },
          {
            name: 'Coroa Total',
            descripton: 'Elementos cerâmicos que revestem os dentes por completo, indicados para casos com alto grau de destruição.',
            url_image: '',
          },

          {
            name: 'Lente de contato Emax',
            descripton: 'Como uma “película” sobre o dente, as lentes de contato são extremamente finas (entre 0,3 e 0,6mm) e revestem a face vestibular dos dentes, devolvendo a forma e o aspecto natural e com melhor resultado estético, utilizando meios menos invasivos, porém, pela alta translucidez não é indicada para alteração de cor.',
            url_image: '',
          },

          {
            name: 'Faceta laminada Emax',
            descripton: 'Laminado cerâmico. As facetas revestem a face vestibular em dentes manchados, quebrados, com deformidades ou desgastados, devolvendo a forma, a cor e o aspecto natural de um dente saudável e com melhor resultado estético.',
            url_image: '',
          },

          {
            name: 'Inlay/Onlay Emax',
            descripton: 'Elementos utilizados na reconstrução parcial e de uma forma estética dos dentes posteriores, que sofreram algum tipo de dano por desgaste natural, trauma, cárie que precisam de reconstrução estética e funcional. ',
            url_image: '',
          },

          {
            name: 'Coroa sobre implante parafusada ou cimentada (ZR + Emax)',
            descripton: 'Fabricadas em cerâmica com reforço interno em Zircônia e parafusadas sobre implantes devolvendo assim elementos dentais perdidos.',
            url_image: '',
          },

          {
            name: 'Coroa ZR monolítica maquiada',
            descripton: 'Coroa total elaborada em zircônia translucida, com personalização de cor por meio de maquiagem, indicada para dentes posteriores que têm alto grau de destruição.',
            url_image: '',
          },
        ]
      },
      seo: {
        title: 'Precision - Laboratório de excelência',
        descripton: 'Perfeição depende dos conhecimentos adquiridos e da experiênciaaplicada entre os técnicos e cirurgiões dentistas comprometidos com o resultado.',
        urlImage: '/images/capa-preview.png',
      }
    });

    produtos.save((err, pageInfo) => {
      return resolve(pageInfo);
    });
  });

}


exports.editProdutos = (req, res) => {

  Page.findOne({ name: 'Produtos' }).exec((err, pageInfo) => {
    if (err) {
      return res.redirect('/dashboard/pages');
    }

    if (!pageInfo) {
      createProdutos().then((pageCreated) => {
        res.render('viewsdash/pages/editPages/produtos', {
          title: 'Editar Produtos e Serviços',
          user: req.user,
          pageInfo: pageCreated,
        });
      });
    }

    else {
      res.render('viewsdash/pages/editPages/produtos', {
        title: 'Editar Produtos e Serviços',
        user: req.user,
        pageInfo,
      });
    }
  });

}

exports.postProdutos = (req, res) => {
  Page.findOne({ name: 'Produtos' }).exec((err, pageInfo) => {
    if (err) {
      req.flash('errors', { msg: 'Erro ao salvar produto' });
      return res.redirect('/page/produtos');
    }
    pageInfo.seo.title = req.body.seoTitle;
    pageInfo.seo.descripton = req.body.seoDescription;

    pageInfo.save((err, pageSave) => {
      if (err) {
        req.flash('errors', { msg: 'Erro ao salvar Home' });
        return res.redirect('/page/home');
      }

      if (req.files.seoImage.originalFilename != '') {
        cloudinary.v2.uploader.upload(req.files.seoImage.path,
          {
            resource_type: "auto"
          },
          function(err, returnFileUpdate) {
            if (err) {
              req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' });
              return res.redirect('/events');
            }

            pageSave.seo.urlImage = returnFileUpdate.secure_url;

            pageSave.save((err, pageSave) => {
              if(err) {
                req.flash('error', { msg: 'Não foi possivel salvar a página' });
                return res.redirect('/page/produtos');
              }
              req.flash('success', { msg: 'Página alterada com sucesso!' });
              return res.redirect('/pages');
            })
          });
      } else {
        req.flash('success', { msg: 'Página alterada com sucesso!' });
        return res.redirect('/pages');
      }
    });
  });
}


function saveProduto(pageInfo, req, res) {
  pageInfo.markModified('customFields.produtos');
  pageInfo.save((err) => {
    if (err) {
      req.flash('errors', { msg: 'Erro ao salvar produto' });
      return res.redirect('/page/produtos');
    } else {
      req.flash('success', { msg: 'Produto atualizado' });
      return res.redirect('/page/produtos');
    }
  });
}

exports.postProduto = (req, res) => {
  Page.findOne({ name: 'Produtos' }).exec((err, pageInfo) => {
    if (err) {
      req.flash('errors', { msg: 'Erro ao salvar produto' });
      return res.redirect('/page/produtos');
    }

    if (req.files.fileUpdate.originalFilename != '') {
      cloudinary.v2.uploader.upload(req.files.fileUpdate.path,
        {
          resource_type: "auto"
        },
        function(err, returnFileUpdate) {
          if (err) {
            req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' })
            return res.redirect('/page/produtos');
          }

          pageInfo.customFields.produtos[req.params.id] = {
            name: req.body.name,
            descripton: req.body.descripton,
            url_image: returnFileUpdate.secure_url,
          }
        }
      );
    } else {

      pageInfo.customFields.produtos[req.params.id] = {
        name: req.body.name,
        descripton: req.body.descripton,
        url_image: pageInfo.customFields.produtos[req.params.id].url_image
      }
      saveProduto(pageInfo, req, res);
    }
  });
}

exports.produtos = (req, res) => {
  Page.findOne({ name: 'Produtos' }).exec((err, pageInfo) => {
    if (err) {
      return res.redirect('/404');
    }
    else {
      res.render('pages/produtos', {
        title: 'Produtos e Serviços',
        produtos: pageInfo.customFields.produtos
      });
    }
  });
};
