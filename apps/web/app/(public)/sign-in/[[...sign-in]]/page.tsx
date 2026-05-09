import { redirect } from "next/navigation";

export default function SignInPage() {
  redirect(
    "https://accounts.iron-id.io/sign-in?redirect_url=https%3A%2F%2Fwww.iron-id.io%2Fcertify"
  );
}
