/* eslint-disable max-len */

import { withPrefix } from 'gatsby'

import StandardRoomImage from '~/images/rooms/standard_room.inline.svg'
import DeluxeRoomImage from '~/images/rooms/deluxe_room.inline.svg'
import JuniorSuiteImage from '~/images/rooms/junior_suite.inline.svg'
import DeluxeSuiteImage from '~/images/rooms/suite_deluxe.inline.svg'
import { checkConfig } from './util/config-types'
import { DateTime } from 'luxon'

// eslint-disable-next-line no-process-env
const apiPath = (path: string) => process.env.GATSBY_API_BASE_URL === undefined ? withPrefix(path) : `${process.env.GATSBY_API_BASE_URL}${path}`

const config = checkConfig({
	eventName: 'Eurofurence',
	registrationLaunch: DateTime.fromISO('2023-01-21T12:30:23+02:00'),
	registrationExpirationDate: DateTime.fromISO('2023-09-06', { zone: 'Europe/Berlin' }),
	hoursBeforeEditAvailable: 4,
	hotelBookingLaunch: DateTime.fromISO('2023-01-28T12:30:23+02:00'),
	eventStartDate: DateTime.fromISO('2023-09-03', { zone: 'Europe/Berlin' }),
	eventEndDate: DateTime.fromISO('2023-09-07', { zone: 'Europe/Berlin' }),
	dayTicketStartDate: DateTime.fromISO('2023-09-03', { zone: 'Europe/Berlin' }),
	dayTicketEndDate: DateTime.fromISO('2023-09-06', { zone: 'Europe/Berlin' }),
	earliestBirthDate: DateTime.fromISO('1901-01-01'),
	minimumAge: 18,
	allowedCountries: ['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'EA', 'TD', 'CL', 'CN', 'CX', 'CP', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'HR', 'CU', 'CW', 'CY', 'CZ', 'CI', 'DK', 'DG', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'IC', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'UM', 'US', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'],
	ticketLevels: {
		'standard': {
			prices: {
				full: 120,
				day: 70,
			},
		},
		'sponsor': {
			prices: {
				full: 200,
				day: 150,
			},
			includes: ['tshirt'],
		},
		'super-sponsor': {
			prices: {
				full: 310,
				day: 260,
			},
			includes: ['tshirt'],
		},
	},
	addons: {
		'stage-pass': {
			price: 5,
			default: true,
			options: {},
			unavailableFor: {
				type: ['day'],
			},
		},
		'tshirt': {
			price: 20,
			default: false,
			options: {
				size: {
					type: 'select',
					items: ['XS', 'wXS', 'S', 'wS', 'M', 'wM', 'L', 'wL', 'XL', 'wXL', 'XXL', 'wXXL', 'm3XL', 'w3XL', 'm4XL', 'w4XL'],
				},
			},
		},
	},
	rooms: [
		{ id: 'standard', price: 140, image: StandardRoomImage },
		{ id: 'deluxe', price: 160, image: DeluxeRoomImage },
		{ id: 'junior-suite', price: 198, image: JuniorSuiteImage },
		{ id: 'deluxe-suite', price: 228, image: DeluxeSuiteImage },
	],
	apis: {
		authsrv: {
			// this could be '/some-secret-prefix/authsrv', if our app is under '/some-secret-prefix/app' in the testing environment
			url: apiPath('/authsrv/v1'),
			appName: 'registration-system',
		},
		attsrv: {
			url: apiPath('/attsrv/api/rest/v1'),
		},
		paysrv: {
			url: apiPath('/paysrv/api/rest/v1'),
		},
	},
	websiteLinks: {
		// these two links need to be in the footer bar on each page
		privacyStatement: 'https://help.eurofurence.org/legal/privacy',
		imprint: 'https://help.eurofurence.org/legal/imprint',
		// further links we may need
		policies: 'https://www.eurofurence.org/EF27/policies',
		hotelInfo: 'https://www.eurofurence.org/EF27/hotel',
		terms: 'https://help.eurofurence.org/legal/terms',
		rules: 'https://help.eurofurence.org/legal/roc',
		waiver: 'https://help.eurofurence.org/legal/liability',
		contact: 'https://help.eurofurence.org/contact',
		// TODO do we need to display this in a popup?
		//
		// the cookie statement should probably be part of the registration system
		//
		// text: something like:
		//   This registration system uses cookies to identify you while you are logged in.
		//   As soon as you log out, the cookies are deleted. Even if you do not log out explicitly, the cookies expire after a few hours.
		//   We do not employ any third party cookies or tracking solutions.
	},
} as const)

export default config
