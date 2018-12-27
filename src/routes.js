// Pages
import HomeView from './pages/home';
import AboutView from './pages/about';
import FirebaseView from './pages/firebase-example';
import MapboxView from './pages/mapbox';
import KotenView from './pages/koten';
import KotenLijstView from './pages/kotenlijst';
import CreateView from './pages/create';
import adminReg from './pages/adminreg';
import userReg from './pages/userreg';
import adminSignin from './pages/adminsignin';
import userSignin from './pages/usersignin';
import adminlogin from './pages/adminlogin';
import userlogin from './pages/userlogin';
import adminHomeView from './pages/adminhome';
import favoriteView from './pages/favorite';
import messageView from './pages/messages';


export default [
  { path: '/', view: HomeView },
  { path: '/about', view: AboutView },
  { path: '/firebase', view: FirebaseView },
  { path: '/mapbox', view: MapboxView },
  { path: '/koten', view: KotenView },
  { path: '/kotenlijst', view: KotenLijstView },
  { path: '/create', view: CreateView },
  { path: '/adminreg', view: adminReg },
  { path: '/userreg', view: userReg },
  { path: '/adminhome', view: adminHomeView },
  { path: '/adminsignin', view: adminSignin },
  { path: '/usersignin', view: userSignin },
  { path: '/adminlogin', view: adminlogin },
  { path: '/userlogin', view: userlogin },
  { path: '/favorite', view: favoriteView },
  { path: '/messages', view: messageView },
  { path: '/mapbox', view: MapboxView },
];
