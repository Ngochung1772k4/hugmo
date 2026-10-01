const coverageStatuses = new Set(['COVERED', 'PARTIAL', 'MISSING']);
const componentStatuses = new Set(['COVERED', 'MISSING']);
const issueCategories = new Set(['SPELLING', 'PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'COHESION', 'STYLE']);
const issueKinds = new Set(['ERROR', 'IMPROVEMENT']);
const improvementKinds = new Set(['IMPROVEMENT', 'EXPANSION']);
const severities = new Set(['LOW', 'MEDIUM', 'HIGH']);
const logicStatuses = new Set(['LOGIC_OK', 'LOGIC_GAP', 'LOGIC_ERROR']);
const sentenceSlots = ['MAIN_IDEA', 'WHY', 'RESULT'];
const sentenceStatuses = new Set(['GOOD', 'WEAK', 'MISSING']);
const repetitionExpressions = ['\uc218 \uc788\ub2e4', '\ub3c4\uc6c0\uc774 \ub418\ub2e4', '\uc911\uc694\ud558\ub2e4', '\ub530\ub77c\uc11c', '\uadf8 \uacb0\uacfc'];
const connectorExpressions = ['\ub530\ub77c\uc11c', '\uadf8 \uacb0\uacfc', '\uc774\ub97c \ud1b5\ud574', '\ub610\ud55c', '\uae30 \ub54c\ubb38\uc774\ub2e4', '\uc73c\ub85c \uc774\uc5b4\uc9c0\ub2e4'];
const particleForms = new Set(['\uc740', '\ub294', '\uc774', '\uac00', '\uc744', '\ub97c', '\uc640', '\uacfc', '\ub3c4', '\uc5d0', '\uc5d0\uc11c', '\uc5d0\uac8c', '\uc73c\ub85c', '\ub85c']);

const asText = (value) => typeof value === 'string' ? value.trim() : '';
const asList = (value, maximum = 6) => Array.isArray(value) ? value.map(asText).filter(Boolean).slice(0, maximum) : [];
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const makeEvidence = (content, text) => ({ start: content.indexOf(text), end: content.indexOf(text) + text.length, text });

export function countOccurrences(content, expression) {
  if (!expression) return 0;
  return content.split(expression).length - 1;
}

export function deterministicChecks(content) {
  const sentences = content.split(/(?<=[.!?\u3002\uff01\uff1f])\s*|\n+/).map((item) => item.trim()).filter(Boolean);
  const repetitions = repetitionExpressions.map((expression) => ({ expression, count: countOccurrences(content, expression) })).filter((item) => item.count >= 3);
  const connectors = connectorExpressions.filter((expression) => content.includes(expression));
  const isFormalWritten = sentences.length > 0 && sentences.every((sentence) => /\ub2e4[.!?\u3002\uff01\uff1f]?$/.test(sentence));
  return { characterCount: content.length, sentenceCount: sentences.length, sentences, repetitions, connectors, isFormalWritten };
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

function cleanCompositeComponent(value) {
  return value
    .replace(/(?:\uc774|\uac00|\uc740|\ub294)?\s*(?:\ud544\uc694\ud55c\s*\uc774\uc720|\uc911\uc694\ud55c\s*\uc774\uc720|\uc7a5\uc810|\ub2e8\uc810|\ubb38\uc81c\uc810|\ud6a8\uacfc|\uc601\ud5a5|\uc5ed\ud560|\ubc29\ubc95|\ub178\ub825|\ud574\uacb0\s*\ubc29\uc548|\ud2b9\uc9d5|\uace0\ub824\s*\uc0ac\ud56d)(?:\uc740|\ub294|\uc774|\uac00)?\s*(?:\ubb34\uc5c7\uc778\uac00|\ubb34\uc5c7\uc778\uc9c0|\uc5b4\ub5a4\s*\uac83\uc778\uac00)?\??$/u, '')
    .replace(/\uc758\s*(?:\uc7a5\uc810|\ub2e8\uc810|\ubb38\uc81c\uc810|\ud6a8\uacfc|\uc601\ud5a5|\uc5ed\ud560|\ud2b9\uc9d5|\uace0\ub824\s*\uc0ac\ud56d).*$/u, '')
    .replace(/[?\uff1f\u3002\uff01!]+$/u, '')
    .trim();
}

export function getCompositeRequirementComponents(requirement) {
  const prompt = asText(requirement?.promptKo || requirement?.prompt_ko);
  if (!prompt) return [];
  const parts = prompt.split(/\s*(?:\uc640|\uacfc|\ubc0f|\uadf8\ub9ac\uace0)\s+/u).map(cleanCompositeComponent).filter(Boolean);
  return parts.length > 1 ? [...new Set(parts)] : [];
}

function normalizeComponentCoverage(value, components, content) {
  if (components.length === 0) return [];
  const supplied = Array.isArray(value) ? value : [];
  const byComponent = new Map();
  for (const item of supplied) {
    if (!isRecord(item)) continue;
    const component = asText(item.component); const status = asText(item.status);
    if (!components.includes(component) || byComponent.has(component) || !componentStatuses.has(status)) continue;
    const evidence = normalizeEvidenceList(item.evidence, content);
    if (status === 'COVERED' && evidence.length === 0) continue;
    byComponent.set(component, { component, status, evidence });
  }
  return components.map((component) => byComponent.get(component) || { component, status: 'MISSING', evidence: [] });
}

function normalizeCoverage(rawCoverage, allowedRequirements, content) {
  if (!Array.isArray(rawCoverage)) return null;
  const allowedIds = new Set(allowedRequirements.map((requirement) => requirement.id));
  const coverageById = new Map();
  for (const item of rawCoverage) {
    if (!isRecord(item)) continue;
    const requirementId = asText(item.requirementId); const submittedStatus = asText(item.status);
    if (!allowedIds.has(requirementId) || !coverageStatuses.has(submittedStatus) || coverageById.has(requirementId)) continue;
    const evidence = normalizeEvidenceList(item.evidence, content);
    const requirement = allowedRequirements.find((candidate) => candidate.id === requirementId);
    const components = getCompositeRequirementComponents(requirement);
    const componentCoverage = normalizeComponentCoverage(item.componentCoverage, components, content);
    const allComponentsCovered = components.length > 0 && componentCoverage.every((component) => component.status === 'COVERED');
    const someComponentsCovered = componentCoverage.some((component) => component.status === 'COVERED');
    let status = submittedStatus;
    if (components.length > 0) {
      if (status === 'COVERED' && !allComponentsCovered) status = 'PARTIAL';
      if (status === 'MISSING' && someComponentsCovered) status = 'PARTIAL';
    }
    if ((status === 'COVERED' || status === 'PARTIAL') && evidence.length === 0) continue;
    const providerMissingPoint = item.missingPointVi === null ? null : asText(item.missingPointVi) || null;
    const missingPointVi = status === 'PARTIAL' && components.length > 0 && !allComponentsCovered
      ? providerMissingPoint || 'Hãy trả lời đầy đủ từng vế của requirement này.'
      : providerMissingPoint;
    coverageById.set(requirementId, { requirementId, status, evidence, missingPointVi, componentCoverage });
  }
  if (coverageById.size !== allowedRequirements.length) return null;
  return allowedRequirements.map((requirement) => coverageById.get(requirement.id));
}

function changedMiddle(original, corrected) {
  let prefix = 0;
  while (prefix < original.length && prefix < corrected.length && original[prefix] === corrected[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < original.length - prefix && suffix < corrected.length - prefix && original[original.length - 1 - suffix] === corrected[corrected.length - 1 - suffix]) suffix += 1;
  return { from: original.slice(prefix, original.length - suffix), to: corrected.slice(prefix, corrected.length - suffix) };
}

function isParticleCorrection(original, corrected) {
  const change = changedMiddle(original, corrected);
  return particleForms.has(change.from) && particleForms.has(change.to);
}

function normalizeIssues(rawIssues, content, unitType, dropped) {
  const maximum = unitType === 'THREE_SENTENCE' ? 2 : 8;
  return (Array.isArray(rawIssues) ? rawIssues : []).flatMap((item) => {
    if (!isRecord(item)) return [];
    const submittedCategory = asText(item.category); const submittedSeverity = asText(item.severity);
    const original = typeof item.original === 'string' ? item.original : ''; const corrected = asText(item.corrected); const explanationVi = asText(item.explanationVi);
    if (!issueCategories.has(submittedCategory) || !severities.has(submittedSeverity) || !original.trim() || !content.includes(original) || !corrected || !explanationVi) {
      dropped.issues += 1;
      return [];
    }
    const category = isParticleCorrection(original, corrected) ? 'PARTICLE' : submittedCategory;
    const severity = category === 'PARTICLE' && submittedSeverity === 'HIGH' ? 'MEDIUM' : submittedSeverity;
    const submittedKind = asText(item.kind);
    const kind = category === 'PARTICLE' || category === 'GRAMMAR' || category === 'SPELLING'
      ? 'ERROR'
      : issueKinds.has(submittedKind) ? submittedKind : 'IMPROVEMENT';
    return [{ kind, category, severity, original, corrected, explanationVi }];
  }).slice(0, maximum);
}

function normalizeImprovements(rawValue, content, dropped) {
  return (Array.isArray(rawValue) ? rawValue : []).flatMap((item) => {
    if (!isRecord(item)) return [];
    const kind = asText(item.kind); const suggestionVi = asText(item.suggestionVi); const evidence = normalizeEvidenceList(item.evidence, content);
    if (!improvementKinds.has(kind) || !suggestionVi || evidence.length === 0) { dropped.improvements += 1; return []; }
    return [{ kind, suggestionVi, evidence }];
  }).slice(0, 4);
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
  return sentenceSlots.map((slot) => bySlot.get(slot));
}

function mentionsSurfaceError(value, issues) {
  const source = [asText(value.explanationVi), asText(value.missingLink), ...asList(value.chain, 4)].join(' ').toLowerCase();
  if (/(?:particle|grammar|spelling|tr\u1ee3\s*t\u1eeb|\uc870\uc0ac|\ubb38\ubc95|\ub9de\ucda4\ubc95|\ucca0\uc790)/iu.test(source)) return true;
  return issues.some((issue) => issue.category === 'PARTICLE' && source.includes(issue.original.toLowerCase()));
}

function normalizeLogic(rawLogic, content, issues, dropped) {
  if (!isRecord(rawLogic)) return null;
  const status = asText(rawLogic.status); const severity = asText(rawLogic.severity); const explanationVi = asText(rawLogic.explanationVi); const evidence = normalizeEvidenceList(rawLogic.evidence, content); const chain = asList(rawLogic.chain, 4);
  if (!logicStatuses.has(status) || !severities.has(severity) || !explanationVi || evidence.length === 0 || (status === 'LOGIC_GAP' && (chain.length < 2 || mentionsSurfaceError(rawLogic, issues)))) { dropped.logic += 1; return null; }
  return { status, severity, chain, explanationVi, missingLink: rawLogic.missingLink === null ? null : asText(rawLogic.missingLink) || null, evidence };
}

function normalizeCohesion(rawValue, content, checks) {
  const supplied = isRecord(rawValue) ? rawValue : null;
  const suppliedEvidence = normalizeEvidenceList(supplied?.evidence, content).filter((item) => checks.connectors.includes(item.text));
  if (suppliedEvidence.length > 0 && asText(supplied?.commentVi)) return { status: asText(supplied.status) === 'NEEDS_IMPROVEMENT' ? 'NEEDS_IMPROVEMENT' : 'GOOD', connectors: suppliedEvidence, commentVi: asText(supplied.commentVi) };
  if (checks.connectors.length > 0) return { status: 'GOOD', connectors: checks.connectors.map((connector) => makeEvidence(content, connector)), commentVi: 'Đã dùng từ nối để liên kết ý.' };
  return null;
}

function normalizeFormalStyle(rawValue, content, checks) {
  if (!checks.isFormalWritten) return null;
  const supplied = isRecord(rawValue) ? rawValue : null;
  const evidence = normalizeEvidenceList(supplied?.evidence, content);
  return { status: 'FORMAL_WRITTEN', tone: 'HANDA_CHE', evidence: evidence.length > 0 ? evidence : [makeEvidence(content, checks.sentences[0])], commentVi: 'Bài viết đang dùng 한다체 / 문어체 phù hợp.' };
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
  const firstIssue = issues.find((item) => item.kind === 'ERROR');
  const firstCoverage = coverage.find((item) => item.status !== 'COVERED');
  const priorities = [];
  if (firstIssue) priorities.push(`Sửa "${firstIssue.original}" trước.`);
  if (firstCoverage) priorities.push(firstCoverage.missingPointVi || 'Bổ sung ý còn thiếu cho requirement đang luyện.');
  if (logic?.status === 'LOGIC_GAP') priorities.push('Nối rõ hơn mắt xích nguyên nhân và kết quả.');
  return { priority1: priorities[0] || 'Giữ cách diễn đạt hiện tại và kiểm tra lại yêu cầu đề bài.', priority2: priorities[1] || null, priority3: priorities[2] || null };
}

export function normalizeQ54Assessment(rawValue, { content, allowedRequirements, selectedRequirementId, unitType }) {
  if (!isRecord(rawValue) || !content || !Array.isArray(allowedRequirements) || allowedRequirements.length === 0) return null;
  const dropped = { issues: 0, improvements: 0, coverage: 0, sentenceFunctions: 0, logic: 0 };
  const checks = deterministicChecks(content);
  const coverage = normalizeCoverage(rawValue.coverage, allowedRequirements, content);
  if (!coverage) return null;
  const issues = normalizeIssues(rawValue.issues, content, unitType, dropped);
  const improvements = normalizeImprovements(rawValue.improvements, content, dropped);
  const sentenceFunctions = normalizeSentenceFunctions(rawValue.sentenceFunctions, content, unitType, checks, dropped);
  if (unitType === 'THREE_SENTENCE' && sentenceFunctions === null) return null;
  const logic = normalizeLogic(rawValue.logic, content, issues, dropped);
  const cohesion = normalizeCohesion(rawValue.cohesion, content, checks);
  const formalStyle = normalizeFormalStyle(rawValue.formalStyle, content, checks);
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
    cohesion,
    formalStyle,
    issues,
    improvements,
    repetition,
    nextDraft,
    validation: { allowedRequirementIds: allowedRequirements.map((item) => item.id), selectedRequirementId: selectedRequirementId || null, deterministicChecks: checks, dropped },
  };
}
