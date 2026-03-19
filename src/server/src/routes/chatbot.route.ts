import { Router } from 'express';
import { ChatbotController } from '@controllers/chatbot.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';

export class ChatbotRoute implements Routes {
  public path = '/chatbot';
  public router = Router();
  public controller = new ChatbotController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/chat`, AuthMiddleware, this.controller.chat);
  }
}
