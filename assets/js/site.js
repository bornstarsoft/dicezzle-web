(function () {
  const allowedEvents = new Set([
    'game_start',
    'dice_place',
    'merge_complete',
    'star_created',
    'star_clear',
    'game_over',
    'share_click',
    'copy_result',
    'restart_click',
    'tutorial_dismiss'
  ]);

  window.DicezzleAnalytics = window.DicezzleAnalytics || {
    track(eventName, detail) {
      if (!allowedEvents.has(eventName)) {
        return;
      }

      const payload = {
        eventName,
        detail: detail || {},
        sentAt: new Date().toISOString()
      };

      window.dispatchEvent(new CustomEvent('dicezzle:analytics', { detail: payload }));

      if (typeof window.dicezzleAnalyticsProvider === 'function') {
        window.dicezzleAnalyticsProvider(payload);
      }
    }
  };
}());
