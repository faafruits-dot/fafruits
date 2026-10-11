import { requireTeam } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const team = await requireTeam(event)
  return { ok: true, team }
})