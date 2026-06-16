import { DiceModel } from './DiceModel.js';
import { ScoreModel } from './ScoreModel.js';

export class ShareService {
  static shareUrl = 'https://dicezzle.com/play/';

  static title = 'Dicezzle - Dice Merge Puzzle Online';

  static generateResultText(result) {
    return [
      'Dicezzle Classic',
      `Score: ${ScoreModel.formatScore(result.score ?? 0)}`,
      `Best Die: ${DiceModel.label(result.highestDie ?? 1)}`,
      `Star Clears: ${result.starClears ?? 0}`,
      `Best Chain: x${result.bestChain ?? 1}`,
      `Rank: ${result.rank}`,
      'Can you beat my score?',
      ShareService.shareUrl
    ].join('\n');
  }

  static async shareResult(result, navigatorRef = globalThis.navigator) {
    const text = ShareService.generateResultText(result);
    if (navigatorRef?.share) {
      try {
        await navigatorRef.share({
          title: ShareService.title,
          text,
          url: ShareService.shareUrl
        });
        return { method: 'share', text };
      } catch (error) {
        if (error?.name === 'AbortError') {
          return { method: 'aborted', text };
        }
      }
    }

    await ShareService.copyResultText(text, navigatorRef);
    return { method: 'copy', text };
  }

  static async copyResult(result, navigatorRef = globalThis.navigator) {
    const text = typeof result === 'string' ? result : ShareService.generateResultText(result);
    await ShareService.copyResultText(text, navigatorRef);
    return text;
  }

  static async copyResultText(text, navigatorRef = globalThis.navigator) {
    if (navigatorRef?.clipboard?.writeText) {
      await navigatorRef.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
