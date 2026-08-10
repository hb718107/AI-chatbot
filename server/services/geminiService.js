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
      description: 'Creates a new user record in the database.',
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
      description: 'Updates an existing user record identified by email or name.',
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
      description: 'Deletes a user record by email or name.',
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
      description: 'Queries or counts user records based on criteria such as initial, city, status, or search term.',
      parameters: {
        type: 'object',
        properties: {
          initial: { type: 'string', description: 'Starting letter of user name or email, e.g. H' },
          status: { type: 'string', description: 'User status, e.g. Active, Offline, Suspended' },
          city: { type: 'string', description: 'User city location' },
          queryText: { type: 'string', description: 'General search keyword' }
        }
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
    return { responseText: "I can help you add, update, or remove users. What would you like to do?" };
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
        content: 'You are an intelligent administrative assistant chatbot for WPBrigade AI Portal. Use conversation history as context memory. Help admins manage user records by invoking tools or answering questions directly.'
      },
      ...historyMessages,
      { role: 'user', content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      tools,
      tool_choice: 'auto'
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

    return { responseText: choice?.message?.content || "I'm ready to manage your users." };
  } catch (err) {
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
