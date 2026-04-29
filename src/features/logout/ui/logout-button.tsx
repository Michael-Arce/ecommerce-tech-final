import { Button } from '@/shared/ui'
import { useLogout } from '../model/use-logout'

export function LogoutButton() {
  const { mutate: logout, isPending } = useLogout()

  return (
    <Button variant="ghost" onClick={() => logout()} disabled={isPending}>
      Sign out
    </Button>
  )
}
