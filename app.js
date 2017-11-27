/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const pagesController = require('./controllers/pages');
const dashboardController = require('./controllers/dashboard');
const configController = require('./controllers/config');
const galleryController = require('./controllers/gallery');
const eventController = require('./controllers/event');
const orderController = require('./controllers/order')

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());

app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/midia' || req.path === '/event') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

// middleware busca configurações do sistema
const Config = require('./models/Config');
app.use((req, res, next) => {
  Config.findOne({}).populate('_roles.role').exec((err, config) => {
    if (config) {
      req.config = config;
    }
    next();
  });
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', pagesController.index);
app.get('/laboratorio', pagesController.laboratorio);
app.get('/produtos', pagesController.produtos);
app.get('/agenda', pagesController.agenda);
app.get('/portfolio', pagesController.portfolio);

app.get('/importMaterials', configController.populateMaterials);


app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
//app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

/**
 * Área restrita para Administradores
 */
app.get('/admin/configurations', passportConfig.isAdminUser, userController.adminConfig);


app.get('/dashboard/users', passportConfig.isAdminUser, dashboardController.getUsers);
app.get('/dashboard/config', passportConfig.isAdminUser, dashboardController.getConfig);

app.get('/nextevents', eventController.getNextEvents);

app.get('/events', passportConfig.isAdminUser, eventController.getEvents);
app.get('/event', [passportConfig.isAdminUser, multipartMiddleware], eventController.getNewEvent);
app.get('/event/:id', [passportConfig.isAdminUser, multipartMiddleware], eventController.getEvent);
app.post('/event', [passportConfig.isAdminUser, multipartMiddleware], eventController.postNewEvent);
app.post('/event/:id', [passportConfig.isAdminUser, multipartMiddleware], eventController.postEvent);
app.get('/event/delete/:id', [passportConfig.isAdminUser, multipartMiddleware], eventController.deleteEvent);



app.get('/user', passportConfig.isAdminUser, userController.getNewUser);
app.post('/user', passportConfig.isAdminUser, userController.postNewUser);
app.get('/user/:id', passportConfig.isAdminUser, userController.getUser);
app.get('/user/delete/:id', passportConfig.isAdminUser, userController.deleteUser);

app.get('/role', passportConfig.isAdminUser, configController.getNewRole);
app.get('/role/:id', passportConfig.isAdminUser, configController.getRole);
app.post('/role', passportConfig.isAdminUser, configController.postNewRole);
app.post('/role/:id', passportConfig.isAdminUser, configController.postRole);

app.get('/orders', passportConfig.isAuthenticated, orderController.getOrders);
app.get('/order', passportConfig.isAuthenticated, orderController.getNewOrder);
app.get('/order/:id', passportConfig.isAuthenticated, orderController.getOrder);
app.post('/order', [passportConfig.isAuthenticated, multipartMiddleware], orderController.postNewOrder);
app.post('/order/:id', [passportConfig.isAuthenticated, multipartMiddleware], orderController.postOrder);

app.get('/galleries', passportConfig.isAuthenticated, galleryController.getGalleries);
app.get('/midia', [passportConfig.isAdminUser, multipartMiddleware], galleryController.getNewMidia);
app.get('/midia/:id', [passportConfig.isAdminUser, multipartMiddleware], galleryController.getMidia);
app.post('/midia', [passportConfig.isAdminUser, multipartMiddleware], galleryController.postNewMidia);
app.post('/midia/:id', [passportConfig.isAdminUser, multipartMiddleware], galleryController.postMidia);
app.get('/midia/delete/:id', [passportConfig.isAdminUser, multipartMiddleware], galleryController.deleteMidia);

app.get('/pages', passportConfig.isAdminUser, dashboardController.getPages);
app.get('/page/home', passportConfig.isAdminUser, pagesController.editHome);
app.post('/page/home', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postHome);
app.get('/page/laboratorio', passportConfig.isAdminUser, pagesController.editLaboratorio);
app.post('/page/laboratorio', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postLaboratorio);
app.get('/page/portfolio', passportConfig.isAdminUser, pagesController.editPortfolio);
app.post('/page/portfolio', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postPortfolio);
app.get('/page/produtos', passportConfig.isAdminUser, pagesController.editProdutos);
app.post('/page/produtos', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postProdutos);
app.post('/produto/:id', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postProduto);
app.post('/edit/portfolio/midia', [passportConfig.isAdminUser, multipartMiddleware], pagesController.postPortfolioMidia);
app.get('/delete/portfolio/midia/:id', passportConfig.isAdminUser, pagesController.deletePortfolioMidia);

/**
 * Routes isAuthenticated / All Users
 */
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile/:id', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Routes Dashboard
 */
app.get('/dashboard/home', passportConfig.isAuthenticated, dashboardController.getHome);

/**
 * Return Page 404 not found
 */
app.get('*', pagesController.error404);

/**
 * Error Handler.
 */
app.use(errorHandler());


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
