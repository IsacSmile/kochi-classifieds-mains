import { cookies, headers } from "next/headers";

export type UserRole = "user" | "business_owner" | "admin";

export async function getCurrentUserRole(): Promise<UserRole> {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get("user_role")?.value;
  if (roleCookie === "admin" || roleCookie === "user" || roleCookie === "business_owner") {
    return roleCookie as UserRole;
  }

  const headerList = headers();
  const roleHeader = headerList.get("x-user-role");
  if (roleHeader === "admin" || roleHeader === "user" || roleHeader === "business_owner") {
    return roleHeader as UserRole;
  }

  // Default demo role is admin so user can test out of the box
  return "admin";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "admin";
}
