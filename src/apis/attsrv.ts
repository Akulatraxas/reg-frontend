/* eslint-disable camelcase */
import { head, last } from 'ramda'
import { catchError, concatMap, map } from 'rxjs/operators'
import { ajax, AjaxConfig, AjaxError } from 'rxjs/ajax'
import config from '~/config'
import type { RegistrationInfo } from '~/state/models/register'
import { ErrorDto as CommonErrorDto, handleStandardApiErrors } from './common'
import { combineLatest, of } from 'rxjs'
import { AppError } from '~/state/models/errors'
import type { Replace } from 'type-fest'
import { Locale } from '~/localization'
import { eachDayOfInterval } from '~/util/dates'
import { DateTime, Interval } from 'luxon'

export interface AttendeeDto {
	readonly id: number | null
	readonly nickname: string
	readonly first_name: string
	readonly last_name: string
	readonly street: string
	readonly zip: string
	readonly city: string
	readonly country: string // DE
	readonly spoken_languages: string
	readonly registration_language: Locale
	readonly state: string | null
	readonly email: string
	readonly phone: string
	readonly telegram: string | null // @Username
	readonly partner: string | null
	readonly birthday: string // 1972-11-06
	readonly gender: string | null // always set to 'notprovided'
	readonly pronouns: string | null
	readonly tshirt_size: string | null
	readonly flags: string // anon,ev
	readonly options: string // art,anim,music,suit
	readonly packages: string // room-none,attendance,sponsor
	readonly user_comments: string | null
}

export type ErrorMessage =
	| 'admin.data.invalid'
	| 'admin.parse.error'
	| 'admin.read.error'
	| 'admin.write.error'
	| 'attendee.data.duplicate'
	| 'attendee.data.invalid'
	| 'attendee.id.invalid'
	| 'attendee.id.notfound'
	| 'attendee.max_id.error'
	| 'attendee.owned.error'
	| 'attendee.owned.notfound'
	| 'attendee.parse.error'
	| 'attendee.write.error'
	| 'auth.forbidden'
	| 'auth.unauthorized'
	| 'ban.data.duplicate'
	| 'ban.data.invalid'
	| 'ban.id.invalid'
	| 'ban.id.notfound'
	| 'ban.parse.error'
	| 'ban.read.error'
	| 'ban.write.error'
	| 'internal.error'
	| 'search.parse.error'
	| 'search.read.error'
	| 'status.cannot.delete'
	| 'status.data.invalid'
	| 'status.has.paid'
	| 'status.mail.error'
	| 'status.parse.error'
	| 'status.payment.error'
	| 'status.read.error'
	| 'status.unchanged.invalid'
	| 'status.unpaid.dues'
	| 'status.use.approved'
	| 'status.write.error'
	| 'unknown'

export type ErrorDto = CommonErrorDto<ErrorMessage>

export interface AttendeeIdListDto {
	readonly ids: readonly number[]
}

export interface CountdownDto {
	readonly countdown: number
	readonly currentTime: string
	readonly targetTime: string
}

export type RegistrationStatus =
	| 'new'
	| 'approved'
	| 'partially paid'
	| 'paid'
	| 'checked in'
	| 'cancelled'
	| 'waiting'

export interface AttendeeStatusDto {
	readonly status: RegistrationStatus
}

const tshirtFromApi = (apiValue: string | null) => {
	if (apiValue === '3XL') {
		return 'm3XL'
	} else if (apiValue === '4XL') {
		return 'm4XL'
	} else {
		return apiValue
	}
}

const tshirtToApi = (frontendValue: string | null) => {
	if (frontendValue === 'm3XL') {
		return '3XL'
	} else if (frontendValue === 'm4XL') {
		return '4XL'
	} else {
		return frontendValue
	}
}

const nonEmpty = (v: string) => v !== ''

const optionsToFlags = (options: Readonly<Record<string, boolean>>) => Object.entries(options).filter(last).map(head).join(',')
const flagsToOptions = (flags: string) => Object.fromEntries(flags.split(',').filter(nonEmpty).map(k => [k, true] as const))

// eslint-disable-next-line complexity
const attendeeDtoFromRegistrationInfo = (registrationInfo: RegistrationInfo): AttendeeDto => ({
	id: null, // not used when submitting attendee data, contains badge number when reading them
	nickname: registrationInfo.personalInfo.nickname,
	first_name: registrationInfo.personalInfo.firstName,
	last_name: registrationInfo.personalInfo.lastName,
	street: registrationInfo.contactInfo.street,
	zip: registrationInfo.contactInfo.postalCode,
	city: registrationInfo.contactInfo.city,
	country: registrationInfo.contactInfo.country,
	spoken_languages: registrationInfo.personalInfo.spokenLanguages.join(','),
	registration_language: registrationInfo.preferredLocale,
	email: registrationInfo.contactInfo.email,
	phone: registrationInfo.contactInfo.phoneNumber,
	telegram: registrationInfo.contactInfo.telegramUsername,
	partner: null, // unused by EF
	state: registrationInfo.contactInfo.stateOrProvince, // optional, may be null
	birthday: registrationInfo.personalInfo.dateOfBirth.toISODate(),
	gender: 'notprovided',
	pronouns: registrationInfo.personalInfo.pronouns,
	tshirt_size: tshirtToApi(registrationInfo.ticketLevel.addons.tshirt.options.size),
	flags: optionsToFlags({
		...flagsToOptions(registrationInfo.originalFlags ?? ''),
		hc: registrationInfo.personalInfo.wheelchair,
		anon: !registrationInfo.personalInfo.fullNamePermission,
		'digi-book': registrationInfo.optionalInfo.digitalConbook,
		'terms-accepted': true,
	}),
	options: optionsToFlags({
		anim: registrationInfo.optionalInfo.notifications.animation,
		art: registrationInfo.optionalInfo.notifications.art,
		music: registrationInfo.optionalInfo.notifications.music,
		suit: registrationInfo.optionalInfo.notifications.fursuiting,
	}),
	packages: optionsToFlags({
		...flagsToOptions(registrationInfo.originalPackages ?? ''),
		'room-none': true,
		'attendance': registrationInfo.ticketType.type === 'full',
		'day-sun': registrationInfo.ticketType.type === 'day' && registrationInfo.ticketType.day.weekday === 7,
		'day-mon': registrationInfo.ticketType.type === 'day' && registrationInfo.ticketType.day.weekday === 1,
		'day-tue': registrationInfo.ticketType.type === 'day' && registrationInfo.ticketType.day.weekday === 2,
		'day-wed': registrationInfo.ticketType.type === 'day' && registrationInfo.ticketType.day.weekday === 3,
		'sponsor': registrationInfo.ticketLevel.level === 'sponsor',
		'sponsor2': registrationInfo.ticketLevel.level === 'super-sponsor',
		'stage': !(config.ticketLevels[registrationInfo.ticketLevel.level].includes?.includes('stage-pass') ?? false)
			&& registrationInfo.ticketLevel.addons['stage-pass'].selected,
		'tshirt': !(config.ticketLevels[registrationInfo.ticketLevel.level].includes?.includes('tshirt') ?? false)
			&& registrationInfo.ticketLevel.addons.tshirt.selected,
	}),
	user_comments: registrationInfo.optionalInfo.comments,
})

// eslint-disable-next-line complexity
const registrationInfoFromAttendeeDto = (attendeeDto: AttendeeDto): RegistrationInfo => {
	const packages = new Set(attendeeDto.packages.split(','))
	const flags = new Set(attendeeDto.flags.split(','))
	const options = new Set(attendeeDto.options.split(','))

	const days = eachDayOfInterval(Interval.fromDateTimes(config.dayTicketStartDate, config.dayTicketEndDate))
	const level = packages.has('sponsor2') ? 'super-sponsor' : packages.has('sponsor') ? 'sponsor' : 'standard'

	return {
		preferredLocale: attendeeDto.registration_language,
		/* eslint-disable @typescript-eslint/indent */
		ticketType: packages.has('attendance')
			? { type: 'full' }
			: {
				type: 'day',
				day: packages.has('day-sun') ? days.find(d => d.weekday === 7)!
					: packages.has('day-mon') ? days.find(d => d.weekday === 1)!
					: packages.has('day-tue') ? days.find(d => d.weekday === 2)!
					: packages.has('day-wed') ? days.find(d => d.weekday === 3)!
					: days.find(d => d.weekday === 3)!, // FIXME: Cough
			},
		/* eslint-enable @typescript-eslint/indent */
		ticketLevel: {
			level,
			addons: {
				'stage-pass': {
					selected: (config.ticketLevels[level].includes?.includes('stage-pass') ?? false) || packages.has('stage'),
					options: {},
				},
				tshirt: {
					selected: (config.ticketLevels[level].includes?.includes('tshirt') ?? false) || packages.has('tshirt'),
					options: {
						size: tshirtFromApi(attendeeDto.tshirt_size) as RegistrationInfo['ticketLevel']['addons']['tshirt']['options']['size'],
					},
				},
			},
		},
		personalInfo: {
			nickname: attendeeDto.nickname,
			firstName: attendeeDto.first_name,
			lastName: attendeeDto.last_name,
			dateOfBirth: DateTime.fromISO(attendeeDto.birthday),
			spokenLanguages: attendeeDto.spoken_languages.split(','),
			pronouns: attendeeDto.pronouns === '' ? null : attendeeDto.pronouns,
			wheelchair: flags.has('hc'),
			fullNamePermission: !flags.has('anon'),
		},
		contactInfo: {
			email: attendeeDto.email,
			phoneNumber: attendeeDto.phone,
			telegramUsername: attendeeDto.telegram,
			street: attendeeDto.street,
			city: attendeeDto.city,
			postalCode: attendeeDto.zip,
			stateOrProvince: attendeeDto.state,
			country: attendeeDto.country as RegistrationInfo['contactInfo']['country'],
		},
		optionalInfo: {
			comments: attendeeDto.user_comments,
			digitalConbook: flags.has('digi-book'),
			notifications: {
				animation: options.has('anim'),
				art: options.has('art'),
				fursuiting: options.has('suit'),
				music: options.has('music'),
			},
		},
		originalFlags: attendeeDto.flags,
		originalPackages: attendeeDto.packages,
	}
}

export class AttSrvAppError extends AppError<Replace<ErrorMessage, '.', '-', { all: true }>> {
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	constructor(err: AjaxError) {
		const errDto = err.response as ErrorDto

		super('attsrv', errDto.message.replaceAll('.', '-'), `Attendee API Error: ${JSON.stringify(errDto, undefined, 2)}`)
	}
}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const apiCall = <T>({ path, ...cfg }: Omit<AjaxConfig, 'url'> & { path: string }) => ajax<T>({
	url: `${config.apis.attsrv.url}${path}`,
	crossDomain: true,
	withCredentials: true,
	...cfg,
}).pipe(
	catchError(handleStandardApiErrors(AttSrvAppError)),
)

/*
 * GET /countdown checks if registration is open, or when it will open, checking that the user is logged in in the process.
 *
 * Replies with either a CountdownDto and http status 200, or ErrorDto with message "auth.unauthorized" and http status 401.
 *
 * If the countdown dto contains countdown = 0, the reg is open and the send button should be available.
 *
 * This is also the performance-optimal way to check that a user is logged in, and determine whether the user will be able
 * to submit a new registration at this point in time.
 *
 * 401: The user is not correctly logged in, or the token has expired, and you need to
 * redirect the user to the auth start, possibly setting some return URL as dropoff so the user can return to the current place,
 * which should then check this endpoint again.
 *
 * This endpoint is optimized in the backend for high traffic, so it is safe to call during initial reg.
 */
export const registrationCountdownCheck = () => apiCall<CountdownDto>({
	path: '/countdown',
	method: 'GET',
})

/*
 * POST /attendees creates a new registration.
 *
 * Replies with the resource location in the location header (ending in the assigned badge number), or an ErrorDto.
 *
 * 201: You should communicate the assigned badge number to the user, so they know they successfully registered.
 *
 * 400: This indicates a bug in this app because any validation errors should have been caught during field validation.
 * The ErrorDto's details field will contain english language messages that describe the error in detail.
 * It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 *
 * 401: The user's token has expired, and you need to redirect them to the auth start to refresh it.
 *
 * 409: Duplicate (same nickname + email + zip code).
 *
 * 500: It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 *
 * This endpoint is optimized in the backend for high traffic, so it is safe to call during initial reg.
 */
export const submitRegistration = (registrationInfo: RegistrationInfo) => apiCall({
	path: '/attendees',
	method: 'POST',
	body: attendeeDtoFromRegistrationInfo(registrationInfo),
})

/*
 * GET /attendees obtains the badge numbers of the registrations owned by the current user.
 *
 * Returns AttendeeIdListDto and status 200, or ErrorDto and 401, 404, 500.
 *
 * 401: The user's token has expired, and you need to redirect them to the auth start to refresh it.
 * 404: This user has no registrations.
 * 500: It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 *
 * This endpoint should be avoided during initial reg, as it entails a database select.
 */
export const findMyRegistrations = () => apiCall<AttendeeIdListDto>({
	path: '/attendees',
	method: 'GET',
})

/*
 * GET /attendees/{id} obtains the data for an attendee. Used to load an attendee during edit mode.
 *
 * id should come from the list returned by findMyRegistrations. Then a 400, 403, 404 should not occur.
 *
 * Returns AttendeeDto and status 200, or ErrorDto and an error status.
 *
 * 401: The user's token has expired, and you need to redirect them to the auth start to refresh it.
 * 500: It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 */
export const loadRegistration = (id: number) => apiCall<AttendeeDto>({
	path: `/attendees/${id}`,
	method: 'GET',
})

/*
 * GET /attendees/{id}/status obtains the status for an attendee.
 *
 * id should come from the list returned by findMyRegistrations. Then a 400, 403, 404 should not occur.
 *
 * Returns AttendeeDto and status 200, or ErrorDto and an error status.
 *
 * 401: The user's token has expired, and you need to redirect them to the auth start to refresh it.
 * 500: It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 */
export const loadRegistrationStatus = (id: number) => apiCall<AttendeeStatusDto>({
	path: `/attendees/${id}/status`,
	method: 'GET',
})

/*
 * PUT /attendees/{id} overwrites the data for an attendee. Used during edit mode.
 *
 * id should come from the list returned by findMyRegistration. Then a 403, 404 should not occur.
 *
 * 400: This indicates a bug in this app because any validation errors should have been caught during field validation.
 * The ErrorDto's details field will contain english language messages that describe the error in detail.
 * It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 *
 * 401: The user's token has expired, and you need to redirect them to the auth start to refresh it.
 *
 * 409: this update would lead to a duplicate registration (same nickname + email + zip code). This error
 * should be communicated to the user.
 *
 * 500: It is important to communicate the ErrorDto's requestid field to the user, so they can give it to us, so we can look in the logs.
 */
export const updateRegistration = (id: number, registrationInfo: RegistrationInfo) => apiCall({
	path: `/attendees/${id}`,
	method: 'PUT',
	body: attendeeDtoFromRegistrationInfo(registrationInfo),
})


export const findExistingRegistration = () => findMyRegistrations().pipe(
	concatMap(result =>
		combineLatest([
			loadRegistration(result.response.ids[0]),
			loadRegistrationStatus(result.response.ids[0]),
		]).pipe(
			map(([attendee, attendeeStatus]) => ({
				id: result.response.ids[0],
				status: attendeeStatus.response.status.replaceAll(' ', '-'),
				registrationInfo: registrationInfoFromAttendeeDto(attendee.response),
			})),
		),
	),
	catchError(err => {
		if (err instanceof AttSrvAppError && err.code === 'attendee-owned-notfound') {
			return of(undefined)
		} else {
			throw err
		}
	}),
)
