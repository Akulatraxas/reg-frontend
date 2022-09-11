import styled from '@emotion/styled'
import { Localized } from '@fluent/react'
import { navigate } from '@reach/router'
import { RadioGroup, RadioCard } from '@eurofurence/reg-component-library'
import config from '~/config'
import { ChangeTicketDay, SubmitTicketDay } from '~/state/actions/register'
import { useFunnelForm } from '~/hooks/funnels/form'
import FullWidthRegisterFunnelLayout from '~/components/funnels/funnels/register/layout/form/full-width'
import type { ReadonlyRouteComponentProps } from '~/util/readonly-types'
import { formatISOWithOptions, eachDayOfInterval, getDay } from 'date-fns/fp'
import conCatWednesday from '~/images/con-cats/days/wednesday.png'
import conCatThursday from '~/images/con-cats/days/thursday.png'
import conCatFriday from '~/images/con-cats/days/friday.png'
import conCatSaturday from '~/images/con-cats/days/saturday.png'
import conCatSunday from '~/images/con-cats/days/sunday.png'

const Grid = styled.div`
	display: grid;
	gap: 20px;
	grid: auto-flow 1fr / repeat(3, 1fr);
`

const conCats = [conCatSunday, null, null, conCatWednesday, conCatThursday, conCatFriday, conCatSaturday]

const TicketDay = (_: ReadonlyRouteComponentProps) => {
	const { register, handleSubmit } = useFunnelForm<{ day: string }>(ChangeTicketDay, SubmitTicketDay)

	return <FullWidthRegisterFunnelLayout onNext={handleSubmit} currentStep={0}>
		<form onSubmit={handleSubmit}>
			<RadioGroup name="day">
				<Grid>
					{eachDayOfInterval({ start: config.eventStartDate, end: config.eventEndDate }).map(date =>
						<Localized id="register-ticket-day-card" key={formatISOWithOptions({ representation: 'date' }, date)} attrs={{ label: true }} vars={{ date }}>
							<RadioCard label={date.toString()} value={formatISOWithOptions({ representation: 'date' }, date)} height="346px" image={conCats[getDay(date)]!} {...register('day')}/>
						</Localized>,
					)}
				</Grid>
			</RadioGroup>
			<br/>
			<Localized id="register-change-ticket-type"><a onClick={() => navigate(-1)}>Change ticket type</a></Localized>
		</form>
	</FullWidthRegisterFunnelLayout>
}

export default TicketDay
