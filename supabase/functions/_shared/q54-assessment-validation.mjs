const coverageStatuses = new Set(['COVERED', 'PARTIAL', 'MISSING']);
const issueCategories = new Set(['SPELLING', 'PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'COHESION', 'STYLE']);
const severities = new Set(['LOW', 'MEDIUM', 'HIGH']);
const logicStatuses = new Set(['LOGIC_OK', 'LOGIC_GAP', 'LOGIC_ERROR']);
const sentenceSlots = ['MAIN_IDEA', 'WHY', 'RESULT'];
const sentenceStatuses = new Set(['GOOD', 'WEAK', 'MISSING']);
const repetitionExpressions = ['수 있다', '도움이 되다', '중요하다', '따라서', '그 결과'];

const asText = (value) => typeof value === 'string' ? value.trim() : '';
const asList = (value, maximum = 6) => Array.isArray(value) ? value.map(asText).filter(Boolean).slice(0, maximum) : [];
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function countOccurrences(content, expression) {
  if (!expression) return 0;
  return content.split(expression).length - 1;
}

export function deterministicChecks(content) {
  const sentences = content.split(/(?<=[.!?。！？])\s*|\n+/).map((item) => item.trim()).filter(Boolean);
  const repetitions = repetitionExpressions.map((expression) => ({ expression, count: countOccurrences(content, expression) })).filter((item) => item.count >= 3);
  const connectors = ['따라서', '그 결과', '이를 통해', '또한', '기 때문이다', '으로 이어지다'].filter((expression) => content.includes(expression));
  return { characterCount: content.length, sentenceCount: sentences.length, sentences, repetitions, connectors };
}

export function normalizeEvidence(value, content) {
  if (!isRecord(value)) return null;
  const text = typeof value.text === 'string' ? value.text : '';
  if (!text.trim() || !content.includes(text)) return null;
  const start = Number(value.start); const end = Number(value.end);
  if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && content.slice(start, end) === text) return { start, end, text };
  const first = content.indexOf(text);
  const second = content.indexOf(text, first + text.length);
  return first >= 0 && second === -1 ? { start: first, end: first + text.length, text } : null;
}

function normalizeEvidenceList(value, content) {
  return (Array.isArray(value) ? value : []).map((item) => normalizeEvidence(item, content)).filter(Boolean);
}

function normalizeCoverage(rawCoverage, allowedRequirements, content) {
  if (!Array.isArray(rawCoverage)) return null;
  const allowedIds = new Set(allowedRequirements.map((requirement) => requirement.id));
  const coverageById = new Map();
  for (const item of rawCoverage) {
    if (!isRecord(item)) continue;
    const requirementId = asText(item.requirementId);
    const status = asText(item.status);
    if (!allowedIds.has(requirementId) || !coverageStatuses.has(status) || coverageById.has(requirementId)) continue;
    const evidence = normalizeEvidenceList(item.evidence, content);
    if ((status === 'COVERED' || status === 'PARTIAL') && evidence.length === 0) continue;
    const missingPointVi = item.missingPointVi === null ? null : asText(item.missingPointVi) || null;
    coverageById.set(requirementId, { requirementId, status, evidence, missingPointVi });
  }
  if (coverageById.size !== allowedRequirements.length) return null;
  return allowedRequirements.map((requirement) => coverageById.get(requirement.id));
}

function normalizeIssues(rawIssues, content, unitType, dropped) {
  const maximum = unitType === 'THREE_SENTENCE' ? 2 : 8;
  return (Array.isArray(rawIssues) ? rawIssues : []).flatMap((item) => {
    if (!isRecord(item)) return [];
    const category = asText(item.category); const severity = asText(item.severity); const original = typeof item.original === 'string' ? item.original : ''; const corrected = asText(item.corrected); const explanationVi = asText(item.explanationVi);
    if (!issueCategories.has(category) || !severities.has(severity) || !original.trim() || !content.includes(original) || !corrected || !explanationVi) {
      dropped.issues += 1;
      return [];
    }
    return [{ category, severity, original, corrected, explanationVi }];
  }).slice(0, maximum);
}

function normalizeSentenceFunctions(rawFunctions, content, unitType, checks, dropped) {
  if (unitType !== 'THREE_SENTENCE') return [];
  if (!Array.isArray(rawFunctions)) return null;
  const bySlot = new Map();
  for (const item of rawFunctions) {
    if (!isRecord(item)) continue;
    const slot = asText(item.slot); const status = asText(item.status); const commentVi = asText(item.commentVi); const evidence = normalizeEvidenceList(item.evidence, content);
    if (!sentenceSlots.includes(slot) || !sentenceStatuses.has(status) || !commentVi || bySlot.has(slot)) continue;
    const expectedSentence = checks.sentences[sentenceSlots.indexOf(slot)];
    if (status !== 'MISSING' && evidence.length === 0) { dropped.sentenceFunctions += 1; continue; }
    if (status === 'MISSING' && expectedSentence) { dropped.sentenceFunctions += 1; continue; }
    bySlot.set(slot, { slot, status, commentVi, evidence });
  }
  if (bySlot.size !== sentenceSlots.length) return null;
  return sentenceSlots.map((slot) => bySlot.get(slot)).filter(Boolean);
}

function normalizeLogic(rawLogic, content, dropped) {
  if (!isRecord(rawLogic)) return null;
  const status = asText(rawLogic.status); const severity = asText(rawLogic.severity); const explanationVi = asText(rawLogic.explanationVi); const evidence = normalizeEvidenceList(rawLogic.evidence, content);
  if (!logicStatuses.has(status) || !severities.has(severity) || !explanationVi || evidence.length === 0) { dropped.logic += 1; return null; }
  return { status, severity, chain: asList(rawLogic.chain, 4), explanationVi, missingLink: rawLogic.missingLink === null ? null : asText(rawLogic.missingLink) || null, evidence };
}

function normalizeRepetition(rawRepetition, checks, content) {
  const deterministicByExpression = new Map(checks.repetitions.map((item) => [item.expression, item.count]));
  return (Array.isArray(rawRepetition) ? rawRepetition : []).flatMap((item) => {
    if (!isRecord(item)) return [];
    const expression = asText(item.expression); const count = deterministicByExpression.get(expression);
    if (!content.includes(expression) || !count) return [];
    return [{ expression, count, shouldFix: Boolean(item.shouldFix), alternatives: asList(item.alternatives, 3) }];
  });
}

function buildNextDraft(coverage, issues, logic) {
  const firstIssue = issues[0];
  const firstCoverage = coverage.find((item) => item.status !== 'COVERED');
  const priorities = [];
  if (firstIssue) priorities.push(`Sửa "${firstIssue.original}" trước.`);
  if (firstCoverage) priorities.push(firstCoverage.missingPointVi || 'Bổ sung ý còn thiếu cho requirement đang luyện.');
  if (logic?.status === 'LOGIC_GAP') priorities.push('Nối rõ hơn mắt xích nguyên nhân và kết quả.');
  return { priority1: priorities[0] || 'Giữ cách diễn đạt hiện tại và kiểm tra lại yêu cầu đề bài.', priority2: priorities[1] || null, priority3: priorities[2] || null };
}

export function normalizeQ54Assessment(rawValue, { content, allowedRequirements, selectedRequirementId, unitType }) {
  if (!isRecord(rawValue) || !content || !Array.isArray(allowedRequirements) || allowedRequirements.length === 0) return null;
  const dropped = { issues: 0, coverage: 0, sentenceFunctions: 0, logic: 0 };
  const checks = deterministicChecks(content);
  const coverage = normalizeCoverage(rawValue.coverage, allowedRequirements, content);
  if (!coverage) return null;
  const issues = normalizeIssues(rawValue.issues, content, unitType, dropped);
  const sentenceFunctions = normalizeSentenceFunctions(rawValue.sentenceFunctions, content, unitType, checks, dropped);
  if (unitType === 'THREE_SENTENCE' && sentenceFunctions === null) return null;
  const logic = normalizeLogic(rawValue.logic, content, dropped);
  const repetition = normalizeRepetition(rawValue.repetition, checks, content);
  const strengths = coverage.filter((item) => item.status === 'COVERED').map((item) => `Đã trả lời requirement ${item.requirementId}.`);
  const nextDraft = buildNextDraft(coverage, issues, logic);
  const summaryVi = 'Feedback được đối chiếu với đúng bản nộp hiện tại.';
  return {
    summaryVi,
    summary: { overall: summaryVi, strengths, nextFocus: [nextDraft.priority1, nextDraft.priority2, nextDraft.priority3].filter(Boolean) },
    coverage,
    sentenceFunctions,
    logic,
    issues,
    repetition,
    nextDraft,
    validation: { allowedRequirementIds: allowedRequirements.map((item) => item.id), selectedRequirementId: selectedRequirementId || null, deterministicChecks: checks, dropped },
  };
}
