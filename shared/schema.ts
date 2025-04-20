import { pgTable, text, serial, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Option type for quiz questions
export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false)
});

export type QuizOption = z.infer<typeof QuizOptionSchema>;

// Question type for quizzes
export const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text is required"),
  options: z.array(QuizOptionSchema).min(2, "At least two options are required"),
  explanation: z.string().optional()
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Quiz model
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timeLimit: integer("time_limit").notNull(), // time in seconds per question
  passingScore: integer("passing_score").notNull(), // percentage needed to pass
  createdBy: integer("created_by").notNull(), // user id
  questions: jsonb("questions").notNull(), // array of QuizQuestion objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes)
  .omit({ id: true, createdAt: true })
  .extend({
    questions: z.array(QuizQuestionSchema).min(1, "At least one question is required")
  });

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// QuizAttempt model to store quiz results
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(), // percentage score
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").notNull(), // array of { questionId, answerId, correct }
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts)
  .omit({ id: true, completedAt: true });

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

// Answer type for quiz attempts
export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  correct: z.boolean()
});

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
