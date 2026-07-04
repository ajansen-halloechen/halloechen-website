import { userService } from '#server/entities/user/user.service';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  return userService.getById(id);
});
