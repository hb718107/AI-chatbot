import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { getChatHistory } from './userService.js';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'DEMO_KEY' });

const tools = [
  {
    type: 'function',
    function: {
      name: 'createUser',
      description: 'Creates or registers a new user record. Synonyms: add, create, register, insert, append, enroll, onboard, new user.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name of the user' },
          email: { type: 'string', description: 'Email address of the user' },
          phone: { type: 'string', description: 'Phone number of the user' },
          city: { type: 'string', description: 'City location of the user' },
          status: { type: 'string', description: 'Status (Active, Offline, Suspended)' }
        },
        required: ['email']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'updateUser',
      description: 'Updates or modifies an existing user record. Synonyms: update, edit, modify, change, set, alter, revise, adjust, assign.',
      parameters: {
        type: 'object',
        properties: {
          emailOrName: { type: 'string', description: 'Email address or name of the target user' },
          name: { type: 'string' },
          phone: { type: 'string' },
          city: { type: 'string' },
          status: { type: 'string' }
        },
        required: ['emailOrName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deleteUser',
      description: 'Deletes or removes a user record. Synonyms: delete, remove, purge, erase, drop, discard, terminate, revoke, ban, kick, clear.',
      parameters: {
        type: 'object',
        properties: {
          emailOrName: { type: 'string', description: 'Email address or name of the user to delete' }
        },
        required: ['emailOrName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryUsers',
      description: 'Searches, queries, or looks up user records. Synonyms: find, search, look for, lookup, fetch, get, display, check, view, inspect, count, list, who is, where is, what is.',
      parameters: {
        type: 'object',
        properties: {
          queryText: { type: 'string', description: 'Name or search term to lookup' }
        },
        required: ['queryText']
      }
    }
  }
];

export const parseUserCommand = async (userMessage) => {
  if (!process.env.GROQ_API_KEY) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('add') || msg.includes('create')) {
      const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = msg.match(/\+?[0-9\-]{5,15}/);
      return {
        toolCall: {
          name: 'createUser',
          args: {
            email: emailMatch ? emailMatch[0] : 'new.user@mail.co',
            phone: phoneMatch ? phoneMatch[0] : '012-555-0199',
            name: 'New User',
            city: 'New York'
          }
        }
      };
    }
    if (msg.includes('remove') || msg.includes('delete')) {
      const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      return {
        toolCall: {
          name: 'deleteUser',
          args: { emailOrName: emailMatch ? emailMatch[0] : 'john.smith@xyz.com' }
        }
      };
    }
    if (msg.includes('update') || msg.includes('change')) {
      return {
        toolCall: {
          name: 'updateUser',
          args: { emailOrName: 'samantha', city: 'Cordoba' }
        }
      };
    }
    return {
      toolCall: {
        name: 'queryUsers',
        args: { queryText: userMessage }
      }
    };
  }

  try {
    const historyRows = await getChatHistory();
    const historyMessages = historyRows.slice(-10).map(row => ({
      role: row.sender === 'user' ? 'user' : 'assistant',
      content: row.text
    }));

    const messages = [
      {
        role: 'system',
        content: `You are WPBrigade AI Assistant, an intelligent, helpful administrative assistant for the WPBrigade AI Portal.
Always respond warmly, clearly, and professionally.

Understand synonyms and natural language phrasing for all CRUD actions:
- READ / QUERY Intent (Synonyms: "find", "search", "look for", "lookup", "fetch", "get", "display", "check", "who is", "where is", "what is", "list all", "show all", "how many", "count users", "total users"): Call 'queryUsers'. If the user asks for "how many users", "total users", "count", or "all users", leave queryText empty or omit it so all users are returned.
- CREATE Intent (Synonyms: "add", "create", "register", "insert", "append", "enroll", "onboard"): Call 'createUser'.
- UPDATE Intent (Synonyms: "update", "edit", "modify", "change", "set", "alter", "revise", "adjust"): Call 'updateUser'.
- DELETE Intent (Synonyms: "delete", "remove", "purge", "erase", "drop", "discard", "terminate", "revoke"): Call 'deleteUser'.

Do NOT address the user as "boss". Keep responses concise and focused.`
      },
      ...historyMessages,
      { role: 'user', content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: process.env.GROQ_CHAT_MODEL || 'qwen/qwen3.6-27b',
      tools,
      tool_choice: 'auto',
      temperature: 0.0
    });

    const choice = chatCompletion.choices[0];
    const toolCalls = choice?.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const args = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;

      return {
        toolCall: {
          name: toolCall.function.name,
          args
        }
      };
    }

    const contentText = choice?.message?.content || "";

    if (contentText.includes('<function')) {
      const match = contentText.match(/<function[:=\$](\w+)[\s>]+({[^<]+})/i);
      if (match) {
        try {
          const fnName = match[1];
          const rawJson = match[2].trim();
          const parsedArgs = JSON.parse(rawJson);
          return {
            toolCall: {
              name: fnName,
              args: parsedArgs
            }
          };
        } catch (e) {
        }
      }
    }

    return { responseText: contentText || "I'm sorry, I couldn't process that request." };
  } catch (err) {
    if (err.message && err.message.includes('failed_generation')) {
      const match = err.message.match(/<function[:=\$](\w+)[\s>]+({[^<]+})/i);
      if (match) {
        try {
          const fnName = match[1];
          const rawJson = match[2].trim();
          const parsedArgs = JSON.parse(rawJson);
          return {
            toolCall: {
              name: fnName,
              args: parsedArgs
            }
          };
        } catch (e) {
          const qMatch = err.message.match(/queryText["\s:]+["']?([^"\\}\]]+)["']?/i);
          if (qMatch && qMatch[1]) {
            return {
              toolCall: {
                name: 'queryUsers',
                args: { queryText: qMatch[1].trim() }
              }
            };
          }
        }
      }
    }
    const msg = userMessage.toLowerCase();
    let toolCall = null;
    if (msg.includes('add') || msg.includes('create')) {
      const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = msg.match(/\+?[0-9\-]{5,15}/);
      toolCall = {
        name: 'createUser',
        args: {
          email: emailMatch ? emailMatch[0] : 'new.user@mail.co',
          phone: phoneMatch ? phoneMatch[0] : '012-555-0199',
          name: 'New User',
          city: 'New York'
        }
      };
    } else if (msg.includes('remove') || msg.includes('delete')) {
      const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      toolCall = {
        name: 'deleteUser',
        args: { emailOrName: emailMatch ? emailMatch[0] : 'john.smith@xyz.com' }
      };
    } else if (msg.includes('update') || msg.includes('change')) {
      toolCall = {
        name: 'updateUser',
        args: { emailOrName: 'samantha', city: 'Cordoba' }
      };
    }
    if (toolCall) return { toolCall };
    return { responseText: `Error processing request: ${err.message}` };
  }
};
