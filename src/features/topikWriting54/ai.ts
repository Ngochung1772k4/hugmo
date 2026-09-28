import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { environmentRequirements } from './data/demoFixture';
import { saveDemoError } from './service';
import type { Q54Assessment, Q54FunctionGroup, Q54GeneratedIdea, Q54HintKey, Q54QuestionAnalysis, Q54SentenceAttempt } from './types';

function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Không thể kết nối dịch vụ AI.'; }

export async function analyzeQ54Question(promptKo: string, isDemo: boolean): Promise<Q54QuestionAnalysis> {
  if (isDemo || !isSupabaseConfigured) {
    const consumptionPrompt = /합리적인\s*소비|소비\s*습관|온라인\s*쇼핑|불필요한\s*(?:물건|지출)|계획적인\s*소비/.test(promptKo);
    return {
      requirements: environmentRequirements.map(({ prompt_ko, label_vi, requirement_type, function_group }) => ({ promptKo: prompt_ko, labelVi: label_vi, requirementType: requirement_type, functionGroup: function_group })),
      topicSuggestion: consumptionPrompt
        ? { kind: 'OTHER', slug: 'consumer-economy', nameKo: '소비 / 경제생활', nameVi: 'Tiêu dùng / Đời sống kinh tế', subtopicKo: /합리적인\s*소비\s*습관/.test(promptKo) ? '합리적인 소비 습관' : '소비 생활' }
        : { kind: 'EXISTING', slug: 'environment', nameKo: '환경', nameVi: 'Môi trường', subtopicKo: '환경 보호' },
    };
  }
  const { data, error } = await supabase.functions.invoke('analyze-q54-question', { body: { promptKo } });
  if (error) throw new Error(error.message);
  const result = data as Q54QuestionAnalysis & { code?: string };
  if (result.code || !Array.isArray(result.requirements)) throw new Error(result.code === 'Q54_RATE_LIMIT_SHORT' ? 'Bạn đã gửi quá nhiều yêu cầu trong vài phút. Hãy thử lại sau.' : result.code === 'Q54_RATE_LIMIT_DAILY' ? 'Bạn đã dùng hết lượt AI Q54 hôm nay.' : 'AI chưa thể phân tích đề này.');
  return result;
}

const demoIdeasByGroup: Record<Q54FunctionGroup, Q54GeneratedIdea[]> = {
  POSITIVE: [
    { keywordKo: '삶의 질 향상', keywordVi: 'Nâng cao chất lượng cuộc sống', logicSteps: ['Lợi ích thiết thực', 'Cuộc sống tốt hơn'] },
    { keywordKo: '장기적인 안정', keywordVi: 'Sự ổn định lâu dài', logicSteps: ['Duy trì thói quen tốt', 'Giảm rủi ro về sau'] },
  ],
  NEGATIVE: [
    { keywordKo: '건강 문제', keywordVi: 'Vấn đề sức khỏe', logicSteps: ['Thói quen không phù hợp', 'Tác động tiêu cực'] },
    { keywordKo: '경제적 부담', keywordVi: 'Gánh nặng kinh tế', logicSteps: ['Chi phí tăng', 'Khó duy trì lâu dài'] },
  ],
  CAUSE: [
    { keywordKo: '시간이 부족하다', keywordVi: 'Thiếu thời gian', logicSteps: ['Cuộc sống bận rộn', 'Khó thực hành thường xuyên'] },
    { keywordKo: '정보가 부족하다', keywordVi: 'Thiếu thông tin', logicSteps: ['Không biết cách phù hợp', 'Dễ lựa chọn sai'] },
  ],
  SOLUTION: [
    { keywordKo: '실천 계획을 세우다', keywordVi: 'Lập kế hoạch thực hành', logicSteps: ['Đặt mục tiêu nhỏ', 'Duy trì đều đặn'] },
    { keywordKo: '올바른 정보를 활용하다', keywordVi: 'Sử dụng thông tin đúng đắn', logicSteps: ['Tìm nguồn tin cậy', 'Áp dụng phù hợp'] },
  ],
  SPECIAL: [
    { keywordKo: '사회적 역할', keywordVi: 'Vai trò xã hội', logicSteps: ['Các bên cùng tham gia', 'Tạo thay đổi tích cực'] },
    { keywordKo: '개인 상황', keywordVi: 'Hoàn cảnh cá nhân', logicSteps: ['Xem xét điều kiện riêng', 'Chọn cách phù hợp'] },
  ],
};

export async function generateQ54Ideas(input: { questionId: string; requirementId: string; functionGroup: Q54FunctionGroup; isDemo: boolean }): Promise<Q54GeneratedIdea[]> {
  if (input.isDemo || !isSupabaseConfigured) return demoIdeasByGroup[input.functionGroup];
  const { data, error } = await supabase.functions.invoke('generate-q54-ideas', { body: { questionId: input.questionId, requirementId: input.requirementId } });
  if (error) throw new Error(error.message);
  const result = data as { code?: string; ideas?: Q54GeneratedIdea[] };
  if (Array.isArray(result.ideas)) return result.ideas;
  if (result.code === 'Q54_RATE_LIMIT_SHORT') throw new Error('Bạn đã gửi quá nhiều yêu cầu AI Q54 trong vài phút. Hãy thử lại sau.');
  if (result.code === 'Q54_RATE_LIMIT_DAILY') throw new Error('Bạn đã dùng hết lượt AI Q54 hôm nay.');
  throw new Error('AI chưa thể tạo Idea Bank cho requirement này. Hãy thử lại sau.');
}

export async function generateQ54TranslationExercise(input: { questionId: string; requirementId: string; isDemo: boolean }): Promise<string> {
  if (input.isDemo || !isSupabaseConfigured) throw new Error('Demo Mode chỉ hỗ trợ tự nhập câu tiếng Việt.');
  const { data, error } = await supabase.functions.invoke('generate-q54-translation-exercise', { body: { questionId: input.questionId, requirementId: input.requirementId } });
  if (error) throw new Error(error.message);
  const result = data as { code?: string; exerciseId?: string };
  if (result.exerciseId) return result.exerciseId;
  if (result.code === 'Q54_RATE_LIMIT_SHORT') throw new Error('Bạn đã gửi quá nhiều yêu cầu AI Q54 trong vài phút. Hãy thử lại sau.');
  if (result.code === 'Q54_RATE_LIMIT_DAILY') throw new Error('Bạn đã dùng hết lượt AI Q54 hôm nay.');
  throw new Error('AI chưa thể tạo bài luyện lúc này. Hãy thử lại sau.');
}

export async function generateQ54TranslationHint(input: { exerciseId: string; hintKey: Q54HintKey; isDemo: boolean }): Promise<string[] | string> {
  if (input.isDemo || !isSupabaseConfigured) {
    if (input.hintKey === 'vocabulary') return ['핵심 단어', '실천하다', '도움이 되다'];
    if (input.hintKey === 'pattern') return 'V-는 데 도움이 되다';
    if (input.hintKey === 'logic') return 'Chọn chủ thể rõ ràng rồi nối hành động với tác động hoặc mục tiêu.';
    return '꾸준한 실천은 좋은 습관을 만드는 데 도움이 된다.';
  }
  const { data, error } = await supabase.functions.invoke('generate-q54-translation-hint', { body: { exerciseId: input.exerciseId, hintKey: input.hintKey } });
  if (error) throw new Error(error.message);
  const result = data as { code?: string; hint?: string[] | string };
  if (result.hint) return result.hint;
  if (result.code === 'Q54_RATE_LIMIT_SHORT') throw new Error('Bạn đã gửi quá nhiều yêu cầu AI Q54 trong vài phút. Hãy thử lại sau.');
  if (result.code === 'Q54_RATE_LIMIT_DAILY') throw new Error('Bạn đã dùng hết lượt AI Q54 hôm nay.');
  throw new Error('AI chưa thể tạo gợi ý này. Hãy thử lại sau.');
}

function demoAssessment(answerKo: string, referenceAnswer: string | null): Q54Assessment {
  const correct = !!referenceAnswer && answerKo.normalize('NFC').trim() === referenceAnswer.normalize('NFC').trim();
  return correct
    ? { verdict: 'ACCEPTABLE', summaryVi: 'Câu của bạn khớp với đáp án tham chiếu trong Demo Mode.', correctedSentence: referenceAnswer || answerKo, errors: [], naturalAlternatives: [], usedPatterns: [], usedVocabulary: [] }
    : { verdict: 'NEEDS_REVISION', summaryVi: 'Demo Mode chưa thể chấm chính xác câu tự nhập như bản online.', correctedSentence: referenceAnswer || answerKo, errors: referenceAnswer ? [{ type: 'GRAMMAR', original: answerKo, corrected: referenceAnswer, explanationVi: 'Hãy so sánh câu của bạn với cấu trúc gợi ý và đáp án tham chiếu.' }] : [], naturalAlternatives: [], usedPatterns: [], usedVocabulary: [] };
}

export async function checkQ54Sentence(input: { exerciseId: string; answerKo: string; hintLevel: number; hintsUsed: string[]; referenceAnswer: string | null; submissionId: string; isDemo: boolean }): Promise<{ attemptId: string; state: Q54SentenceAttempt['state']; assessment: Q54Assessment | null }> {
  if (input.isDemo || !isSupabaseConfigured) {
    const assessment = demoAssessment(input.answerKo, input.referenceAnswer);
    for (const error of assessment.errors) saveDemoError({ error_key: `${error.type}|${error.original.normalize('NFC').trim().toLowerCase()}|${error.corrected.normalize('NFC').trim().toLowerCase()}`, error_type: error.type, original_text: error.original, corrected_text: error.corrected, explanation_vi: error.explanationVi });
    return { attemptId: input.submissionId, state: 'ASSESSED', assessment };
  }
  const { data, error } = await supabase.functions.invoke('check-q54-sentence', { body: { exerciseId: input.exerciseId, answerKo: input.answerKo, hintLevel: input.hintLevel, hintsUsed: input.hintsUsed, submissionId: input.submissionId } });
  if (error) throw new Error(error.message);
  const result = data as { code?: string; attemptId?: string; state?: Q54SentenceAttempt['state']; assessment?: Q54Assessment | null };
  if (result.code || !result.attemptId || !result.state) {
    if (result.code === 'Q54_RATE_LIMIT_SHORT') throw new Error('Bạn đã gửi quá nhiều bài trong 5 phút. Hãy nghỉ một chút rồi thử lại.');
    if (result.code === 'Q54_RATE_LIMIT_DAILY') throw new Error('Bạn đã dùng hết 30 lượt AI Q54 hôm nay.');
    throw new Error(result.code || errorMessage(error));
  }
  return { attemptId: result.attemptId, state: result.state, assessment: result.assessment || null };
}
