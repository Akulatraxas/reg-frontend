import { Action, AnyAction, Reducer } from 'redux'

export type PartialReducer<S = any, A extends Action = AnyAction> = (action: A) => (state: S) => S

export const createPartialReducer = <S = any, A extends Action = AnyAction>(initialState: () => S, func: PartialReducer<S, A>): Reducer<S, A> =>
	(state: S | undefined, action: A) => func(action)(state === undefined ? initialState() : state)
