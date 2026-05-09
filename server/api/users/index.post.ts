import { readValidatedBody } from 'h3';
import { userService } from '#server/entities/user/user.service';
import { createUserSchema } from '#server/entities/user/user.validation';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createUserSchema.parse);
  const user = await userService.create(body);
  setResponseStatus(event, 201);
  return user;
});
