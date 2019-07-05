import {IdSelector} from './models';

export function selectIdValue<T>(entity: T, selectId: IdSelector<T>) {
  return selectId(entity);
}
