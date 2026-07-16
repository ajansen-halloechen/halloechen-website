import { shiftBlockerService } from '#server/entities/shift-blocker/shift-blocker.service';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  const userId = event.context.user!.id;
  return shiftBlockerService.getById(id, userId);
});
