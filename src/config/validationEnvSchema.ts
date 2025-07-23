import * as Joi from 'joi';

export const validationEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  APP_PORT: Joi.number().default(3003).required(),
  APP_BASE_URL: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  ETHEREAL_PORT: Joi.number().required(),
  ETHEREAL_USER: Joi.string().required(),
  ETHEREAL_PASSWORD: Joi.string().required(),
});
