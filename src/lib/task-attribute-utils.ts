import { Task } from '../types';

export function buildFlagUpdate(task: Pick<Task, 'flag' | 'blockedComment'>, commentDraft: string) {
  const nextFlag = !task.flag;
  const trimmedComment = commentDraft.trim();

  if (nextFlag) {
    if (!trimmedComment) {
      return { error: 'comment-required' as const };
    }

    return {
      update: {
        flag: true,
        blocked: true,
        blockedComment: trimmedComment,
      },
    };
  }

  return {
    update: {
      flag: false,
      blocked: false,
      blockedComment: trimmedComment || null,
    },
  };
}

export function getCommentButtonActive(task: Pick<Task, 'blockedComment' | 'flag'>): boolean {
  return Boolean(task.flag || task.blockedComment?.trim());
}
