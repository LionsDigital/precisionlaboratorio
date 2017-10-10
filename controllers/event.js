const cloudinary = require('cloudinary');
const moment = require('moment');

const Event = require('../models/Event');

const preTitle = 'Precision - ';

cloudinary.config({
  cloud_name: 'dgv0w6dst',
  api_key: '543319621828891',
  api_secret: 'CFL7R37APT6tfNNqhkg6W96Z7-o',
  resource_type: 'auto',
});

exports.getEvents = (req, res) => {
  Event.find({}).exec((err, events) => {
    if(err) {
      req.flash('error', { msg: 'Não foi possível encontrar eventos.'});
      return res.redirect('back');
    }
    res.render('viewsdash/pages/events', {
      title: preTitle+ 'Eventos',
      pageName: 'events',
      user: req.user,
      events
    });
  });
}

exports.getNewEvent = (req, res) => {
  res.render('viewsdash/pages/event', {
    title: preTitle+ 'Eventos',
    pageName: 'events',
    user: req.user,
    event: new Event(),
    newEvent: true,
  });
}

exports.getEvent = (req, res) => {
  Event.findById(req.params.id, (err, findEvent) => {
    if (err) {
      req.flash('errors', { msg: 'Não foi possivel carregar o evento.' });
      return res.redirect('/events');
    }

    res.render('viewsdash/pages/event', {
      title: preTitle+ 'Eventos',
      pageName: 'events',
      user: req.user,
      event: findEvent,
      newEvent: false,
    });
  });
}

exports.postNewEvent = (req, res) => {

  var newEvent = new Event({
    name: req.body.name,
    startDate: new Date(moment(req.body.startDate, 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm")),
    endDate: new Date(moment(req.body.endDate, 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm")),
    description: req.body.description
  });

  newEvent.save((err, saveEvent) => {
    if (err) {
      req.flash('errors', { msg: 'Um erro aconteceu no cadastro do evento.' });
      return res.redirect('/events');
    }
    if (req.files.lenght > 0) {
      cloudinary.v2.uploader.upload(req.files.fileUpdate.path,
        {
          resource_type: "auto"
        },
        function(err, returnFileUpdate) {
          if (err) {
            req.flash('errors', { msg: 'Um erro aconteceu no upload de arquivo.' });
            return res.redirect('/events');
          }

          saveEvent.url_image = returnFileUpdate.secure_url;

          saveEvent.save((err, saveEvent) => {
            if(err) {
              req.flash('error', { msg: 'Não foi possivel salvar o evento' });
              return res.redirect('/event');
            }
            req.flash('success', { msg: 'Novo evento criado' });
            return res.redirect('/events');
          })
        }
      );
    } else {
      req.flash('success', { msg: 'Evento cadastrado com sucesso!' });
      return res.redirect('/events');
    }
  });
}

exports.postEvent = (req, res) => {
  Event.findById(req.params.id).exec((err, findEvent) => {
    if (err) {
      req.flash('error', { msg: 'Não foi possivel salvar o evento' });
      return res.redirect('/event');
    }

    findEvent.name = req.body.name;
    findEvent.startDate = new Date(moment(req.body.startDate, 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm"));
    findEvent.endDate = new Date(moment(req.body.endDate, 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm"));
    findEvent.description = req.body.description;

    findEvent.save((err, saveEvent) => {
      if (err) {
        req.flash('error', { msg: 'Não foi possivel salvar o evento' });
        return res.redirect('back');
      }
      return res.redirect('/events');
    });
  });
}
