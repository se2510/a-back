declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}

export {}; 