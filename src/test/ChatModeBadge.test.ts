import { describe, it, expect } from 'vitest';
import { isRealChatProvider } from '../api/chat';

/**
 * Test #1 — Chat Provider / Honesty Logic
 *
 * 目标：防止 frontend 把 Mock 错误显示为 REAL。
 * 仅当 provider 与 model 均为有效、非空、且不为 'mock'（对大小写/前后空白鲁棒）时才判定为真实。
 */
describe('isRealChatProvider — 真实性判定', () => {
  it('provider=zhipu, model=non-mock → true', () => {
    expect(isRealChatProvider('zhipu', 'glm-4.5-air')).toBe(true);
  });

  it('provider=openai, model=gpt-4o → true', () => {
    expect(isRealChatProvider('openai', 'gpt-4o')).toBe(true);
  });

  it('provider=mock → false（无论 model 是什么）', () => {
    expect(isRealChatProvider('mock', 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider('mock', 'mock')).toBe(false);
  });

  it('model=mock → false（无论 provider 是什么）', () => {
    expect(isRealChatProvider('zhipu', 'mock')).toBe(false);
  });

  it('大小写 Mock / MOCK → false', () => {
    expect(isRealChatProvider('Mock', 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider('MOCK', 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider('zhipu', 'Mock')).toBe(false);
    expect(isRealChatProvider('zhipu', 'MOCK')).toBe(false);
  });

  it('前后空白应被 trim 后判定（" mock " → false）', () => {
    expect(isRealChatProvider('  mock  ', 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider(' zhipu ', ' glm-4.5-air ')).toBe(true);
  });

  it('undefined / null / 空字符串 → false', () => {
    expect(isRealChatProvider(undefined, undefined)).toBe(false);
    expect(isRealChatProvider(null, null)).toBe(false);
    expect(isRealChatProvider('', '')).toBe(false);
    expect(isRealChatProvider('zhipu', '')).toBe(false);
    expect(isRealChatProvider('', 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider(undefined, 'glm-4.5-air')).toBe(false);
    expect(isRealChatProvider('zhipu', undefined)).toBe(false);
  });
});
