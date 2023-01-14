import { RegistrationInfo, TicketLevel, TicketType } from '~/state/models/register'
import { AnyAppAction, GetAction } from '~/state/actions'
import type { DeepNonNullable } from 'ts-essentials'
import { SubmitForm, SubmitFormActionBundle } from '../actions/forms'
import { LoadRegistrationState } from '../actions/register'
import autosaveData from '~/state/autosave'
import config from '~/config'

export interface RegisterState {
	readonly registrationInfo: Partial<RegistrationInfo>
	readonly isOpen: boolean | null
}

const defaultState: RegisterState = {
	registrationInfo: autosaveData?.register ?? {},
	isOpen: null,
}

const transformTicketLevel = (ticketType: TicketType, payload: GetAction<SubmitFormActionBundle<'register-ticket-level'>>['payload']): TicketLevel => {
	const { addons, ...payloadRest } = payload as DeepNonNullable<typeof payload>

	return {
		addons: Object.fromEntries(Object.entries(addons).map(([id, { selected, ...rest }]) => [id, {
			selected: !(config.addons[id].unavailableFor?.type?.includes(ticketType.type) ?? false) && selected,
			...rest,
		}])),
		...payloadRest,
	}
}

const transformPersonalInfo = (payload: GetAction<SubmitFormActionBundle<'register-personal-info'>>['payload']) => {
	const { pronounsSelection, pronounsOther, dateOfBirth, ...rest } = payload as DeepNonNullable<typeof payload>

	return { pronouns: pronounsSelection === 'other' ? pronounsOther : pronounsSelection, dateOfBirth: new Date(dateOfBirth), ...rest }
}

const registrationInfoReducer = (state: Partial<RegistrationInfo>, action: GetAction<AnyAppAction>): Partial<RegistrationInfo> => {
	switch (action.type) {
		case SubmitForm('register-ticket-type').type:
			return action.payload.type === 'day' ? state : { ...state, ticketType: { type: action.payload.type! } }
		case SubmitForm('register-ticket-day').type:
			return { ...state, ticketType: { type: 'day', day: new Date(action.payload.day!) } }
		case SubmitForm('register-ticket-level').type:
			return { ...state, ticketLevel: transformTicketLevel(state.ticketType!, action.payload) }
		case SubmitForm('register-contact-info').type:
			return { ...state, contactInfo: action.payload as DeepNonNullable<typeof action.payload> }
		case SubmitForm('register-optional-info').type:
			return { ...state, optionalInfo: action.payload as DeepNonNullable<typeof action.payload> }
		case SubmitForm('register-personal-info').type:
			return { ...state, personalInfo: transformPersonalInfo(action.payload) }
		default:
			return state
	}
}

export default (state: RegisterState = defaultState, action: GetAction<AnyAppAction>): RegisterState => {
	switch (action.type) {
		case LoadRegistrationState.type:
			return {
				...state,
				registrationInfo: action.payload.registration ?? state.registrationInfo,
				isOpen: action.payload.isOpen,
			}
		default:
			return {
				...state,
				registrationInfo: registrationInfoReducer(state.registrationInfo, action),
			}
	}
}
