export class DailySeed {
  static today(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  static seedForDate(date = new Date()) {
    return `daily-${DailySeed.today(date)}`;
  }

  static storageKeyForDate(date = new Date()) {
    return `dicezzle.dailyCompleted.${DailySeed.today(date)}`;
  }
}
