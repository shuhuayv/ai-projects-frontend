/**
 * Chat 生成层真实性判定工具。
 *
 * 用于区分「真实大模型生成」与「Mock 生成」：仅当 provider 与 model
 * 均为有效、非空、且不为 'mock'（对大小写 / 前后空白鲁棒）时才判定为真实。
 */

/**
 * 判断 RAG 问答响应的 Chat 生成层是否为真实大模型。
 *
 * 规则（防御性）：
 *   - provider / model 缺失（undefined / null）→ false
 *   - trim 后为空字符串 → false
 *   - 转小写等于 'mock'（含 'Mock' / 'MOCK' 等）→ false
 *   - 仅当 provider 与 model 均为有效、非 mock 字符串 → true
 *
 * @param provider Chat 提供方（如 zhipu），可空
 * @param model    Chat 模型（如 glm-4.7-flash），可空
 */
export function isRealChatProvider(provider?: string | null, model?: string | null): boolean {
  const normalizedProvider = provider?.trim().toLowerCase();
  const normalizedModel = model?.trim().toLowerCase();
  return Boolean(
    normalizedProvider &&
      normalizedModel &&
      normalizedProvider !== 'mock' &&
      normalizedModel !== 'mock',
  );
}
