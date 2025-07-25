import { CreateTopicRequest, UpdateTopicRequest, CreateSubtopicRequest, UpdateSubtopicRequest, AddRepsRequest, UpdateGlobalGoalRequest } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateCreateTopic = (data: any): CreateTopicRequest => {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new ValidationError('Title is required and must be a non-empty string');
  }

  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    throw new ValidationError('Category is required and must be a non-empty string');
  }

  if (typeof data.moneyPer5Reps !== 'number' || data.moneyPer5Reps < 0) {
    throw new ValidationError('moneyPer5Reps must be a positive number');
  }

  return {
    title: data.title.trim(),
    category: data.category.trim(),
    notes: data.notes || '',
    urls: Array.isArray(data.urls) ? data.urls : [],
    moneyPer5Reps: data.moneyPer5Reps,
    isMoneyPer5RepsLocked: Boolean(data.isMoneyPer5RepsLocked)
  };
};

export const validateUpdateTopic = (data: any): UpdateTopicRequest => {
  const updates: UpdateTopicRequest = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new ValidationError('Title must be a non-empty string');
    }
    updates.title = data.title.trim();
  }

  if (data.category !== undefined) {
    if (typeof data.category !== 'string' || data.category.trim().length === 0) {
      throw new ValidationError('Category must be a non-empty string');
    }
    updates.category = data.category.trim();
  }

  if (data.notes !== undefined) {
    updates.notes = data.notes || '';
  }

  if (data.urls !== undefined) {
    updates.urls = Array.isArray(data.urls) ? data.urls : [];
  }

  if (data.moneyPer5Reps !== undefined) {
    if (typeof data.moneyPer5Reps !== 'number' || data.moneyPer5Reps < 0) {
      throw new ValidationError('moneyPer5Reps must be a positive number');
    }
    updates.moneyPer5Reps = data.moneyPer5Reps;
  }

  if (data.isMoneyPer5RepsLocked !== undefined) {
    updates.isMoneyPer5RepsLocked = Boolean(data.isMoneyPer5RepsLocked);
  }

  return updates;
};

export const validateCreateSubtopic = (data: any): CreateSubtopicRequest => {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new ValidationError('Title is required and must be a non-empty string');
  }

  if (typeof data.goalAmount !== 'number' || data.goalAmount <= 0) {
    throw new ValidationError('goalAmount must be a positive number');
  }

  // Ensure goalAmount is multiple of 1000
  if (data.goalAmount % 1000 !== 0) {
    throw new ValidationError('goalAmount must be a multiple of 1000');
  }

  return {
    title: data.title.trim(),
    goalAmount: data.goalAmount,
    notes: data.notes || '',
    urls: Array.isArray(data.urls) ? data.urls : []
  };
};

export const validateUpdateSubtopic = (data: any): UpdateSubtopicRequest => {
  const updates: UpdateSubtopicRequest = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new ValidationError('Title must be a non-empty string');
    }
    updates.title = data.title.trim();
  }

  if (data.notes !== undefined) {
    updates.notes = data.notes || '';
  }

  if (data.urls !== undefined) {
    updates.urls = Array.isArray(data.urls) ? data.urls : [];
  }

  if (data.goalAmount !== undefined) {
    if (typeof data.goalAmount !== 'number' || data.goalAmount <= 0) {
      throw new ValidationError('goalAmount must be a positive number');
    }
    if (data.goalAmount % 1000 !== 0) {
      throw new ValidationError('goalAmount must be a multiple of 1000');
    }
    updates.goalAmount = data.goalAmount;
  }

  return updates;
};

export const validateAddReps = (data: any): AddRepsRequest => {
  if (typeof data.reps !== 'number') {
    throw new ValidationError('reps must be a number');
  }

  return {
    reps: data.reps
  };
};

export const validateUpdateGlobalGoal = (data: any): UpdateGlobalGoalRequest => {
  if (typeof data.globalGoal !== 'number' || data.globalGoal <= 0) {
    throw new ValidationError('globalGoal must be a positive number');
  }

  return {
    globalGoal: data.globalGoal
  };
};

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};