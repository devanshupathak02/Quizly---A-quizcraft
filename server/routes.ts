import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from 'express-session';
import { 
  insertQuizSchema, 
  insertQuizAttemptSchema, 
  insertUserSchema,
  QuizAnswerSchema
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import MemoryStore from 'memorystore';

// For production, you would use a real session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "quiz-app-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Set user in session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      res.json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Quiz routes
  app.post("/api/quizzes", requireAuth, async (req, res) => {
    try {
      // Process the questions to ensure IDs
      const processedBody = {
        ...req.body,
        createdBy: req.session.userId,
        questions: (req.body.questions || []).map((q: any) => ({
          ...q,
          id: q.id || nanoid(),
          options: (q.options || []).map((o: any) => ({
            ...o,
            id: o.id || nanoid()
          }))
        }))
      };
      
      const quizData = insertQuizSchema.parse(processedBody);
      const quiz = await storage.createQuiz(quizData);
      
      res.status(201).json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getAllQuizzes();
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/me", requireAuth, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByUser(req.session.userId!);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.put("/api/quizzes/:id", requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (quiz.createdBy !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this quiz" });
      }
      
      // Process the questions to ensure IDs
      const processedBody = {
        ...req.body,
        questions: (req.body.questions || []).map((q: any) => ({
          ...q,
          id: q.id || nanoid(),
          options: (q.options || []).map((o: any) => ({
            ...o,
            id: o.id || nanoid()
          }))
        }))
      };
      
      const quizData = insertQuizSchema.partial().parse(processedBody);
      const updatedQuiz = await storage.updateQuiz(quizId, quizData);
      
      res.json(updatedQuiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  app.delete("/api/quizzes/:id", requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (quiz.createdBy !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this quiz" });
      }
      
      await storage.deleteQuiz(quizId);
      
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Quiz attempt routes
  app.post("/api/quizzes/:id/attempt", requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Validate answers array
      const answers = z.array(QuizAnswerSchema).parse(req.body.answers);
      
      // Calculate score
      const totalQuestions = quiz.questions.length;
      const correctAnswers = answers.filter(answer => answer.correct).length;
      const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = scorePercentage >= quiz.passingScore;
      
      const attemptData = {
        quizId,
        userId: req.session.userId!,
        score: scorePercentage,
        passed,
        answers
      };
      
      const attempt = await storage.createQuizAttempt(attemptData);
      
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to record quiz attempt" });
    }
  });

  app.get("/api/quiz-attempts/me", requireAuth, async (req, res) => {
    try {
      const attempts = await storage.getQuizAttemptsByUser(req.session.userId!);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  app.get("/api/quizzes/:id/attempts", requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Only allow the quiz creator to see all attempts
      if (quiz.createdBy !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view all attempts for this quiz" });
      }
      
      const attempts = await storage.getQuizAttemptsByQuiz(quizId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
