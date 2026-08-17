import { parseUserCommand } from '../services/aiService.js';
import { getAllUsers, addUser, updateUserByEmail, deleteUserByEmail, queryUsersDb, saveChatMessage, getChatHistory, clearChatHistoryDb } from '../services/userService.js';

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
          const isConfirmed = req.body.confirmed === true || message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm');
          
          if (!isConfirmed) {
            responseText = `⚠️ CONFIRMATION REQUIRED: Are you sure you want to permanently delete user record matching "${target}"? Reply "yes" or "confirm" to execute.`;
            actionLog = `pending_delete:${target}`;
          } else {
            const resDelete = await deleteUserByEmail(target);
            if (resDelete.changes > 0) {
              responseText = `Done! The user record matching "${target}" has been removed.`;
            } else {
              responseText = `I searched the database, but couldn't locate a user matching "${target}" to remove.`;
            }
          }
        }
      } else if (name === 'queryUsers') {
        const matches = await queryUsersDb(args);
        const lowerMsg = message.toLowerCase();
        const isCountQuery = lowerMsg.includes('how many') || lowerMsg.includes('total') || lowerMsg.includes('count') || lowerMsg.includes('number of');

        if (matches.length === 0) {
          if (isCountQuery) {
            responseText = `There are currently 0 users registered in the database.`;
          } else {
            responseText = `I searched the database but found no matching users for "${args.queryText || args.initial || 'your request'}".`;
          }
        } else {
          if (isCountQuery) {
            responseText = `There are currently ${matches.length} total user(s) registered in the database.`;
          } else if (lowerMsg.includes('phone')) {
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
            const list = matches.map(u => `${u.name} (${u.email})`).join(', ');
            responseText = `Found ${matches.length} user(s): ${list}`;
          }
        }
      }
    }

    await saveChatMessage('ai', responseText);
    const updatedUsers = await getAllUsers();
    res.json({ responseText, actionLog, users: updatedUsers });
  } catch (error) {
    console.error('Error handling chat message:', error);
    const friendlyError = "I'm sorry, I couldn't complete that action. Please check the command details or try asking differently.";
    await saveChatMessage('ai', friendlyError);
    const users = await getAllUsers();
    res.json({
      responseText: friendlyError,
      users
    });
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

export const clearHistory = async (req, res) => {
  try {
    await clearChatHistoryDb();
    res.json({ message: 'Chat history cleared successfully', history: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
