// app/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  // reindirizza a /slave di default
  redirect("/slave");
}
