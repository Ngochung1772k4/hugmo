import type { Q54Idea, Q54Requirement } from './types';

function sortIdeas(ideas: Q54Idea[]) { return [...ideas].sort((left, right) => (right.reuse_score || 0) - (left.reuse_score || 0)); }

export function getIdeasForRequirement(ideas: Q54Idea[], topicId: string, requirement: Q54Requirement): Q54Idea[] {
  const matchesType = (idea: Q54Idea) => idea.requirement_types?.includes(requirement.requirement_type) || idea.requirement_id === requirement.id;
  const matchesGroup = (idea: Q54Idea) => idea.function_group === requirement.function_group;
  const isExactTopic = (idea: Q54Idea) => (idea.scope || 'TOPIC') === 'TOPIC' && idea.topic_id === topicId;
  const isGlobal = (idea: Q54Idea) => idea.scope === 'GLOBAL';
  const levels = [
    ideas.filter((idea) => isExactTopic(idea) && matchesType(idea)),
    ideas.filter((idea) => isExactTopic(idea) && matchesGroup(idea)),
    ideas.filter((idea) => isGlobal(idea) && matchesType(idea)),
    ideas.filter((idea) => isGlobal(idea) && matchesGroup(idea)),
  ];
  return sortIdeas(levels.find((level) => level.length > 0) || []);
}
