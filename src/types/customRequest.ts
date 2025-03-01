import { Request } from 'express';
import { App } from '../models/appModel';

export interface AuthenticatedRequest extends Request {
  appData?: App; 
}