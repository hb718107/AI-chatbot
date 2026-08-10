import { parseUserCommand } from '../services/geminiService.js';
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
        responseText = `Done! Created user ${newUser.email} successfully.`;
      } else if (name === 'updateUser') {
        await updateUserByEmail(args.emailOrName, args);
        responseText = `Done! Updated user matching "${args.emailOrName}".`;
      } else if (name === 'deleteUser') {
        await deleteUserByEmail(args.emailOrName);
        responseText = `Done! Removed user matching "${args.emailOrName}".`;
      } else if (name === 'queryUsers') {
        const matches = await queryUsersDb(args);
        if (matches.length === 0) {
          responseText = `I searched the database but found 0 users matching your query criteria.`;
        } else {
          const namesList = matches.map(u => `${u.name} (${u.email})`).join(', ');
          responseText = `Found ${matches.length} user(s) matching your query: ${namesList}.`;
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
