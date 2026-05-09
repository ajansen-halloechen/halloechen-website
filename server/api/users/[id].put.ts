import { readValidatedBody } from "h3";
import { userService } from "#server/entities/user/user.service";
import { updateUserSchema } from "#server/entities/user/user.validation";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const body = await readValidatedBody(event, updateUserSchema.parse);
  return userService.update(id, body);
});
