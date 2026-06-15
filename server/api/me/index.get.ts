import { userService } from '#server/entities/user/user.service';

export default defineEventHandler(async (event) => {
  const { id } = event.context.user!;
  return userService.getById(id);
});
