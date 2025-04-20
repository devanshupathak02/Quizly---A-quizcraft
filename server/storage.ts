import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  InsertUser, 
  Quiz, 
  InsertQuiz, 
  QuizAttempt, 
  InsertQuizAttempt,
  QuizQuestion,
  QuizOption
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByUser(userId: number): Promise<Quiz[]>;
  getAllQuizzes(): Promise<Quiz[]>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;
  
  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]>;
  getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private quizAttempts: Map<number, QuizAttempt>;
  private userIdCounter: number;
  private quizIdCounter: number;
  private attemptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
    this.userIdCounter = 1;
    this.quizIdCounter = 1;
    this.attemptIdCounter = 1;
    
    // Add a demo user
    this.createUser({
      username: 'demo',
      password: 'password'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Quiz operations
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizIdCounter++;
    const createdAt = new Date();
    
    // Ensure each question and option has an ID
    const questions = insertQuiz.questions.map(q => {
      const questionId = q.id || uuidv4();
      const options = q.options.map(o => ({
        ...o,
        id: o.id || uuidv4()
      }));
      
      return {
        ...q,
        id: questionId,
        options
      };
    });
    
    const quiz: Quiz = { 
      ...insertQuiz, 
      id, 
      createdAt,
      questions: questions as any // TypeScript workaround
    };
    
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByUser(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.createdBy === userId
    );
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async updateQuiz(id: number, quizData: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz: Quiz = { ...quiz, ...quizData };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  // Quiz attempt operations
  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.attemptIdCounter++;
    const completedAt = new Date();
    const attempt: QuizAttempt = { ...insertAttempt, id, completedAt };
    
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(
      (attempt) => attempt.userId === userId
    );
  }

  async getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(
      (attempt) => attempt.quizId === quizId
    );
  }
}

export const storage = new MemStorage();
