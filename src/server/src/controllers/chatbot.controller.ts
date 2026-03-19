import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { ChatbotService } from '@services/chatbot.service';

export class ChatbotController {
  public chatbotService = new ChatbotService();

  public chat = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const message: string = req.body.message;
      const userRole = req.user.role;
      const userId = req.user.id;

      const reply = await this.chatbotService.chat(message, userRole, userId);

      res.status(200).json({ data: { reply }, message: 'success' });
    } catch (error) {
      next(error);
    }
  };
}
