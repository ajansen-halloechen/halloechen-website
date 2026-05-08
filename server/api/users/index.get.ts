import { userService } from "~/server/entities/user/user.service";

export default defineEventHandler(() => {
  return userService.getAll();
});
