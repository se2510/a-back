import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ProjectController } from '../controllers/ProjectController';
import { auth } from '../middlewares/auth';

const router = Router();

// Inicializar controladores
const authCtrl = container.resolve(AuthController);
const userCtrl = container.resolve(UserController);
const projectCtrl = container.resolve(ProjectController);

// Rutas de autenticación
const authRouter = Router();
authRouter.post('/register', (req, res) => authCtrl.RegisterUser(req, res));
authRouter.post('/login', (req, res) => authCtrl.Login(req, res));
authRouter.post('/reset-password', (req, res) => authCtrl.ResetPassword(req, res));
authRouter.post('/logout', (req, res) => authCtrl.Logout(req, res));
authRouter.post('/verify-email', (req, res) => authCtrl.VerifyEmail(req, res));

router.use('/auth', authRouter);

// Middleware para manejar rutas protegidas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  auth(req, res, (err?: any) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed'
      });
    }
    next();
  });
};

// Rutas protegidas
router.use('/users', authMiddleware, userCtrl.router);
router.use('/projects', authMiddleware, projectCtrl.router);

export default router;
