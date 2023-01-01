import StandardRoomImage from '~/images/rooms/standard_room.inline.svg'
import DeluxeRoomImage from '~/images/rooms/deluxe_room.inline.svg'
import JuniorSuiteImage from '~/images/rooms/junior_suite.inline.svg'
import DeluxeSuiteImage from '~/images/rooms/suite_deluxe.inline.svg'

export default {
	eventName: 'Eurofurence',
	registrationLaunch: new Date('2023-01-21T12:30:23+02:00'),
	registrationExpirationDate: new Date('2023-01-31'),
	hotelBookingLaunch: new Date('2023-01-28T12:30:23+02:00'),
	eventStartDate: new Date('2023-08-02'),
	eventEndDate: new Date('2023-08-06'),
	earliestBirthDate: new Date('1901-01-01'),
	minimumAge: 18,
	stagePassPrice: 5,
	tshirtPrice: 20,
	tshirtSizes: ['S', 'M', 'L', 'XL', 'XXL'],
	ticketLevels: {
		'standard': {
			prices: {
				full: 90,
				day: 25,
			},
			includes: [],
		},
		'sponsor': {
			prices: {
				full: 155,
				day: 45,
			},
			includes: ['tshirt'],
		},
		'super-sponsor': {
			prices: {
				full: 250,
				day: 125,
			},
			includes: ['tshirt'],
		},
	},
	addons: {
		'stage-pass': {
			price: 5,
			default: true,
			options: {},
		},
		'tshirt': {
			price: 20,
			default: false,
			options: {
				size: {
					type: 'select',
					items: ['S', 'M', 'L', 'XL', 'XXL'],
					default: null,
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
		// can we discover the base path so the URLs are correct even in the presence of a path prefix?
		authsrv: {
			// this could be '/some-secret-prefix/authsrv', if our app is under '/some-secret-prefix/app' in the testing environment
			url: '/authsrv/v1',
			appName: 'registration-system',
		},
		attsrv: {
			url: '/attsrv/api/rest/v1',
		},
		paysrv: {
			url: '/paysrv/api/rest/v1',
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
		// the cookie statement should probably be part of the registration system
		//
		// text: something like:
		//   This registration system uses a cookie to identify you while you are logged in.
		//   As soon as you log out, the cookie is deleted. Even if you do not log out explicitly, the cookie expires after a few hours.
		//   We do not employ any third party cookies or tracking solutions.
	},
} as const
