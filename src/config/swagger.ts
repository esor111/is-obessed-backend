import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'IG Obsessed Backend API',
    version: '1.0.0',
    description: 'Backend API for IG Obsessed topic tracking application with earnings management',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      Topic: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the topic'
          },
          title: {
            type: 'string',
            description: 'Title of the topic'
          },
          category: {
            type: 'string',
            description: 'Category of the topic'
          },
          earnings: {
            type: 'number',
            format: 'float',
            description: 'Calculated earnings from completed reps'
          },
          completionPercentage: {
            type: 'number',
            format: 'float',
            description: 'Completion percentage based on subtopics'
          },
          notes: {
            type: 'string',
            description: 'Additional notes for the topic'
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            },
            description: 'Related URLs for the topic'
          },
          moneyPer5Reps: {
            type: 'number',
            format: 'float',
            description: 'Money earned per 5 repetitions'
          },
          isMoneyPer5RepsLocked: {
            type: 'boolean',
            description: 'Whether the money per 5 reps is locked'
          },
          subtopics: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Subtopic'
            }
          }
        }
      },
      Subtopic: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the subtopic'
          },
          title: {
            type: 'string',
            description: 'Title of the subtopic'
          },
          repsCompleted: {
            type: 'integer',
            description: 'Number of repetitions completed'
          },
          repsGoal: {
            type: 'integer',
            description: 'Goal number of repetitions (always 18)'
          },
          notes: {
            type: 'string',
            description: 'Additional notes for the subtopic'
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            },
            description: 'Related URLs for the subtopic'
          },
          goalAmount: {
            type: 'number',
            format: 'float',
            description: 'Goal amount (must be multiple of 1000)'
          }
        }
      },
      DashboardData: {
        type: 'object',
        properties: {
          globalGoal: {
            type: 'number',
            format: 'float',
            description: 'Global earnings goal'
          },
          currentEarnings: {
            type: 'number',
            format: 'float',
            description: 'Current total earnings'
          },
          progress: {
            type: 'number',
            format: 'float',
            description: 'Progress percentage towards global goal'
          },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                category: { type: 'string' },
                earnings: { type: 'number', format: 'float' },
                completionPercentage: { type: 'number', format: 'float' }
              }
            }
          }
        }
      },
      CreateTopicRequest: {
        type: 'object',
        required: ['title', 'category', 'moneyPer5Reps'],
        properties: {
          title: {
            type: 'string',
            description: 'Title of the topic'
          },
          category: {
            type: 'string',
            description: 'Category of the topic'
          },
          notes: {
            type: 'string',
            description: 'Additional notes'
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            }
          },
          moneyPer5Reps: {
            type: 'number',
            format: 'float',
            description: 'Money earned per 5 repetitions'
          },
          isMoneyPer5RepsLocked: {
            type: 'boolean',
            default: false
          }
        }
      },
      CreateSubtopicRequest: {
        type: 'object',
        required: ['title', 'goalAmount'],
        properties: {
          title: {
            type: 'string',
            description: 'Title of the subtopic'
          },
          goalAmount: {
            type: 'number',
            format: 'float',
            description: 'Goal amount (must be multiple of 1000)'
          },
          notes: {
            type: 'string',
            description: 'Additional notes'
          },
          urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            }
          }
        }
      },
      AddRepsRequest: {
        type: 'object',
        required: ['reps'],
        properties: {
          reps: {
            type: 'integer',
            description: 'Number of reps to add (can be negative to subtract)'
          }
        }
      },
      UpdateGlobalGoalRequest: {
        type: 'object',
        required: ['globalGoal'],
        properties: {
          globalGoal: {
            type: 'number',
            format: 'float',
            description: 'New global goal amount'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;