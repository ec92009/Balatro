# Balatro

Standalone local web project for an original poker roguelite-style card game prototype.

## Local Preview

Run from this project root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Structure

- `index.html`: App shell and markup.
- `styles.css`: Visual design and responsive layout.
- `app.js`: Game state, poker-hand scoring, round progression, and shop behavior.
- `AGENTS.md`: Project-specific instructions for future work.

## Current Game

- Select up to five cards from an eight-card hand.
- Start with an intro tutorial and reopen the rules any time.
- Play scored poker hands to clear each round target.
- Use limited discards to redraw weak cards.
- Earn cash, buy original joker modifiers, and advance to harder rounds.
