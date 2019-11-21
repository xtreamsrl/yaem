# yaem

yaem (Yet Another Entity Manager) is a pure  @ngrx/entity porting that removes the Angular and @ngrx/store dependency
so that it can be used also in React project.

The two most important features are Memoized selectors and an entity adapter, a simple utils that allows to manage entities 
in the store preserving immutability.

## Memoized selector (as reselect)

Memoized selectors allow to improve React performance, reducing application rerendering. If the input state is not changed
the memoized selector just returns the precomputed value without recalculate it, preserving object reference and thus 
allowing memoized components and Pure components to not rerender.

### Feature selector

The feature selector must me the root selector of each one. It selects the part of the state under the key specified in 
the string as first argument. If for example the state has a root key named `user`:
 
```typescript jsx
import {createFeatureSelector} from '@xtream/yeam';
import {UserState} from '../reducers';

const selectUserState = createFeatureSelector<UserState>('user');

```

### Simple selector

The createSelector api composes selectors together memoizing each step and returning a function.

```typescript jsx
import {createFeatureSelector, createSelector} from '@xtream/yeam';
import {UserState} from '../reducers';

const selectUserState = createFeatureSelector<UserState>('user');

const selectName = createSelector(
  selectUserState,
  state => state.name
);

const selectSurname = createSelector(
    selectUserState,
    state => state.surname
);

const selectCompleteName = createSelector(
    selectName,
    selectSurname,
    (name, surname) => `${name} ${surname}`
);

```

## Entity adapter

The entity adapter is an utility to easily manage entities in the state keeping immutability. The exposed methods are

| Method | Usage| 
|--------|-----------|
| removeAll | Clears all the entities in the state|
| addOne | Adds one entity|
| addMany | Adds more entities|
| addAll | Overwrites all the entities with the provided ones|
| updateOne | Updates an entity (does nothing if not exists)|
| updateMany| Updates all the provided entities (does nothing if not exist)|
| upsertOne | Updates if exists or adds if not exists |
| upsertMany | Updates the ones that exist and adds the others|
| removeOne | Removes entity |
| removeMany | Removes all the provided entities |
| map | Transforms all the entities using the provided function|


All these methods require the state as parameter. Each entity is assumed to have an id property, but you can provide
a selectId function to use a custom id using constructor.

For performance reason, the entity state is organized like this:
```typescript jsx

{
  ids: any[],
  entities : {
    [id:any]: Entity
  }
}
```
Single update, add, or retrieve are really fast thanks to the entities map object while ids array is used to 
keep track of all the present entities (or to keep them in a specific order).

To let the application access the state, the entity adapter exposes 4 selectors:

| Selector | Usage| 
|--------|-----------|
| selectIds| Gets the list of all ids|
| selectEntities| Gets the dictionary of all the entities|
| selectAll| Gets the complete list of entities|
| selectTotal| Gets the number of the entities in the state|

### Complete example

```typescript jsx
import {createEntityAdapter, EntityState} from '@xtream/yaem';
import {User} from '../models';
import * as usersActions from '../actions'

interface UsersState extends EntityState<User> {
  selectedUserId: string | null;
}

const adapter = createEntityAdapter<User>({
  selectId: user => user.username,
  sortComparer: (userA, userB) => userA.subscriptionDate.localeCompare(userB.subscriptionDate)
});

const defaultState = adapter.getInitialState({selectedUserId: null});

export default function reducer(state: UsersState = defaultState, action: usersActions.UsersActionTypes): UsersState {

  switch (action.type) {
    case usersActions.ADD_USER_SUCCESS:
      return adapter.addOne(action.user, state);
    case usersActions.DELETE_USER_SUCCESS:
      return adapter.removeOne(action.username, state);
    case usersActions.UPDATE_USER_SUCCESS:
      return adapter.upsertOne(action.user, state);
    default:
      return state;
  }
}

const {    
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();

export {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
};





```
