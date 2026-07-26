import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ProjectController } from '../controllers/ProjectController';
import { AssetController } from '../controllers/AssetController';
import { GenerativeAIController } from '../controllers/GenerativeAIController';
import { auth }              from '../middlewares/auth';
import { AdminController }   from '../controllers/AdminController';
import { authUser } from "../middlewares/authUser";

const router = Router();

// Inicializar controladores
const authCtrl = container.resolve(AuthController);
const userCtrl = container.resolve(UserController);
const projectCtrl = container.resolve(ProjectController);
const assetCtrl   = container.resolve(AssetController);
const generativeAICtrl = container.resolve(GenerativeAIController);
const adminCtrl    = container.resolve(AdminController);

// Rutas de autenticación
const authRouter = Router();
authRouter.post('/register', authCtrl.RegisterUser.bind(authCtrl));
authRouter.post('/login', authCtrl.Login.bind(authCtrl));
authRouter.post('/reset-password', authCtrl.ResetPassword.bind(authCtrl));
authRouter.post('/logout', authCtrl.Logout.bind(authCtrl));
authRouter.post('/verify-email', authCtrl.VerifyEmail.bind(authCtrl));

// Rutas publicas
router.use('/auth', authRouter);
router.use('/generativeai', generativeAICtrl.router);
router.use('/asset',  assetCtrl.router);

// Rutas protegidas
router.use('/users', authUser, userCtrl.router);
router.use('/projects', authUser, projectCtrl.router);
router.use('/admin', authUser, adminCtrl.router);

export default router;
