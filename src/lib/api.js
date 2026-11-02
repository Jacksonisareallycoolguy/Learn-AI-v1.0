import { supabase } from './supabase.js';

// All progress, grading, XP and unlock rules live in the database (Supabase functions).
// The browser only asks questions and shows the answers.

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }
  return data;
}

export const getCourseMap = () => rpc('get_course_map');
export const getDashboard = () => rpc('get_dashboard');
export const startLesson = (lessonId) => rpc('start_lesson', { p_lesson_id: lessonId });
export const checkAnswer = (questionId, answer) =>
  rpc('check_answer', { p_question_id: questionId, p_answer: answer });
export const submitQuiz = (lessonId, answers) =>
  rpc('submit_quiz', { p_lesson_id: lessonId, p_answers: answers });

export async function getLesson(lessonId) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, title, description, content, xp_reward, pass_score')
    .eq('id', lessonId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!lesson) return null;

  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, question_order, question_text, options')
    .eq('lesson_id', lessonId)
    .order('question_order');
  if (qError) throw new Error(qError.message);
  return { ...lesson, questions: questions ?? [] };
}

export async function getAllBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('slug, name, description, xp_reward')
    .order('id');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getActivityDates(fromDate) {
  const { data, error } = await supabase
    .from('daily_activity')
    .select('activity_date')
    .gte('activity_date', fromDate);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.activity_date);
}

// The streak day rolls over at midnight Pacific time (same as the database).
const APP_TZ = 'America/Los_Angeles';

export function appToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ }).format(new Date());
}

// Returns the 7 dates (YYYY-MM-DD) of the current Monday-to-Sunday week.
export function currentWeek() {
  const today = appToday();
  const [y, m, d] = today.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const mondayOffset = (base.getUTCDay() + 6) % 7;
  const out = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(Date.UTC(y, m - 1, d - mondayOffset + i));
    out.push(day.toISOString().slice(0, 10));
  }
  return out;
}
