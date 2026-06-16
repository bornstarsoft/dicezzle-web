export class TraySlots {
  static consume(tray, index) {
    return tray.map((die, dieIndex) => (dieIndex === index ? null : die));
  }

  static shouldRefill(tray) {
    return tray.every((die) => die === null);
  }

  static nextActiveIndex(tray, startIndex = 0) {
    if (!tray.some(Boolean)) {
      return null;
    }

    for (let offset = 0; offset < tray.length; offset += 1) {
      const index = (startIndex + offset) % tray.length;
      if (tray[index]) {
        return index;
      }
    }

    return null;
  }
}
