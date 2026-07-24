import { getSessionUser } from "@/lib/auth/session";
import HeaderClient from "./HeaderClient";

/**
 * Server component: resolves the current session on every request and hands a
 * minimal, serialisable user object to the interactive client header.
 */
export default async function Header() {
  const user = await getSessionUser();
  return (
    <HeaderClient
      user={user ? { name: user.name, initial: user.initial } : null}
    />
  );
}
