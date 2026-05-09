import { userService } from "#server/entities/user/user.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  await userService.remove(id);
  setResponseStatus(event, 204);
  return null;
});
