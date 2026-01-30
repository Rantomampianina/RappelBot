# Emoji Reaction Command Usage

## Overview
The **emoji reaction** trigger allows you to create reminders that fire when a specific emoji is added to a message in a designated channel.

## Command Syntax
```
/rappel <trigger> <message>
```
- **trigger**: `emoji:<emoji> #<channel>`
  - `<emoji>` can be a Unicode emoji (e.g., `✅`) or a custom Discord emoji name/id.
  - `#<channel>` is the optional channel where the reaction must occur (use the channel mention syntax, e.g., `#general`).
- **message**: The reminder text that will be sent when the trigger fires.

### Example
```bash
/rappel emoji:✅ #annonces "Rappel: la réunion commence dans 5 minutes"
```
This creates a reminder that will send **"Rappel: la réunion commence dans 5 minutes"** when a user reacts with the ✅ emoji in the `#annonces` channel.

## How It Works Internally
- The bot parses the trigger using `parseReactionTrigger` in `server/utils/context.js`.
- It extracts the `emoji` and optional `channelId`.
- When a reaction event is received, `matchesReaction` checks if the reaction matches the stored emoji (supports both name and ID).
- If the channel matches (or no channel specified), the reminder is scheduled.

## Supported Emoji Types
- **Unicode emojis** (e.g., ✅, 🎉, 👍)
- **Custom emojis**: Provide the emoji name or ID (e.g., `myemoji` or `123456789012345678`). The bot will match either the name or the ID.

## Edge Cases & Tips
- If you omit the channel, the reaction can be in any channel.
- Ensure the bot has permission to read reactions in the target channel.
- Use distinct emojis for different reminders to avoid conflicts.

## FAQ
**Q:** *Can I use multiple emojis for one reminder?*\
**A:** Currently only a single emoji is supported per reminder. Create separate reminders for additional emojis.

**Q:** *What if the emoji is a custom animated emoji?*\
**A:** Provide the emoji name; the bot matches by name or ID, so animated emojis work the same way.

---
*Generated on 2026-01-30*
