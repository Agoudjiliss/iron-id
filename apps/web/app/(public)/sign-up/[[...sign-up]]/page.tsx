import { redirect } from "next/navigation";

export default function SignUpPage() {
  redirect(
    "https://accounts.iron-id.io/sign-up?redirect_url=https%3A%2F%2Fwww.iron-id.io%2Fcertify"
  );
}
