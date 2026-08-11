import { parseUserCommand } from '../services/aiService.js';
import { getAllUsers, addUser, updateUserByEmail, deleteUserByEmail, queryUsersDb, saveChatMessage, getChatHistory } from '../services/userService.js';

export const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    await saveChatMessage('user', message);

    const aiResult = await parseUserCommand(message);
    let actionLog = null;
    let responseText = aiResult.responseText;

    if (aiResult.toolCall) {
      const { name, args } = aiResult.toolCall;
      actionLog = { tool: name, args };

      if (name === 'createUser') {
        const newUser = await addUser(args);
        responseText = `Success! I have added ${newUser.name || newUser.email} (${newUser.email}) to the user database.`;
      } else if (name === 'updateUser') {
        const target = args.emailOrName;
        if (!target) {
          responseText = `Please specify which user record you would like me to update.`;
        } else {
          const resUpdate = await updateUserByEmail(target, args);
          if (resUpdate.changes > 0) {
            responseText = `Done! The user record for "${target}" has been successfully updated.`;
          } else {
            responseText = `I searched the database, but couldn't locate a user matching "${target}".`;
          }
        }
      } else if (name === 'deleteUser') {
        const target = args.emailOrName;
        if (!target) {
          responseText = `Please specify which user record you would like me to remove.`;
        } else {
          const resDelete = await deleteUserByEmail(target);
          if (resDelete.changes > 0) {
            responseText = `Done! The user record matching "${target}" has been removed.`;
          } else {
            responseText = `I searched the database, but couldn't locate a user matching "${target}" to remove.`;
          }
        }
      } else if (name === 'queryUsers') {
        const matches = await queryUsersDb(args);
        if (matches.length === 0) {
          responseText = `I searched the database but found no matching users for "${args.queryText || args.initial || 'your request'}".`;
        } else {
          const lowerMsg = message.toLowerCase();
          if (lowerMsg.includes('phone')) {
            const list = matches.map(u => `${u.name}: ${u.phone || 'No phone recorded'}`).join('; ');
            responseText = `Here is the phone information: ${list}`;
          } else if (lowerMsg.includes('email')) {
            const list = matches.map(u => `${u.name}: ${u.email}`).join('; ');
            responseText = `Here is the email information: ${list}`;
          } else if (lowerMsg.includes('city') || lowerMsg.includes('location')) {
            const list = matches.map(u => `${u.name}: ${u.city || 'Unknown'}`).join('; ');
            responseText = `Here is the city information: ${list}`;
          } else if (lowerMsg.includes('status')) {
            const list = matches.map(u => `${u.name}: ${u.status}`).join('; ');
            responseText = `Here is the status information: ${list}`;
          } else {
            const list = matches.map(u => `${u.name} (Email: ${u.email}, Phone: ${u.phone || 'N/A'}, City: ${u.city || 'N/A'}, Status: ${u.status})`).join(' | ');
            responseText = `Found ${matches.length} user(s): ${list}`;
          }
        }
      }
    }

    await saveChatMessage('ai', responseText);
    const updatedUsers = await getAllUsers();
    res.json({ responseText, actionLog, users: updatedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchHistory = async (req, res) => {
  try {
    const history = await getChatHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
