# Dicezzle Social Share Plan

Dicezzle sharing should feel like a natural score brag, not a pressure mechanic.

## MVP result text

```text
Dicezzle Classic
Score: 12,840
Best: 18,420
Stars: 3
Star Clears: 1
Best Chain: x3
Rank: Star Maker

Can you beat my score?
https://dicezzle.com/
```

## MVP behavior

- Show the result panel at game over.
- Include Score, Best score, Highest die, Stars created, Star clears, Best chain, Turns survived, Rank, Share, Copy result, and Play again.
- Use `navigator.share()` where available.
- Fallback to clipboard copy when Web Share is unavailable or fails.
- Show a friendly toast: `Result copied!`
- Do not require login.
- Do not collect personal information.

## Rank labels

- Beginner Roller
- Clever Roller
- Chain Builder
- Six Master
- Star Maker
- Star Clearer
- Dicezzle Pro

## Future share image

The result panel is structured as a reusable `ResultCard` layout in `src/game/ui/ResultPanel.js`. A future phase can render that card to a client-side image export target.

Server-side image generation is intentionally out of MVP scope.

## Tone rules

- Keep emojis light.
- Avoid casino words, jackpot framing, wagering language, loot language, or shame wording.
- Use positive rank labels only.
- Encourage replay with curiosity, not pressure.
